"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

interface InventoryItem {
  id: number
  name: string
  quantity: number
  threshold: number
  category: "Food" | "Housekeeping"
  unit: string
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    // 🍽️ FOOD INVENTORY
    { id: 1, name: "Rice (10kg bag)", quantity: 12, threshold: 3, category: "Food", unit: "bags" },
    { id: 2, name: "Wheat Flour (10kg bag)", quantity: 8, threshold: 2, category: "Food", unit: "bags" },
    { id: 3, name: "Chicken (1kg)", quantity: 20, threshold: 5, category: "Food", unit: "kg" },
    { id: 4, name: "Mutton (1kg)", quantity: 10, threshold: 3, category: "Food", unit: "kg" },
    { id: 5, name: "Fish (1kg)", quantity: 15, threshold: 4, category: "Food", unit: "kg" },
    { id: 6, name: "Eggs", quantity: 240, threshold: 60, category: "Food", unit: "pcs" },
    { id: 7, name: "Milk (1L packet)", quantity: 40, threshold: 10, category: "Food", unit: "packets" },
    { id: 8, name: "Cooking Oil (1L)", quantity: 25, threshold: 5, category: "Food", unit: "bottles" },
    { id: 9, name: "Salt", quantity: 8, threshold: 2, category: "Food", unit: "packets" },
    { id: 10, name: "Vegetables Mix", quantity: 30, threshold: 8, category: "Food", unit: "kg" },
    { id: 11, name: "Fruits", quantity: 25, threshold: 7, category: "Food", unit: "kg" },
    { id: 12, name: "Soft Drinks (500ml)", quantity: 50, threshold: 10, category: "Food", unit: "bottles" },
    { id: 13, name: "Tea Powder", quantity: 5, threshold: 1, category: "Food", unit: "kg" },
    { id: 14, name: "Coffee Powder", quantity: 3, threshold: 1, category: "Food", unit: "kg" },
    { id: 15, name: "Spices Mix", quantity: 10, threshold: 3, category: "Food", unit: "kg" },

