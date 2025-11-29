"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from "@react-pdf/renderer";

// Optional: Register a custom font (e.g., for better bill look)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/vfs_fonts.js" }, // Fallback
  ],
});

// PDF Styles (like CSS, but PDF-native)
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    borderBottom: 2,
    paddingBottom: 10,
  },
  section: { margin: 10, padding: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  total: { fontSize: 18, fontWeight: "bold", borderTop: 2, paddingTop: 10 },
  footer: { position: "absolute", bottom: 30, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "gray" },
});

// The Bill as a React PDF Component (reusable!)
function BillPDF({ vendorName, description, amount, gst, total, today }: {
  vendorName: string;
  description: string;
  amount: string;
  gst: string;
  total: number;
  today: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>RESORT VENDOR BILL</Text>
          <Text style={{ fontSize: 14, marginTop: 5, color: "gray" }}>Official Invoice</Text>
        </View>

        <View style={styles.section}>
          <Text>Date: {today}</Text>
          <Text>Vendor: {vendorName || "_____________________________"}</Text>
          <Text>Description: {description || "No items listed"}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Subtotal Amount:</Text>
            <Text>₹{Number(amount || 0).toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.row}>
            <Text>GST:</Text>
            <Text>₹{Number(gst || 0).toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.total}>
            <Text>TOTAL AMOUNT</Text>
            <Text>₹{total.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business! Payment due within 15 days.</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function VendorBillsPage() {
  const [vendorName, setVendorName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [gst, setGst] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [driveUrl, setDriveUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    const d = new Date();
    setToday(d.toLocaleDateString("en-IN"));
  }, []);

  const total = (Number(amount) || 0) + (Number(gst) || 0);

  // Generate PDF: Now just a download link – no async/canvas!
  const generatePDF = () => {
    // The PDF is generated on-the-fly via <PDFDownloadLink>
    // No separate function needed – button triggers download directly
  };

  const uploadToDrive = async () => {
    if (!file) return alert("Please select a file first");
    if (!vendorName) return alert("Please enter the vendor name");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("vendorName", vendorName);
    formData.append("billDate", new Date().toISOString().split("T")[0]);

    const res = await fetch("/api/upload/vendor-bill", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.url) {
      setDriveUrl(data.url);
      alert("Uploaded to Google Drive successfully");
    } else {
      alert(data.error || "Upload failed");
    }
  };

  const saveToDatabase = async () => {
    if (!vendorName || !amount || !driveUrl) {
      return alert("Please fill all details & upload bill first");
    }

    const res = await fetch("/api/accounts/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorName,
        description,
        amount,
        gst,
        total,
        fileUrl: driveUrl,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Vendor bill saved to database");
      setVendorName("");
      setDescription("");
      setAmount("");
      setGst("");
      setFile(null);
      setDriveUrl("");
    } else {
      alert("Failed to save bill");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-end">
        <a href="/api/google/login">
          <Button variant="secondary">Login with Google Drive</Button>
        </a>
      </div>

      <h1 className="text-3xl font-bold">Vendor Bills</h1>
      <p className="text-sm text-muted-foreground">
        Upload, manage & generate vendor bills
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form (unchanged) */}
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
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>GST (₹)</Label>
                <Input
                  type="number"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label>Upload Bill (Image/PDF)</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="text-lg font-bold text-green-600">
              Total: ₹{total.toLocaleString("en-IN")}
            </div>

            <div className="flex gap-3">
              {/* PDF Button: Now uses PDFDownloadLink – generates on click */}
              <PDFDownloadLink
                document={<BillPDF vendorName={vendorName} description={description} amount={amount} gst={gst} total={total} today={today} />}
                fileName={`${vendorName || "Vendor"}_Bill_${today.replace(/\//g, "-")}.pdf`}
                className="flex-1"
              >
                {({ blob, url, loading, error }) =>
                  loading ? "Generating PDF..." : "Download PDF"
                }
              </PDFDownloadLink>

              <Button
                variant="outline"
                onClick={uploadToDrive}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Uploading..." : "Upload to Drive"}
              </Button>
            </div>

            {driveUrl && (
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="font-semibold text-green-800">Uploaded!</p>
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs break-all"
                >
                  {driveUrl}
                </a>
              </div>
            )}

            <Button
              className="w-full"
              onClick={saveToDatabase}
              disabled={!driveUrl}
              size="lg"
            >
              Save to Database
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT: PDF Preview (Live-rendered PDF) */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PDFDownloadLink
              document={<BillPDF vendorName={vendorName} description={description} amount={amount} gst={gst} total={total} today={today} />}
              fileName="preview.pdf"
            >
              {({ blob, url, loading, error }) => (
                <iframe
                  src={url}
                  style={{ width: "100%", height: "800px", border: "none" }}
                  title="PDF Preview"
                />
              )}
            </PDFDownloadLink>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Previous Vendor Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            (Coming soon: List from Supabase)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}