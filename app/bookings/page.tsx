"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import { 
  Building2, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowRight,
  Clock,
  IndianRupee
} from "lucide-react"

import CalendarPanel from "./components/CalendarPanel"
import RoomGrid, { Room } from "./components/RoomGrid"
import BookingPanel from "./components/BookingPanel"
import CheckInDialog from "./components/CheckInDialog"
import GuestList from "./components/GuestList"
import HousekeepingList from "./components/HousekeepingList"
import MaintenancePanel from "./components/MaintenancePanel"

const HOURLY_LATE_FEE = 200

/* ================= TYPES =================== */

interface RawRoom {
  id: string
  room_number: string
  status: string
  room_types: {
    name: string
    base_price: number
  } | null
}

interface RawGuest {
  id: string
  name: string
  room_ids: string[]
  check_in: string
  booked_days: number
  base_amount: number
  status: "checked-in" | "checked-out"
  check_out?: string
  extra_hours?: number
  extra_charge?: number
  total_charge?: number
}

export interface Guest {
  id: string
  name: string
  roomIds: string[]
  checkInISO: string
  bookedDays: number
  baseAmount: number
  status: "checked-in" | "checked-out"
  checkOutISO?: string
  extraHours?: number
  extraCharge?: number
  totalCharge?: number
}

/* =========================================== */