    // 🧹 HOUSEKEEPING INVENTORY
    { id: 16, name: "Bedsheets", quantity: 50, threshold: 10, category: "Housekeeping", unit: "pcs" },
    { id: 17, name: "Pillow Covers", quantity: 70, threshold: 15, category: "Housekeeping", unit: "pcs" },
    { id: 18, name: "Towels", quantity: 60, threshold: 10, category: "Housekeeping", unit: "pcs" },
    { id: 19, name: "Soap Bars", quantity: 200, threshold: 50, category: "Housekeeping", unit: "pcs" },
    { id: 20, name: "Shampoo Sachets", quantity: 300, threshold: 70, category: "Housekeeping", unit: "pcs" },
    { id: 21, name: "Toothpaste", quantity: 150, threshold: 30, category: "Housekeeping", unit: "tubes" },
    { id: 22, name: "Detergent", quantity: 10, threshold: 3, category: "Housekeeping", unit: "kg" },
    { id: 23, name: "Cleaning Liquid", quantity: 15, threshold: 4, category: "Housekeeping", unit: "bottles" },
    { id: 24, name: "Toilet Paper Rolls", quantity: 80, threshold: 20, category: "Housekeeping", unit: "rolls" },
    { id: 25, name: "Light Bulbs", quantity: 40, threshold: 10, category: "Housekeeping", unit: "pcs" },
    { id: 26, name: "Brooms", quantity: 12, threshold: 3, category: "Housekeeping", unit: "pcs" },
    { id: 27, name: "Mops", quantity: 10, threshold: 3, category: "Housekeeping", unit: "pcs" },
    { id: 28, name: "Trash Bags", quantity: 100, threshold: 20, category: "Housekeeping", unit: "bags" },
    { id: 29, name: "Air Fresheners", quantity: 25, threshold: 5, category: "Housekeeping", unit: "cans" },
  ])

  const [activeTab, setActiveTab] = useState("Food")
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, threshold: 1, unit: "" })
  const [billUploadOpen, setBillUploadOpen] = useState(false)
  const [billImage, setBillImage] = useState<File | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "application/pdf": [] },
    onDrop: (acceptedFiles) => {
      setBillImage(acceptedFiles[0])
      toast.success("✅ Bill uploaded successfully!")
    },
  })

  const filteredInventory = inventory.filter((item) => item.category === activeTab)

  const handleUseItem = (id: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
          : item
      )
    )

    const item = inventory.find((i) => i.id === id)
    if (item && item.quantity - 1 <= item.threshold) {
      toast.error(`⚠️ ${item.name} is below threshold! Alert sent to Purchase & Super Admin.`)
    }
  }

  const handleAddItem = () => {
    if (!newItem.name) return toast.error("Please enter item name")

    const newEntry: InventoryItem = {
      id: inventory.length + 1,
      name: newItem.name,
      quantity: Number(newItem.quantity),
      threshold: Number(newItem.threshold),
      unit: newItem.unit,
      category: activeTab as "Food" | "Housekeeping",
    }

    setInventory([...inventory, newEntry])
    toast.success(`✅ Added ${newItem.name} to ${activeTab} inventory`)
    setNewItem({ name: "", quantity: 0, threshold: 1, unit: "" })
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">📦 Resort Inventory Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex justify-center mb-6">
          <TabsTrigger value="Food">🍽️ Food Inventory</TabsTrigger>
          <TabsTrigger value="Housekeeping">🧹 Housekeeping Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="Food">
          <InventoryTable items={filteredInventory} onUseItem={handleUseItem} />
        </TabsContent>

        <TabsContent value="Housekeeping">
          <InventoryTable items={filteredInventory} onUseItem={handleUseItem} />
        </TabsContent>
      </Tabs>

      {/* Add New Item Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <Label>Item Name</Label>
            <Input
              placeholder="Enter name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: +e.target.value })}
            />
          </div>
          <div>
            <Label>Threshold</Label>
            <Input
              type="number"
              value={newItem.threshold}
              onChange={(e) => setNewItem({ ...newItem, threshold: +e.target.value })}
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Input
              placeholder="e.g. kg, pcs"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            />
          </div>
        </CardContent>
        <div className="flex justify-end px-6 pb-4">
          <Button onClick={handleAddItem}>Add Item</Button>
        </div>
      </Card>

      {/* Upload Purchase Bill */}
      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={() => setBillUploadOpen(true)}>
          Upload Purchase Bill 🧾
        </Button>
      </div>

      <Dialog open={billUploadOpen} onOpenChange={setBillUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Purchase Bill</DialogTitle>
          </DialogHeader>

          <div
            {...getRootProps()}
            className="border-2 border-dashed p-6 text-center rounded-lg cursor-pointer"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop your bill file here...</p>
            ) : billImage ? (
              <div>
                {billImage.type.includes("image") ? (
                  <Image
                    src={URL.createObjectURL(billImage)}
                    alt="bill"
                    width={200}
                    height={200}
                    className="mx-auto rounded-md"
                  />
                ) : (
                  <p className="text-sm text-blue-600">{billImage.name}</p>
                )}
              </div>
            ) : (
              <p>Drag and drop or click to upload bill (PDF/image)</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InventoryTable({
  items,
  onUseItem,
}: {
  items: InventoryItem[]
  onUseItem: (id: number) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory List</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Item</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Unit</th>
              <th className="border p-2">Threshold</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={item.quantity <= item.threshold ? "bg-red-100" : ""}
              >
                <td className="border p-2">{item.name}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2 text-center">{item.unit}</td>
                <td className="border p-2 text-center">{item.threshold}</td>
                <td className="border p-2 text-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onUseItem(item.id)}
                  >
                    Use One
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
