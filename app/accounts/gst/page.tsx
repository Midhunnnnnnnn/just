"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function GSTPage() {
  const [gstRate, setGstRate] = useState(18)

  // Dummy data (will connect to DB later)
  const bookings = [
    { id: "BK101", guest: "Rahul", amount: 5200, date: "2025-05-10" },
    { id: "BK102", guest: "Anita", amount: 7800, date: "2025-05-12" },
    { id: "BK103", guest: "John", amount: 4300, date: "2025-05-13" },
    { id: "BK104", guest: "Neha", amount: 6600, date: "2025-05-14" },
  ]

  const totalRevenue = bookings.reduce((sum, item) => sum + item.amount, 0)
  const totalGST = (totalRevenue * gstRate) / 100
  const netIncome = totalRevenue - totalGST

  return (
    <div className="p-6 space-y-6">

      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <h1 className="text-3xl font-bold">GST Report</h1>

        <div className="flex items-center gap-2">
          <span className="text-sm">GST %</span>
          <Input
            type="number"
            className="w-20"
            value={gstRate}
            onChange={(e) => setGstRate(Number(e.target.value))}
          />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{totalRevenue}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GST Collected ({gstRate}%)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            ₹{Math.round(totalGST)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Income</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            ₹{Math.round(netIncome)}
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>GST Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">GST</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bookings.map((item) => {
                const gstValue = (item.amount * gstRate) / 100

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.guest}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right">₹{item.amount}</TableCell>
                    <TableCell className="text-right">₹{Math.round(gstValue)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => window.print()}>
          Print / Save PDF
        </Button>
      </div>

    </div>
  )
}