export default function BookingsPage() {
  const router = useRouter()

  const [selectedDate] = useState(new Date())
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [days, setDays] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  /* ===================================================== */
  /* ================= FETCH ROOMS ====================== */
  /* ===================================================== */

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("id, room_number, status, room_types(name, base_price)")

    if (error || !data) {
      console.error("Room fetch error:", error)
      return
    }

    const mappedRooms: Room[] = (data as RawRoom[]).map((r) => ({
      id: r.id,
      name: r.room_number,
      category: r.room_types?.name ?? "Deluxe",
      status: r.status === "available" ? "free" : r.status,
      pricePerDay: r.room_types?.base_price ?? 2800,
      guestId: null,
    }))

    setRooms(mappedRooms)
    setIsLoading(false)
  }

  const handleStatusChange = async (roomId: string, newStatus: Room["status"]) => {
    try {
      const { error } = await supabase
        .from("rooms")
        .update({ status: newStatus })
        .eq("id", roomId)

      if (error) {
        console.error("Error updating room status:", error)
        alert("Failed to update room status")
        return
      }

      // Remove from selectedRooms if maintenance
      if (newStatus === "maintenance") {
        setSelectedRooms(prev => prev.filter(r => r.id !== roomId))
      }

      fetchRooms()
    } catch (err) {
      console.error("Error:", err)
      alert("Failed to update room status")
    }
  }

  /* ===================================================== */
  /* ================= FETCH GUESTS ===================== */
  /* ===================================================== */

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.error("Guest fetch error:", error)
      return
    }

    const mappedGuests: Guest[] = (data as RawGuest[]).map((g) => ({
      id: g.id,
      name: g.name,
      roomIds: g.room_ids,
      checkInISO: g.check_in,
      bookedDays: g.booked_days,
      baseAmount: g.base_amount,
      status: g.status,
      checkOutISO: g.check_out,
      extraHours: g.extra_hours,
      extraCharge: g.extra_charge,
      totalCharge: g.total_charge,
    }))

    setGuests(mappedGuests)
  }

  useEffect(() => {
    fetchRooms()
    fetchGuests()
  }, [])

  /* ===================== CALCULATIONS ===================== */

  const calculateTotal = () => {
    return selectedRooms.reduce((sum, r) => sum + r.pricePerDay, 0) * days
  }

  const handleRoomClick = (room: Room) => {
    if (room.status !== "free") return

    setSelectedRooms((prev) =>
      prev.find((r) => r.id === room.id)
        ? prev.filter((r) => r.id !== room.id)
        : [...prev, room]
    )
  }

  const handleConfirmBooking = async (data: any) => {
    if (selectedRooms.length === 0) return

    const total =
      data.manualPrice !== "" ? Number(data.manualPrice) : calculateTotal()

    const { error } = await supabase.from("guests").insert({
      name: data.name,
      room_ids: selectedRooms.map((r) => r.id),
      check_in: new Date().toISOString(),
      booked_days: data.days,
      base_amount: total,
      status: "checked-in",
    })

    if (error) {
      console.error("Supabase insert error:", error)
      alert(error.message)
      return
    }

    await supabase
      .from("rooms")
      .update({ status: "occupied" })
      .in("id", selectedRooms.map((r) => r.id))

    setSelectedRooms([])
    setBookingOpen(false)

    fetchRooms()
    fetchGuests()
  }

  const hourDiff = (iso: string) => {
    const start = new Date(iso).getTime()
    const now = Date.now()
    return Math.ceil((now - start) / (1000 * 60 * 60))
  }

  const handleCheckOut = async (guest: Guest) => {
    const hoursStayed = hourDiff(guest.checkInISO)
    const bookedHours = guest.bookedDays * 24

    const extraHours = Math.max(0, hoursStayed - bookedHours)
    const extraCharge = extraHours * HOURLY_LATE_FEE
    const totalCharge = guest.baseAmount + extraCharge

    if (!confirm(`Checkout total: ₹${totalCharge}`)) return

    await supabase
      .from("rooms")
      .update({ status: "housekeeping" })
      .in("id", guest.roomIds)

    await supabase
      .from("guests")
      .update({
        status: "checked-out",
        check_out: new Date().toISOString(),
        extra_hours: extraHours,
        extra_charge: extraCharge,
        total_charge: totalCharge,
      })
      .eq("id", guest.id)

    fetchRooms()
    fetchGuests()
  }

  const markRoomCleaned = async (roomId: string) => {
    await supabase.from("rooms").update({ status: "available" }).eq("id", roomId)
    fetchRooms()
  }

  const occupiedGuests = useMemo(
    () => guests.filter((g) => g.status === "checked-in"),
    [guests]
  )

  // Quick stats for header
  const availableRooms = rooms.filter(r => r.status === 'free').length
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length
  const totalRooms = rooms.length

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 p-4 lg:p-6 space-y-6">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-6 lg:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Resort Bookings
                </h1>
                <p className="text-slate-600 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Real-time room management dashboard
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4 text-center">
              <div className="bg-blue-50 rounded-2xl px-4 py-2 border border-blue-200">
                <div className="text-lg font-bold text-blue-700">{availableRooms}</div>
                <div className="text-xs text-blue-600">Available</div>
              </div>
              <div className="bg-rose-50 rounded-2xl px-4 py-2 border border-rose-200">
                <div className="text-lg font-bold text-rose-700">{occupiedRooms}</div>
                <div className="text-xs text-rose-600">Occupied</div>
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-2 border border-slate-200">
                <div className="text-lg font-bold text-slate-700">{totalRooms}</div>
                <div className="text-xs text-slate-600">Total</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6 mt-6"
        >

          {/* LEFT SIDEBAR */}
          <div className="xl:col-span-1 space-y-4 lg:space-y-6">
            {/* Calendar Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Calendar</h3>
              </div>
              <CalendarPanel selectedDate={selectedDate} onChange={() => {}} />
            </motion.div>

            {/* Booking Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-900">Quick Booking</h3>
              </div>
              <BookingPanel
                selectedRooms={selectedRooms}
                total={calculateTotal()}
                days={days}
                setDays={setDays}
                onBook={() => setBookingOpen(true)}
                onCheckout={() => router.push("/checkout")}
              />
            </motion.div>
          </div>

          {/* CENTER — ROOM GRID */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-6 h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">
                    Room Availability
                  </h2>
                  <p className="text-slate-600 text-sm lg:text-base">
                    {selectedRooms.length > 0 ? (
                      <span className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-medium">
                          {selectedRooms.length} room(s) selected
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          {calculateTotal()} total
                        </span>
                      </span>
                    ) : (
                      "Click on available rooms to select"
                    )}
                  </p>
                </div>
                
                {selectedRooms.length > 0 && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setBookingOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <RoomGrid
                  rooms={rooms}
                  selectedRooms={selectedRooms}
                  guests={occupiedGuests.map((g) => ({ id: g.id, name: g.name }))}
                  onRoomClick={handleRoomClick}
                  onStatusChange={handleStatusChange}
                />
              )}
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="xl:col-span-1 space-y-4 lg:space-y-6">
            {/* Guest List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-slate-900">Current Guests</h3>
              </div>
              <div className="h-80 lg:h-96 overflow-hidden flex flex-col">
                <GuestList guests={occupiedGuests} onCheckout={handleCheckOut} />
              </div>
            </motion.div>

            {/* Housekeeping List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-6"
            >
              <div className="h-64 lg:h-72 overflow-hidden flex flex-col">
                <HousekeepingList rooms={rooms} onMarkCleaned={markRoomCleaned} />
              </div>
            </motion.div>

            {/* Maintenance Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 p-6"
            >
              <MaintenancePanel
                rooms={rooms}
                refreshRooms={fetchRooms}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* CHECK-IN DIALOG */}
      <CheckInDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onConfirm={handleConfirmBooking}
        calculatedTotal={calculateTotal()}
      />
    </div>
  )
}