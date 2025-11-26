"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function VendorBillsPage() {
  const [vendorName, setVendorName] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [gst, setGst] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const total = (Number(amount) || 0) + (Number(gst) || 0)

  const generatePDF = async () => {
    const element = document.getElementById("bill-area")
    if (!element) return

    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF("p", "mm", "a4")
    const imgWidth = 190
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 10, 20, imgWidth, imgHeight)
    pdf.save(`${vendorName}_Bill.pdf`)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Vendor Bills</h1>
      <p className="text-sm text-muted-foreground">
        Upload, manage & generate vendor bills as PDF
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT - FORM */}
        <Card>
          <CardHeader>
            <CardTitle>Create Vendor Bill</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Vendor Name</Label>
              <Input
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Ex: Fresh Farm Suppliers"
              />
            </div>

            <div>
              <Label>Items / Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item names, quantity, etc..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <Label>GST (₹)</Label>
                <Input
                  type="number"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Upload Bill</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <p className="font-semibold text-lg">
              Total: ₹{total}
            </p>

            <div className="flex gap-4">
              <Button onClick={generatePDF}>
                Generate PDF
              </Button>

              <Button variant="outline">
                Save Bill
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT - PREVIEW */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Preview</CardTitle>
          </CardHeader>

          <CardContent>
            <div
              id="bill-area"
              className="border p-5 space-y-2 rounded-md text-sm bg-white"
            >
              <h2 className="text-lg font-bold">Resort Vendor Bill</h2>
              <p>Date: {new Date().toLocaleDateString()}</p>
              <hr />

              <p><strong>Vendor:</strong> {vendorName || "N/A"}</p>
              <p><strong>Description:</strong> {description || "N/A"}</p>

              <div className="pt-2 space-y-1">
                <p>Amount: ₹{amount || 0}</p>
                <p>GST: ₹{gst || 0}</p>
              </div>

              <hr />
              <p className="text-lg font-bold">
                Total: ₹{total}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* TABLE - Past Bills (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Vendor Bills</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell>Fresh Farm</TableCell>
                <TableCell>Vegetables & Fruits</TableCell>
                <TableCell>₹1200</TableCell>
                <TableCell>₹216</TableCell>
                <TableCell className="font-bold">₹1416</TableCell>
                <TableCell>12/05/2025</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Royal Linens</TableCell>
                <TableCell>Bedsheets Purchase</TableCell>
                <TableCell>₹4500</TableCell>
                <TableCell>₹810</TableCell>
                <TableCell className="font-bold">₹5310</TableCell>
                <TableCell>10/05/2025</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
