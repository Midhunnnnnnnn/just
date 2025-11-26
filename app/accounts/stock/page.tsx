"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function StockPage() {
  const [search, setSearch] = useState("")

  // Dummy stock data (connect to DB later)
  const stockData = [
    { id: 1, item: "Rice Bag", category: "Kitchen", quantity: 5, level: 10 },
    { id: 2, item: "Cooking Oil", category: "Kitchen", quantity: 20, level: 10 },
    { id: 3, item: "Soap", category: "Housekeeping", quantity: 30, level: 15 },
    { id: 4, item: "Bed Sheets", category: "Rooms", quantity: 8, level: 12 },
    { id: 5, item: "Tea Powder", category: "Kitchen", quantity: 3, level: 10 },
  ]

  const filteredStock = stockData.filter((item) =>
    item.item.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  const getStatus = (quantity: number, level: number) => {
    if (quantity <= level / 2) return "Low"
    if (quantity <= level) return "Medium"
    return "Good"
  }

  return (
    <div className="p-6 space-y-6">

      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <h1 className="text-3xl font-bold">Stock Report</h1>

        <Input
          className="md:w-64"
          placeholder="Search item or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Total Items</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {filteredStock.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            {filteredStock.filter(item => item.quantity <= item.level / 2).length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Good Condition</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {filteredStock.filter(item => item.quantity > item.level).length}
          </CardContent>
        </Card>

      </div>

      {/* STOCK TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Details</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Minimum Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStock.map((item) => {
                const status = getStatus(item.quantity, item.level)

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.level}</TableCell>

                    <TableCell>
                      {status === "Low" && <Badge variant="destructive">Low</Badge>}
                      {status === "Medium" && <Badge variant="secondary">Medium</Badge>}
                      {status === "Good" && <Badge>Good</Badge>}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>

          </Table>

          {filteredStock.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              No stock found
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
