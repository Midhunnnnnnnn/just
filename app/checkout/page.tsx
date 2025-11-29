"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* -------------------- Types -------------------- */
interface GuestRow {
  id: string;
  name: string;
  room_ids: string[]; // uuids
  base_amount: number;
  booked_days: number;
  check_in: string;
  email?: string | null;
}

interface RoomRow {
  id: string;
  room_number: string;
  status?: string;
  price_per_day?: number;
}

/* -------------------- Helpers -------------------- */
const formatCheckIn = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
};

const formatDateForFilename = (date: Date) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const clamp = (v: number) => (Number.isFinite(v) ? v : 0);

/* -------------------- Component -------------------- */
export default function CheckoutPage() {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [now, setNow] = useState<Date>(() => new Date());
  const [selectedGuestRooms, setSelectedGuestRooms] = useState<Record<string, RoomRow[]>>({});
  const [staffNotes, setStaffNotes] = useState<Record<string, string>>({});
  const [manualExtra, setManualExtra] = useState<Record<string, number>>({});
  const [manualTotal, setManualTotal] = useState<Record<string, number>>({});
  const invoiceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);

  /* --- Live time updater (updates every 60s) --- */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  /* --- Fetch guests currently checked-in --- */
  const fetchGuests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("status", "checked-in")
      .order("check_in", { ascending: false });

    if (error) {
      console.error("fetchGuests error:", error);
      setGuests([]);
      setLoading(false);
      return;
    }

    const rows: GuestRow[] = (data ?? []) as GuestRow[];
    setGuests(rows);

    // fetch rooms for each guest (in parallel)
    const allRoomIds = Array.from(new Set(rows.flatMap((g) => g.room_ids ?? [])));
    if (allRoomIds.length) {
      const { data: roomsData, error: roomsErr } = await supabase
        .from("rooms")
        .select("id, room_number, status, room_types (name, base_price)")
        .in("id", allRoomIds);

      if (roomsErr) {
        console.error("fetch rooms error:", roomsErr);
      } else {
        // map rooms by id
        const byId = new Map<string, RoomRow>();
        (roomsData ?? []).forEach((r: any) => {
          byId.set(r.id, {
            id: r.id,
            room_number: r.room_number,
            status: r.status,
            price_per_day: r.room_types?.base_price ?? undefined,
          });
        });

        const grouped: Record<string, RoomRow[]> = {};
        rows.forEach((g) => {
          grouped[g.id] = (g.room_ids ?? []).map((rid) => byId.get(rid) ?? { id: rid, room_number: rid, price_per_day: undefined });
        });
        setSelectedGuestRooms(grouped);
      }
    } else {
      setSelectedGuestRooms({});
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- Billing logic -------------------- */
  const calculateBill = (guest: GuestRow) => {
    const nowTime = now.getTime();
    const checkInTime = new Date(guest.check_in).getTime();
    const hoursStayed = Math.max(0, Math.ceil((nowTime - checkInTime) / (1000 * 60 * 60)));
    const bookedHours = clamp(guest.booked_days) * 24;
    const extraHours = Math.max(0, hoursStayed - bookedHours);

    // room-wise breakdown:
    const rooms = selectedGuestRooms[guest.id] ?? [];
    const defaultRoomCount = Math.max(1, rooms.length);
    const roomPrices = rooms.map((r) => r.price_per_day ?? null);

    // compute base per-day total price:
    let basePerDayTotal: number | undefined = undefined;
    if (roomPrices.every((p) => p != null)) {
      basePerDayTotal = roomPrices.reduce((s, v) => s + (v ?? 0), 0);
    } else {
      if (guest.base_amount != null && guest.booked_days > 0) {
        basePerDayTotal = clamp(guest.base_amount) / clamp(guest.booked_days);
      }
    }

    // per-room breakdown (per day)
    const roomBreakdown = rooms.map((r) => {
      const pricePerDay = r.price_per_day ?? (basePerDayTotal ? basePerDayTotal / defaultRoomCount : 0);
      const subtotal = pricePerDay * clamp(guest.booked_days);
      return {
        roomNumber: r.room_number,
        pricePerDay: Number(pricePerDay.toFixed(2)),
        days: guest.booked_days,
        subtotal: Number(subtotal.toFixed(2)),
      };
    });

    // base total (if base_amount present use it; otherwise sum roomBreakdown subtotals)
    const baseTotal =
      guest.base_amount != null
        ? clamp(Number(guest.base_amount))
        : roomBreakdown.reduce((s, r) => s + r.subtotal, 0);

    // extra charge default per extra hour (200)
    const defaultExtraCharge = extraHours * 200;

    // apply manual override if present
    const manualExtraVal = manualExtra[guest.id] ?? undefined;
    const manualTotalVal = manualTotal[guest.id] ?? undefined;

    const appliedExtra = manualExtraVal != null ? manualExtraVal : defaultExtraCharge;
    const computedTotal = manualTotalVal != null ? manualTotalVal : baseTotal + appliedExtra;

    return {
      hoursStayed,
      extraHours,
      defaultExtraCharge,
      appliedExtra,
      baseTotal: Number(baseTotal.toFixed(2)),
      computedTotal: Number(computedTotal),
      roomBreakdown,
    };
  };

  /* -------------------- PDF generation -------------------- */
  const generatePDFforGuest = async (guest: GuestRow) => {
    const node = invoiceRefs.current[guest.id];
    if (!node) {
      alert("Invoice area not ready");
      return;
    }

    // render to canvas
    const canvas = await html2canvas(node, { 
      scale: 2,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const margin = 10;
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - margin * 2;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", margin, 10, pdfWidth, pdfHeight);
    
    // Improved file naming with guest name and date
    const guestNameForFile = guest.name.replace(/[^a-zA-Z0-9]/g, "_");
    const dateStr = formatDateForFilename(new Date());
    const fileName = `Invoice_${guestNameForFile}_${dateStr}.pdf`;
    
    pdf.save(fileName);
    return pdf;
  };

  /* -------------------- Print invoice -------------------- */
  const printInvoice = async (guest: GuestRow) => {
    const node = invoiceRefs.current[guest.id];
    if (!node) {
      alert("Invoice not ready");
      return;
    }
    const html = node.outerHTML;
    const printWindow = window.open("", "_blank", "width=800,height=1100");
    if (!printWindow) {
      alert("Unable to open print window");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${guest.name}</title>
          <style>
            body { 
              font-family: 'Georgia', 'Times New Roman', serif; 
              color: #000; 
              background: #fff; 
              padding: 24px;
              margin: 0;
            }
            .invoice-container { 
              max-width: 210mm; 
              margin: 0 auto; 
              border: 2px solid #1a1a1a; 
              padding: 25px; 
              background: #fff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header { 
              border-bottom: 3px double #1a1a1a; 
              padding-bottom: 20px; 
              margin-bottom: 20px;
            }
            .h1 { 
              font-size: 28px; 
              font-weight: 700; 
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
              letter-spacing: 0.5px;
            }
            .guest-info {
              background: #f8f8f8;
              padding: 15px;
              border-left: 4px solid #1a1a1a;
              margin: 15px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              font-size: 14px;
            }
            th { 
              background: #1a1a1a; 
              color: white; 
              padding: 12px 8px;
              font-weight: 600;
              text-align: left;
            }
            td { 
              padding: 10px 8px; 
              border-bottom: 1px solid #ddd;
            }
            .total-section {
              border-top: 2px solid #1a1a1a;
              padding-top: 15px;
              margin-top: 20px;
            }
            .final-total {
              font-size: 18px;
              font-weight: 700;
              color: #1a1a1a;
            }
            @media print {
              body { padding: 0; }
              .invoice-container { 
                border: none; 
                box-shadow: none;
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">${html}</div>
          <script>window.focus(); setTimeout(() => window.print(), 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /* -------------------- Email invoice -------------------- */
  const emailInvoice = async (guest: GuestRow) => {
    try {
      setSendingEmailFor(guest.id);
      const node = invoiceRefs.current[guest.id];
      if (!node) {
        alert("Invoice area not ready");
        setSendingEmailFor(null);
        return;
      }
      const canvas = await html2canvas(node, { 
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const margin = 10;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - margin * 2;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", margin, 10, pdfWidth, pdfHeight);
      const blob = pdf.output("blob");
      
      const guestNameForFile = guest.name.replace(/[^a-zA-Z0-9]/g, "_");
      const dateStr = formatDateForFilename(new Date());
      const filename = `Invoice_${guestNameForFile}_${dateStr}.pdf`;

      const form = new FormData();
      form.append("file", blob, filename);
      form.append("guestId", guest.id);
      form.append("guestName", guest.name);
      form.append("email", guest.email ?? "");
      form.append("notes", staffNotes[guest.id] ?? "");

      const res = await fetch("/api/invoice/send", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Email invoice failed:", txt);
        alert("Failed to send email invoice");
      } else {
        alert("Invoice emailed successfully");
      }
    } catch (err) {
      console.error("emailInvoice error", err);
      alert("Failed to create/send invoice");
    } finally {
      setSendingEmailFor(null);
    }
  };

  /* -------------------- Perform Checkout -------------------- */
const doCheckout = async (guest: GuestRow) => {
  const bill = calculateBill(guest);

  const confirmText = `Proceed to checkout ${guest.name} — Total ₹${bill.computedTotal}?`;
  if (!confirm(confirmText)) return;

  const payload: any = {
    status: "checked-out",
    check_out: new Date().toISOString(),
    extra_hours: bill.extraHours,
    extra_charge: bill.appliedExtra,
    total_charge: bill.computedTotal,
  };

  if (staffNotes[guest.id]) payload.staff_notes = staffNotes[guest.id];

  // -------------------- Update Guest --------------------
  const { error: guestErr } = await supabase.from("guests").update(payload).eq("id", guest.id);
  if (guestErr) {
    console.error("guest update failed", guestErr);
    alert("Failed to checkout guest (guest update)");
    return;
  }

  // -------------------- Update Room(s) --------------------
  const { error: roomsErr } = await supabase
    .from("rooms")
    .update({ status: "housekeeping", current_guest_id: null })
    .in("id", guest.room_ids);

  if (roomsErr) {
    console.error("rooms update failed", roomsErr);
    alert("Failed to checkout guest (rooms update)");
    return;
  }

  // -------------------- SAVE TO ACCOUNTS (FINANCE MODULE) --------------------
  try {
    await fetch("/api/accounts/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_id: guest.id,
        room_id: guest.room_ids[0], // first room for now
        base_amount: bill.baseTotal,
        extra_hours: bill.extraHours,
        extra_charge: bill.appliedExtra,
        total_amount: bill.computedTotal,
      }),
    });
  } catch (err) {
    console.error("Failed to save to accounts:", err);
  }

  alert("Checked out successfully");
  fetchGuests();
};


  /* -------------------- Render -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Guest Checkout</h1>
          <p className="text-gray-600 text-center text-lg">Manage guest checkouts and generate professional invoices</p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-700 mx-auto mt-4 rounded-full"></div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : guests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-gray-500 text-xl">No guests currently checked-in</div>
            <button 
              onClick={fetchGuests}
              className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {guests.map((guest) => {
              const bill = calculateBill(guest);

              return (
                <div key={guest.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  {/* Guest Summary Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{guest.name}</h2>
                        <p className="text-gray-300 mt-1">
                          Check-in: {formatCheckIn(guest.check_in)} • 
                          Rooms: {(selectedGuestRooms[guest.id] ?? []).map(r => r.room_number).join(", ") || "—"}
                        </p>
                      </div>
                      <div className="mt-4 lg:mt-0 text-right">
                        <div className="text-3xl font-bold">₹{bill.computedTotal.toFixed(2)}</div>
                        <div className="text-gray-300">Total Amount</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Invoice preview area (A4 format for PDF) */}
                    <div
                      ref={(el) => (invoiceRefs.current[guest.id] = el)}
                      className="bg-white mx-auto border-2 border-gray-900 p-8"
                      style={{ 
                        maxWidth: '210mm',
                        minHeight: '297mm',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Invoice Header */}
                      <div className="border-b-2 border-double border-gray-900 pb-6 mb-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">RESORT INVOICE</h1>
                            <p className="text-gray-600 text-sm uppercase tracking-wider">Classic Black & White</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">{guest.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{formatCheckIn(guest.check_in)}</div>
                            <div className="text-sm text-gray-600">
                              Generated: {now.toLocaleString("en-IN", { 
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: "numeric", 
                                minute: "2-digit", 
                                hour12: true 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Guest Information */}
                      <div className="bg-gray-50 p-4 border-l-4 border-gray-900 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Guest:</strong> {guest.name}
                          </div>
                          <div>
                            <strong>Email:</strong> {guest.email || "—"}
                          </div>
                          <div>
                            <strong>Rooms:</strong> {(selectedGuestRooms[guest.id] ?? []).map(r => r.room_number).join(", ") || "—"}
                          </div>
                          <div>
                            <strong>Booked Days:</strong> {guest.booked_days}
                          </div>
                        </div>
                      </div>

                      {/* Room Breakdown Table */}
                      <table className="w-full border-collapse mb-8">
                        <thead>
                          <tr>
                            <th className="bg-gray-900 text-white p-3 text-left font-semibold">Room</th>
                            <th className="bg-gray-900 text-white p-3 text-left font-semibold">Price / Day</th>
                            <th className="bg-gray-900 text-white p-3 text-left font-semibold">Days</th>
                            <th className="bg-gray-900 text-white p-3 text-left font-semibold">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bill.roomBreakdown.map((rb, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="p-3 border-b border-gray-200">{rb.roomNumber}</td>
                              <td className="p-3 border-b border-gray-200">₹{rb.pricePerDay.toFixed(2)}</td>
                              <td className="p-3 border-b border-gray-200">{rb.days}</td>
                              <td className="p-3 border-b border-gray-200">₹{rb.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Calculation Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <h3 className="font-semibold text-lg mb-4 border-b border-gray-300 pb-2">Stay Details</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Hours Stayed:</span>
                              <span>{bill.hoursStayed} hrs</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Extra Hours:</span>
                              <span>{bill.extraHours} hrs</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Extra Charge (₹200/hr):</span>
                              <span>₹{bill.defaultExtraCharge}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-4 border-b border-gray-300 pb-2">Amount Summary</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Base Total:</span>
                              <span>₹{bill.baseTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Extra Charges:</span>
                              <span>₹{bill.appliedExtra}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg border-t border-gray-300 pt-2">
                              <span>Total Amount:</span>
                              <span>₹{bill.computedTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Manual Overrides and Notes */}
                      <div className="border-t border-gray-300 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-semibold mb-2">Manual Extra Charge</label>
                            <input
                              type="number"
                              value={manualExtra[guest.id] ?? ""}
                              onChange={(e) => setManualExtra(prev => ({ ...prev, [guest.id]: e.target.value === "" ? undefined : Number(e.target.value) }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              placeholder="₹ Override amount"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Manual Total Override</label>
                            <input
                              type="number"
                              value={manualTotal[guest.id] ?? ""}
                              onChange={(e) => setManualTotal(prev => ({ ...prev, [guest.id]: e.target.value === "" ? undefined : Number(e.target.value) }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              placeholder="₹ Total override"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Staff Notes</label>
                          <textarea
                            value={staffNotes[guest.id] ?? ""}
                            onChange={(e) => setStaffNotes(prev => ({ ...prev, [guest.id]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            rows={3}
                            placeholder="Damage charges, minibar, special requests..."
                          />
                        </div>
                      </div>

                      {/* Final Total */}
                      <div className="border-t-2 border-double border-gray-900 mt-8 pt-6 text-center">
                        <div className="text-2xl font-bold">Total Due: ₹{bill.computedTotal.toFixed(2)}</div>
                        <div className="text-sm text-gray-600 mt-2">Thank you for your stay!</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3 justify-end">
                      <button
                        onClick={() => generatePDFforGuest(guest)}
                        className="px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-200 font-semibold"
                      >
                        Download PDF
                      </button>

                      <button
                        onClick={() => printInvoice(guest)}
                        className="px-6 py-3 border-2 border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200 font-semibold"
                      >
                        Print Receipt
                      </button>

                      <button
                        onClick={() => emailInvoice(guest)}
                        className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold"
                        disabled={sendingEmailFor === guest.id}
                      >
                        {sendingEmailFor === guest.id ? "Sending..." : "Email Invoice"}
                      </button>

                      <button
                        onClick={() => doCheckout(guest)}
                        className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all duration-200 font-semibold shadow-lg"
                      >
                        Confirm Checkout
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}