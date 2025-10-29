"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const dishes = [
  "Idli",
  "Dosa",
  "Masala Dosa",
  "Poori Bhaji",
  "Appam with Stew",
  "Chicken Biriyani",
  "Veg Fried Rice",
  "Ghee Roast",
  "Fish Curry",
  "Puttu and Kadala Curry",
  "Paneer Butter Masala",
  "Meals (Veg)",
  "Meals (Non-Veg)",
]

export default function CookPage() {
  const [reports, setReports] = useState<any[]>([])
  const [current, setCurrent] = useState({
    dish: "",
    preparedQty: 0,
    soldQty: 0,
    costEstimate: 0,
  })
  const [inventoryRequests, setInventoryRequests] = useState<any[]>([])
  const [inventoryItem, setInventoryItem] = useState("")
  const [inventoryQty, setInventoryQty] = useState<number>(0)
  const [message, setMessage] = useState("")

  const handleAddReport = () => {
    if (!current.dish) return toast.error("Select a dish first!")
    const remaining = current.preparedQty - current.soldQty
    const wastage = remaining > 0 ? remaining : 0

    setReports([
      ...reports,
      { ...current, remainingQty: remaining, wastage },
    ])
    setCurrent({ dish: "", preparedQty: 0, soldQty: 0, costEstimate: 0 })
  }

  const handleInventoryRequest = () => {
    if (!inventoryItem) return toast.error("Enter an item")
    setInventoryRequests([
      ...inventoryRequests,
      { item: inventoryItem, quantity: inventoryQty, status: "Pending" },
    ])
    setInventoryItem("")
    setInventoryQty(0)
    toast.success("Request sent to Inventory Manager")
  }

  const handleSendReport = () => {
    toast.success("📨 Night report sent to Super Admin!")
    setMessage("")
  }

  const totalCost = reports.reduce((sum, r) => sum + Number(r.costEstimate || 0), 0)
  const totalWastage = reports.reduce((sum, r) => sum + Number(r.wastage || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">👨‍🍳 Kitchen Operations Dashboard</h1>

      {/* Food Cost Estimation */}
      <Card>
        <CardHeader>
          <CardTitle>🍲 Food Cost Estimation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Dish</Label>
              <Input
                list="dishList"
                value={current.dish}
                onChange={(e) => setCurrent({ ...current, dish: e.target.value })}
              />
              <datalist id="dishList">
                {dishes.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Prepared Qty</Label>
              <Input
                type="number"
                value={current.preparedQty}
                onChange={(e) => setCurrent({ ...current, preparedQty: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Sold Qty</Label>
              <Input
                type="number"
                value={current.soldQty}
                onChange={(e) => setCurrent({ ...current, soldQty: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Cost Estimate (₹)</Label>
              <Input
                type="number"
                value={current.costEstimate}
                onChange={(e) => setCurrent({ ...current, costEstimate: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button onClick={handleAddReport}>Add to Report</Button>

          <Separator className="my-4" />

          <ScrollArea className="h-48 border rounded-md p-4">
            {reports.length === 0 ? (
              <p className="text-gray-500 text-center">No reports yet.</p>
            ) : (
              reports.map((r, i) => (
                <div key={i} className="flex justify-between py-1 border-b">
                  <span>{r.dish}</span>
                  <span>
                    Prep: {r.preparedQty} | Sold: {r.soldQty} | Waste: {r.wastage} | ₹{r.costEstimate}
                  </span>
                </div>
              ))
            )}
          </ScrollArea>

          <div className="text-sm text-gray-700 mt-2">
            <strong>Total Cost:</strong> ₹{totalCost} | <strong>Total Wastage:</strong> {totalWastage} plates
          </div>
        </CardContent>
      </Card>

      {/* Inventory Requests */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Request Items from Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={inventoryItem}
                onChange={(e) => setInventoryItem(e.target.value)}
                placeholder="e.g., Rice, Milk, Oil"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={inventoryQty}
                onChange={(e) => setInventoryQty(Number(e.target.value))}
                placeholder="e.g., 10 kg"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleInventoryRequest}>Send Request</Button>
            </div>
          </div>

          <ScrollArea className="h-40 border rounded-md p-4">
            {inventoryRequests.length === 0 ? (
              <p className="text-gray-500 text-center">No inventory requests yet.</p>
            ) : (
              inventoryRequests.map((req, i) => (
                <div key={i} className="flex justify-between border-b py-1">
                  <span>
                    {req.item} — {req.quantity}
                  </span>
                  <span
                    className={`font-semibold ${
                      req.status === "Pending"
                        ? "text-yellow-500"
                        : req.status === "Approved"
                        ? "text-blue-500"
                        : "text-green-500"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Night Report */}
      <Card>
        <CardHeader>
          <CardTitle>🌙 Night Report & Communication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Message to Super Admin</Label>
          <Textarea
            placeholder="Summarize today's kitchen performance..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={handleSendReport}>Send Report</Button>
        </CardContent>
      </Card>
    </div>
  )
}
