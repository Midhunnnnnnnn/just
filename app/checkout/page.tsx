"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Room {
  id: number
  name: string
  category: "Deluxe" | "Executive" | "Suite"
  pricePerDay: number
}

interface BookingData {
  date?: string
  selectedRooms: Room[]
  form: {
    name: string
    passportNumber: string
    days: number
    manualPrice: string
  }
  totalPrice: number
}

export default function CheckoutPage() {
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [gstEnabled, setGstEnabled] = useState(false)
  const [gstin, setGstin] = useState("")
  const [gstAmount, setGstAmount] = useState(0)
  const [finalTotal, setFinalTotal] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem("bookingData")
    if (stored) {
      const parsed = JSON.parse(stored)
      setBooking(parsed)
    } else {
      toast.error("⚠️ No booking data found.")
    }
  }, [])

  useEffect(() => {
    if (booking) {
      const gstValue = gstEnabled ? booking.totalPrice * 0.18 : 0
      setGstAmount(gstValue)
      setFinalTotal(booking.totalPrice + gstValue)
    }
  }, [gstEnabled, booking])

  const handlePrint = () => {
    window.print()
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No booking data available.
      </div>
    )
  }

  const { form, selectedRooms, totalPrice } = booking

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <Card className="max-w-3xl w-full shadow-md border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🧾 Resort Billing & Checkout
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Guest Name</Label>
              <Input value={form.name} readOnly className="bg-gray-100" />
            </div>

            <div>
              <Label>Passport Number</Label>
              <Input
                value={form.passportNumber}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label>Number of Days</Label>
              <Input value={form.days} readOnly className="bg-gray-100" />
            </div>

            <div>
              <Label>Booking Date</Label>
              <Input
                value={booking.date ? new Date(booking.date).toDateString() : ""}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="font-semibold text-lg mb-3">🏠 Room Details</h2>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Room</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Rate (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRooms.map((room) => (
                    <tr key={room.id} className="border-t">
                      <td className="p-2">{room.name}</td>
                      <td className="p-2">{room.category}</td>
                      <td className="p-2">{room.pricePerDay.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Subtotal</Label>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center justify-between">
              <Label>Include GST (18%)</Label>
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
              />
            </div>

            {gstEnabled && (
              <div>
                <Label>GSTIN Number</Label>
                <Input
                  placeholder="Enter GSTIN Number"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                />
              </div>
            )}

            {gstEnabled && (
              <div className="flex justify-between font-medium text-gray-700">
                <span>GST Amount (18%)</span>
                <span>₹{gstAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span>₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-4 print:hidden">
            <Button variant="outline" onClick={() => history.back()}>
              ← Back
            </Button>
            <Button onClick={handlePrint}>🖨️ Print Bill</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
