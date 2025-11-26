"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RevenuePage() {
  const [search, setSearch] = useState("")

  // Dummy data for now (will connect to DB later)
  const revenueData = [
    { id: "BK101", guest: "Rahul", room: "101", amount: 5200, date: "2025-05-10" },
    { id: "BK102", guest: "Anita", room: "203", amount: 7800, date: "2025-05-12" },
    { id: "BK103", guest: "John", room: "105", amount: 4300, date: "2025-05-13" },
    { id: "BK104", guest: "Neha", room: "402", amount: 6600, date: "2025-05-14" },
  ]

  // Filter logic
  const filteredData = revenueData.filter((item) =>
    item.guest.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="p-6 space-y-6">

      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <h1 className="text-3xl font-bold">Revenue Report</h1>
        <Input
          className="md:w-64"
          placeholder="Search by name or booking id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {filteredData.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            ₹{totalRevenue}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Booking</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{filteredData.length ? Math.round(totalRevenue / filteredData.length) : 0}
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Room No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.guest}</TableCell>
                  <TableCell>{item.room}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="text-right font-medium">₹{item.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              No data found.
            </p>
          )}
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
 