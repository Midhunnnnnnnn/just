"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

/* -------------------------
   Types
------------------------- */
type VendorCategory = "General" | "Food & Dairy" | "Services" | "Maintenance";

interface VendorBill {
  id: string;
  vendor: string;
  category: VendorCategory;
  amount: number;
  invoiceNumber?: string;
  dateRaised: string; // ISO date
  dueDays?: number; // optional override
  status: "Pending" | "Settled";
  attachments?: { id: string; name: string; dataUrl?: string }[];
  notes?: string;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  reason: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected";
}

interface PurchaseBill {
  id: string;
  purchaser: string;
  items: { name: string; qty: number; amount: number }[];
  total: number;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  attachments?: { id: string; name: string; dataUrl?: string }[];
}

interface BookingSummary {
  resort: string;
  bookingId: string;
  guestName: string;
  rooms: number;
  totalAmount: number;
  checkin: string;
  checkout: string;
  status: "Active" | "Completed" | "Upcoming";
}

interface LedgerEntry {
  id: string;
  date: string;
  account: string;
  type: "Debit" | "Credit";
  amount: number;
  note?: string;
}

/* -------------------------
   Constants, helpers
------------------------- */

const LOCAL_KEY = "super_admin_demo_v1";

const DEFAULT_THRESHOLDS: Record<VendorCategory, number> = {
  General: 7,
  "Food & Dairy": 30,
  Services: 14,
  Maintenance: 14,
};

const uid = (prefix = "") => `${prefix}${Date.now()}${Math.floor(Math.random() * 9999)}`;

