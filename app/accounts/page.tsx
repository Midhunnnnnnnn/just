import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AccountsPage() {
  const modules = [
    {
      title: "Revenue Report",
      description: "View all booking revenue and earnings",
      link: "/accounts/revenue",
    },
    {
      title: "GST Report",
      description: "GST calculation and tax overview",
      link: "/accounts/gst",
    },
    {
      title: "Stock Report",
      description: "View current stock status and shortages",
      link: "/accounts/stock",
    },
    {
      title: "Inventory Report",
      description: "Track inventory items and value",
      link: "/accounts/inventory",
    },
    {
      title: "Vendor Bills",
      description: "Upload and generate vendor bills",
      link: "/accounts/vendors",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Accounts & Finance System</h1>
      <p className="text-sm text-muted-foreground">
        Manage revenue, GST, stock, inventory & vendor payments
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Link key={mod.link} href={mod.link}>
            <Card className="cursor-pointer hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle>{mod.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {mod.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
