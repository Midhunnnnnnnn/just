"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TableStatus = "available" | "occupied" | "billed" | "closed";
type BillType = "paid" | "nc" | "room";
type UserRole = "admin" | "superAdmin" | "captain";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface TableOrder {
  id: number;
  status: TableStatus;
  items: OrderItem[];
  total?: number;
  billType?: BillType;
}

// ✅ Autocomplete dish suggestions
const dishList = [
  "Masala Dosa",
  "Idli Sambar",
  "Vada",
  "Pongal",
  "Appam with Stew",
  "Puttu and Kadala Curry",
  "Chettinad Chicken Curry",
  "Fish Moilee",
  "Vegetable Kurma",
  "Kerala Parotta",
  "Lemon Rice",
  "Curd Rice",
  "Rasam",
  "Upma",
  "Onion Uttapam",
  "Mysore Pak",
  "Filter Coffee",
];

export default function KOTPage() {
  const [tables, setTables] = useState<TableOrder[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      status: "available" as TableStatus,
      items: [],
    }))
  );

  const [role, setRole] = useState<UserRole>("captain");
  const [selectedTable, setSelectedTable] = useState<TableOrder | null>(null);
  const [dish, setDish] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [billType, setBillType] = useState<BillType>("paid");

  // ✅ Add dish to selected table
  const addDish = () => {
    if (!selectedTable || dish.trim() === "") return;

    const price = Math.floor(Math.random() * 300) + 100; // random price
    const newItem: OrderItem = { name: dish, quantity, price };

    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? {
              ...t,
              items: [...t.items, newItem],
              status: "occupied" as TableStatus,
              total:
                (t.total ?? 0) + newItem.price * newItem.quantity,
            }
          : t
      )
    );

    setDish("");
    setQuantity(1);
  };

  // ✅ Mark bill as completed
  const finalizeBill = (tableId: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: "billed" as TableStatus, billType }
          : t
      )
    );
    alert(`Bill for Table ${tableId} marked as ${billType.toUpperCase()}`);
    setSelectedTable(null);
  };

  // ✅ SuperAdmin-only cancellation
  const cancelBill = (tableId: number) => {
    if (role !== "superAdmin") {
      alert("Only Super Admin can cancel bills!");
      return;
    }

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: "available" as TableStatus,
              items: [],
              total: 0,
              billType: undefined,
            }
          : t
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kitchen Order Tickets (KOT)</h1>

        <Select onValueChange={(val) => setRole(val as UserRole)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="captain">Captain</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superAdmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE GRID */}
      <div className="grid grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`cursor-pointer transition hover:scale-105 ${
              table.status === "available"
                ? "bg-green-100"
                : table.status === "occupied"
                ? "bg-yellow-100"
                : table.status === "billed"
                ? "bg-blue-100"
                : "bg-gray-100"
            }`}
            onClick={() => setSelectedTable(table)}
          >
            <CardHeader>
              <CardTitle>Table {table.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status: {table.status}</p>
              <p>Total: ₹{table.total ?? 0}</p>

              {role === "superAdmin" && table.status !== "available" && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelBill(table.id);
                  }}
                >
                  Cancel Bill
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SELECTED TABLE DETAILS */}
      {selectedTable && (
        <Card className="mt-8 p-4">
          <CardHeader>
            <CardTitle>
              Table {selectedTable.id} - Add Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Autocomplete Dish Input */}
            <div className="flex gap-2">
              <Input
                list="dishes"
                placeholder="Enter dish name"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
              />
              <datalist id="dishes">
                {dishList.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>

              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24"
              />
              <Button onClick={addDish}>Add Dish</Button>
            </div>

            {/* Display added dishes */}
            <div>
              {tables
                .find((t) => t.id === selectedTable.id)
                ?.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b py-1"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
            </div>

            {/* Bill Type Selection */}
            <Select onValueChange={(val) => setBillType(val as BillType)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select Bill Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid Now</SelectItem>
                <SelectItem value="nc">Non-Chargeable (NC)</SelectItem>
                <SelectItem value="room">Room Bill</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="bg-blue-600 text-white"
              onClick={() => finalizeBill(selectedTable.id)}
            >
              Finalize Bill
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
