"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, differenceInMinutes } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";

interface EventBooking {
  id: number;
  guestName: string;
  eventType: "Banquet Hall" | "Meeting Room";
  startTime: Date;
  endTime?: Date;
  status: "Ongoing" | "Completed";
  billAmount?: number;
}

export default function EventsPage() {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [newBooking, setNewBooking] = useState({
    guestName: "",
    eventType: "Banquet Hall",
    startTime: new Date(),
  });

  const hourlyRates = {
    "Banquet Hall": 4500,
    "Meeting Room": 2000,
  };

  const handleStartBooking = () => {
    if (!newBooking.guestName) return toast.error("Enter guest name");

    const id = bookings.length + 1;
    const newEvent: EventBooking = {
      id,
      guestName: newBooking.guestName,
      eventType: newBooking.eventType as "Banquet Hall" | "Meeting Room",
      startTime: newBooking.startTime,
      status: "Ongoing",
    };
    setBookings([...bookings, newEvent]);
    toast.success("Event started successfully");
    setNewBooking({
      guestName: "",
      eventType: "Banquet Hall",
      startTime: new Date(),
    });
  };

  const handleEndEvent = (id: number) => {
    const endTime = new Date();
    setBookings((prev) =>
      prev.map((event) => {
        if (event.id === id && event.status === "Ongoing") {
          const durationMins = differenceInMinutes(endTime, event.startTime);
          const durationHours = Math.max(durationMins / 60, 1);
          const rate = hourlyRates[event.eventType];
          const total = rate * Math.ceil(durationHours);
          toast.success(
            `${
              event.eventType
            } booking ended. Duration: ${durationHours.toFixed(
              1
            )} hrs. Bill: ₹${total}`
          );
          return {
            ...event,
            endTime,
            billAmount: total,
            status: "Completed",
          };
        }
        return event;
      })
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">
        🎉 Banquet & Meeting Room Management
      </h1>

      <Tabs defaultValue="manage">
        <TabsList className="mb-6">
          <TabsTrigger value="manage">Manage Bookings</TabsTrigger>
          <TabsTrigger value="new">New Booking</TabsTrigger>
        </TabsList>

        {/* Manage Existing Bookings */}
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Current and Past Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bill</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-gray-500"
                      >
                        No bookings yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>{booking.guestName}</TableCell>
                        <TableCell>{booking.eventType}</TableCell>
                        <TableCell>
                          {format(booking.startTime, "dd MMM yyyy, HH:mm")}
                        </TableCell>
                        <TableCell>
                          {booking.endTime
                            ? format(booking.endTime, "dd MMM yyyy, HH:mm")
                            : "--"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              booking.status === "Ongoing"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          ₹{booking.billAmount ? booking.billAmount : "--"}
                        </TableCell>
                        <TableCell>
                          {booking.status === "Ongoing" && (
                            <Button
                              size="sm"
                              onClick={() => handleEndEvent(booking.id)}
                            >
                              End Event
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Booking Tab */}
        <TabsContent value="new">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Start New Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label>Guest Name</Label>
                  <Input
                    value={newBooking.guestName}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        guestName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Event Type</Label>
                  <select
                    value={newBooking.eventType}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        eventType: e.target.value,
                      })
                    }
                    className="border rounded-md w-full p-2"
                  >
                    <option value="Banquet Hall">Banquet Hall</option>
                    <option value="Meeting Room">Meeting Room</option>
                  </select>
                </div>

                <div>
                  <Label>Event Start Time</Label>
                  <Calendar
                    mode="single"
                    selected={newBooking.startTime}
                    onSelect={(date) =>
                      setNewBooking({
                        ...newBooking,
                        startTime: date || new Date(),
                      })
                    }
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    className="rounded-md border mt-2"
                  />
                </div>

                <Button onClick={handleStartBooking}>Start Event</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