function daysBetweenISO(iso: string) {
  const d1 = new Date(iso);
  const d2 = new Date();
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/* -------------------------
   Seed examples
------------------------- */

function seedVendorBills(): VendorBill[] {
  const today = new Date().toISOString().split("T")[0];
  const older = new Date(Date.now() - 10 * 24 * 3600).toISOString().split("T")[0];
  const dairyOld = new Date(Date.now() - 31 * 24 * 3600).toISOString().split("T")[0];

  return [
    {
      id: uid("vb_"),
      vendor: "Green Farms Dairy",
      category: "Food & Dairy",
      amount: 12500,
      invoiceNumber: "DF-2025-101",
      dateRaised: dairyOld,
      status: "Pending",
      notes: "Milk + curd delivery for daily breakfast",
    },
    {
      id: uid("vb_"),
      vendor: "Local Veg Supplier",
      category: "General",
      amount: 4200,
      invoiceNumber: "VG-556",
      dateRaised: older,
      status: "Pending",
    },
    {
      id: uid("vb_"),
      vendor: "AC Repairs Co.",
      category: "Maintenance",
      amount: 9800,
      invoiceNumber: "MA-88",
      dateRaised: today,
      status: "Pending",
    },
  ];
}

function seedLeaveRequests(): LeaveRequest[] {
  return [
    {
      id: uid("lv_"),
      employeeName: "Neha Sharma",
      reason: "Medical leave (3 days)",
      days: 3,
      status: "Pending",
    },
    {
      id: uid("lv_"),
      employeeName: "Ravi Kumar",
      reason: "Personal emergency (1 day)",
      days: 1,
      status: "Pending",
    },
  ];
}

function seedPurchaseBills(): PurchaseBill[] {
  return [
    {
      id: uid("pb_"),
      purchaser: "Inventory Manager",
      items: [
        { name: "Rice (50kg)", qty: 2, amount: 5600 },
        { name: "Cooking Oil (20L)", qty: 1, amount: 4000 },
      ],
      total: 9600,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    },
  ];
}

function seedBookings(): BookingSummary[] {
  return [
    {
      resort: "Mountain Pass Resort",
      bookingId: "BKG-1001",
      guestName: "John Doe",
      rooms: 2,
      totalAmount: 11200,
      checkin: new Date().toISOString().split("T")[0],
      checkout: new Date(Date.now() + 2 * 24 * 3600).toISOString().split("T")[0],
      status: "Active",
    },
    {
      resort: "Sea Breeze Retreat",
      bookingId: "BKG-2033",
      guestName: "Asha Menon",
      rooms: 1,
      totalAmount: 6800,
      checkin: new Date(Date.now() + 5 * 24 * 3600).toISOString().split("T")[0],
      checkout: new Date(Date.now() + 7 * 24 * 3600).toISOString().split("T")[0],
      status: "Upcoming",
    },
  ];
}

function seedLedger(): LedgerEntry[] {
  const now = new Date().toISOString().split("T")[0];
  return [
    { id: uid("ld_"), date: now, account: "Cash", type: "Credit", amount: 50000, note: "Opening cash" },
    { id: uid("ld_"), date: now, account: "Revenue_Room", type: "Credit", amount: 24000, note: "Today rooms" },
    { id: uid("ld_"), date: now, account: "Expense_Food", type: "Debit", amount: 6000, note: "Food purchases" },
  ];
}

/* -------------------------
   Component
------------------------- */

export default function SuperAdminPage() {
  // state slices — would be replaced by API calls in production
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>([]);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    billId: "",
    amount: 0,
    mode: "Cash",
    note: "",
  });

  // load or seed on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setVendorBills(parsed.vendorBills ?? seedVendorBills());
        setLeaveRequests(parsed.leaveRequests ?? seedLeaveRequests());
        setPurchaseBills(parsed.purchaseBills ?? seedPurchaseBills());
        setBookings(parsed.bookings ?? seedBookings());
        setLedger(parsed.ledger ?? seedLedger());
      } else {
        // initial seed
        const vb = seedVendorBills();
        const lv = seedLeaveRequests();
        const pb = seedPurchaseBills();
        const bk = seedBookings();
        const ld = seedLedger();
        setVendorBills(vb);
        setLeaveRequests(lv);
        setPurchaseBills(pb);
        setBookings(bk);
        setLedger(ld);
        localStorage.setItem(
          LOCAL_KEY,
          JSON.stringify({ vendorBills: vb, leaveRequests: lv, purchaseBills: pb, bookings: bk, ledger: ld })
        );
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // persist helper
  useEffect(() => {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ vendorBills, leaveRequests, purchaseBills, bookings, ledger })
    );
  }, [vendorBills, leaveRequests, purchaseBills, bookings, ledger]);

  /* -------------------------
     Vendor Bills — settle / highlight threshold
  ------------------------- */

  function vendorDaysOld(v: VendorBill) {
    return daysBetweenISO(v.dateRaised);
  }

  function vendorThreshold(v: VendorBill) {
    return v.dueDays ?? DEFAULT_THRESHOLDS[v.category];
  }

  function isOverdue(v: VendorBill) {
    return vendorDaysOld(v) > vendorThreshold(v) && v.status === "Pending";
  }

  function markVendorSettled(billId: string, paymentMode = "Cash", note = "") {
    setVendorBills(prev => prev.map(b => b.id === billId ? { ...b, status: "Settled" } : b));
    // record ledger entry: debit AccountsPayable? For demo we'll credit Cash (decrease cash)
    const bill = vendorBills.find(b => b.id === billId);
    if (!bill) {
      toast.error("Bill not found.");
      return;
    }

    const entry: LedgerEntry = {
      id: uid("ld_"),
      date: new Date().toISOString().split("T")[0],
      account: paymentMode === "Cash" ? "Cash" : "Bank",
      type: "Debit", // money out
      amount: bill.amount,
      note: `Vendor bill settled: ${bill.vendor} (${bill.invoiceNumber ?? "—"})`,
    };
    setLedger(prev => [entry, ...prev]);
    toast.success(`Marked ${bill.vendor} bill as settled and recorded ${paymentMode} payment.`);
  }

  /* -------------------------
     Purchase Bills — approve/reject
  ------------------------- */

  function approvePurchaseBill(pbId: string, approve: boolean) {
    setPurchaseBills(prev => prev.map(p => p.id === pbId ? { ...p, status: approve ? "Approved" : "Rejected" } : p));
    toast.success(approve ? "Purchase approved" : "Purchase rejected");
  }

  /* -------------------------
     Leave Requests — approve/reject
  ------------------------- */

  function handleLeaveAction(id: string, approve: boolean) {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: approve ? "Approved" : "Rejected" } : l));
    toast.success(approve ? "Leave approved" : "Leave rejected");
  }

  /* -------------------------
     Bookings summary actions (mock)
  ------------------------- */

  function refreshBookingsFromLocalStorage() {
    // try to read bookingData from other pages (example)
    const raw = localStorage.getItem("bookingData");
    if (!raw) {
      toast.info("No external bookingData found in localStorage.");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      // for demo, map that into booking summary entries
      const newBookings: BookingSummary[] = (parsed.selectedRooms ?? []).map((r: any, i: number) => ({
        resort: "Imported Resort",
        bookingId: `IMP-${Date.now()}-${i}`,
        guestName: parsed.form?.name ?? "Guest",
        rooms: 1,
        totalAmount: (parsed.totalPrice ?? 0) / Math.max((parsed.selectedRooms?.length ?? 1), 1),
        checkin: parsed.date ? new Date(parsed.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        checkout: new Date(Date.now() + ((parsed.form?.days ?? 1) * 24 * 3600)).toISOString().split("T")[0],
        status: "Active",
      }));
      setBookings(prev => [...newBookings, ...prev]);
      toast.success("Imported bookings from bookingData (localStorage).");
    } catch (err) {
      toast.error("Failed to parse bookingData.");
    }
  }

  /* -------------------------
     Cash Allocation: super admin records cash used for local purchases
  ------------------------- */

  function openPaymentDialogForBill(billId: string) {
    setPaymentForm({ billId, amount: vendorBills.find(b => b.id === billId)?.amount ?? 0, mode: "Cash", note: "" });
    setShowPaymentDialog(true);
  }

  function recordCashPayment() {
    const { billId, amount, mode, note } = paymentForm;
    if (!billId) {
      toast.error("No bill selected");
      return;
    }
    markVendorSettled(billId, mode, note);
    setShowPaymentDialog(false);
  }

  /* -------------------------
     Revenue summary helper
  ------------------------- */

  const totalRevenue = ledger.filter(l => l.account.startsWith("Revenue") && l.type === "Credit").reduce((s, e) => s + e.amount, 0);
  const totalExpenses = ledger.filter(l => l.type === "Debit").reduce((s, e) => s + e.amount, 0);
  const cashOnHand = ledger.filter(l => l.account === "Cash").reduce((s, e) => e.type === "Credit" ? s + e.amount : s - e.amount, 0);

  /* -------------------------
     Render
  ------------------------- */

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold">🛡️ Super Admin Dashboard</h1>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">₹{totalRevenue.toLocaleString("en-IN")}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">₹{totalExpenses.toLocaleString("en-IN")}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cash On Hand</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-green-600">₹{cashOnHand.toLocaleString("en-IN")}</CardContent>
        </Card>
      </div>

      {/* Vendor bills list */}
      <Card>
        <CardHeader><CardTitle>Vendor Bills (Pending → Settled)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Vendor</th>
                  <th>Category</th>
                  <th>Invoice</th>
                  <th>Raised</th>
                  <th>Age (days)</th>
                  <th>Threshold (days)</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorBills.map(v => {
                  const age = vendorDaysOld(v);
                  const thresh = vendorThreshold(v);
                  const overdue = isOverdue(v);
                  return (
                    <tr key={v.id} className={`border-b ${overdue ? "bg-red-50" : ""}`}>
                      <td className="p-2">{v.vendor}</td>
                      <td>{v.category}</td>
                      <td>{v.invoiceNumber ?? "-"}</td>
                      <td>{v.dateRaised}</td>
                      <td>{age}</td>
                      <td>{thresh}</td>
                      <td>₹{v.amount.toLocaleString("en-IN")}</td>
                      <td>{v.status}</td>
                      <td className="space-x-2">
                        {v.status === "Pending" && (
                          <>
                            <Button size="sm" onClick={() => openPaymentDialogForBill(v.id)}>Record Payment</Button>
                            <Button size="sm" variant="outline" onClick={() => markVendorSettled(v.id)}>Mark Settled</Button>
                          </>
                        )}
                        {v.status === "Settled" && <span className="text-xs text-gray-500">Settled</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Bills */}
      <Card>
        <CardHeader><CardTitle>Purchase Bills (Approve / Reject)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {purchaseBills.map(pb => (
              <div key={pb.id} className="p-3 border rounded bg-white flex justify-between">
                <div>
                  <div className="font-semibold">{pb.purchaser} • {pb.date}</div>
                  <div className="text-sm">Total: ₹{pb.total.toLocaleString("en-IN")}</div>
                  <div className="text-xs mt-1">{pb.items.map(i => `${i.name} x${i.qty} (₹${i.amount})`).join(", ")}</div>
                </div>
                <div className="flex items-center gap-2">
                  {pb.status === "Pending" ? (
                    <>
                      <Button size="sm" onClick={() => approvePurchaseBill(pb.id, true)}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => approvePurchaseBill(pb.id, false)}>Reject</Button>
                    </>
                  ) : <div className="text-sm">{pb.status}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave requests */}
      <Card>
        <CardHeader><CardTitle>Leave Applications</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaveRequests.map(l => (
              <div key={l.id} className="p-3 border rounded bg-white flex justify-between">
                <div>
                  <div className="font-semibold">{l.employeeName} • {l.days} day(s)</div>
                  <div className="text-sm">{l.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  {l.status === "Pending" ? (
                    <>
                      <Button size="sm" onClick={() => handleLeaveAction(l.id, true)}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleLeaveAction(l.id, false)}>Reject</Button>
                    </>
                  ) : <div className="text-sm">{l.status}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bookings across resorts (mock) */}
      <Card>
        <CardHeader><CardTitle>All Resorts — Current Bookings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button onClick={refreshBookingsFromLocalStorage}>Import bookingData from localStorage</Button>
              <Button variant="outline" onClick={() => {
                const csv = bookings.map(b => `${b.resort},${b.bookingId},${b.guestName},${b.rooms},${b.totalAmount},${b.checkin},${b.checkout},${b.status}`).join("\n");
                const win = window.open("");
                win?.document.write(`<pre>${csv}</pre>`);
                win?.print();
              }}>Print Bookings</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Resort</th>
                    <th>Booking ID</th>
                    <th>Guest</th>
                    <th>Rooms</th>
                    <th>Amount</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.bookingId} className="border-b">
                      <td className="p-2">{b.resort}</td>
                      <td>{b.bookingId}</td>
                      <td>{b.guestName}</td>
                      <td>{b.rooms}</td>
                      <td>₹{b.totalAmount}</td>
                      <td>{b.checkin}</td>
                      <td>{b.checkout}</td>
                      <td>{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger / Cash Allocation */}
      <Card>
        <CardHeader><CardTitle>Ledger & Cash Allocation</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Record Cash Payment (for vendor / local purchase)</Label>
              <Input placeholder="Bill ID (paste vendor bill id)" value={paymentForm.billId} onChange={(e) => setPaymentForm(s => ({ ...s, billId: e.target.value }))} />
              <Input type="number" placeholder="Amount" value={paymentForm.amount} onChange={(e) => setPaymentForm(s => ({ ...s, amount: Number(e.target.value) }))} className="mt-2" />
              <Input placeholder="Note" value={paymentForm.note} onChange={(e) => setPaymentForm(s => ({ ...s, note: e.target.value }))} className="mt-2" />
              <div className="flex gap-2 mt-2">
                <Button onClick={() => openPaymentDialogForBill(paymentForm.billId)}>Prepare</Button>
                <Button variant="outline" onClick={() => { setPaymentForm({ billId: "", amount: 0, mode: "Cash", note: "" }); toast.success("Cleared"); }}>Clear</Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold">Recent Ledger Entries</div>
                <Button variant="outline" onClick={() => {
                  const win = window.open("");
                  win?.document.write(`<pre>${JSON.stringify(ledger.slice(0,50), null, 2)}</pre>`);
                  win?.print();
                }}>Print Ledger</Button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Date</th>
                      <th>Account</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map(l => (
                      <tr key={l.id} className="border-b">
                        <td className="p-2">{l.date}</td>
                        <td>{l.account}</td>
                        <td>{l.type}</td>
                        <td>₹{l.amount.toLocaleString("en-IN")}</td>
                        <td>{l.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment dialog for marking vendor settled */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment / Settle Bill</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Bill ID</Label>
            <Input value={paymentForm.billId} onChange={(e) => setPaymentForm(s => ({ ...s, billId: e.target.value }))} />
            <Label>Amount</Label>
            <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm(s => ({ ...s, amount: Number(e.target.value) }))} />
            <Label>Mode</Label>
            <select value={paymentForm.mode} onChange={(e) => setPaymentForm(s => ({ ...s, mode: e.target.value }))} className="w-full border rounded p-2">
              <option>Cash</option>
              <option>Bank</option>
              <option>UPI</option>
            </select>
            <Label>Note</Label>
            <Input value={paymentForm.note} onChange={(e) => setPaymentForm(s => ({ ...s, note: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
              <Button onClick={recordCashPayment}>Record & Settle</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
