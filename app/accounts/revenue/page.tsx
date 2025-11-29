"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Filter, IndianRupee } from "lucide-react";

interface AccountRow {
  id: string;
  base_amount: number;
  extra_hours: number;
  extra_charge: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
  guests: { name: string } | null;
  rooms: { room_number: string } | null;
}

export default function RevenueReportPage() {
  const [data, setData] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  const fetchRevenue = async () => {
    setLoading(true);

    let query = supabase
      .from("accounts")
      .select("*, guests(name), rooms(room_number)")
      .order("created_at", { ascending: false });

    if (filterDate) {
      query = query
        .gte("created_at", `${filterDate}T00:00:00`)
        .lte("created_at", `${filterDate}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading revenue:", error);
      setData([]);
    } else {
      setData(data as AccountRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRevenue();
  }, [filterDate]);

  const totalRevenue = data.reduce(
    (sum, row) => sum + (row.total_amount || 0),
    0
  );

  const todayRevenue = data.filter(row => 
    new Date(row.created_at).toDateString() === new Date().toDateString()
  ).reduce((sum, row) => sum + (row.total_amount || 0), 0);

  const totalTransactions = data.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Revenue Report</h1>
            <p className="text-slate-600 mt-2">
              Comprehensive overview of all booking transactions and earnings
            </p>
          </div>
          <Button 
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <IndianRupee className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Today's Revenue</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  ₹{todayRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Total Transactions</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {totalTransactions}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Filter className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS & TABLE SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* FILTER SIDEBAR */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Filter by Date
              </label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFilterDate("")}
              className="w-full"
            >
              Clear Filters
            </Button>
            
            {/* Quick Stats */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg. Transaction</span>
                  <span className="font-semibold">
                    ₹{totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(0) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Extra Charges</span>
                  <span className="font-semibold text-amber-600">
                    ₹{data.reduce((sum, row) => sum + (row.extra_charge || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MAIN TABLE */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle>Revenue Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="text-slate-600 mt-3">Loading revenue data...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IndianRupee className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">No transactions found</h3>
                <p className="text-slate-600 mb-4">No revenue records match your current filters</p>
                {filterDate && (
                  <Button 
                    variant="outline" 
                    onClick={() => setFilterDate("")}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold text-slate-900">Date & Time</TableHead>
                        <TableHead className="font-semibold text-slate-900">Guest</TableHead>
                        <TableHead className="font-semibold text-slate-900">Room</TableHead>
                        <TableHead className="font-semibold text-slate-900 text-right">Base Amount</TableHead>
                        <TableHead className="font-semibold text-slate-900 text-right">Extra Charges</TableHead>
                        <TableHead className="font-semibold text-slate-900 text-right">Total</TableHead>
                        <TableHead className="font-semibold text-slate-900">Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row) => (
                        <TableRow key={row.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="text-sm text-slate-900">
                              {new Date(row.created_at).toLocaleDateString("en-IN")}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(row.created_at).toLocaleTimeString("en-IN", {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900">
                            {row.guests?.name || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {row.rooms?.room_number || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-900">
                            ₹{row.base_amount?.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.extra_charge > 0 ? (
                              <div>
                                <div className="font-medium text-amber-700">
                                  ₹{row.extra_charge?.toLocaleString("en-IN")}
                                </div>
                                <div className="text-xs text-amber-600">
                                  ({row.extra_hours} hrs)
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-700">
                            ₹{row.total_amount?.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                row.payment_method === 'cash' 
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }
                            >
                              {row.payment_method || "cash"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}