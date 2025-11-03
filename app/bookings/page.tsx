"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { toast } from "sonner"

interface Room {
  id: number
  name: string
  category: "Deluxe" | "Executive" | "Suite"
  status: "free" | "occupied" | "maintenance" | "housekeeping"
  pricePerDay: number
  // If occupied, point to guest id
  guestId?: string | null
}

interface Guest {
  id: string
  name: string
  address: string
  idProof: string
  roomIds: number[] // rooms assigned
  checkInISO: string
  bookedDays: number
  baseAmount: number
  status: "checked-in" | "checked-out"
  checkOutISO?: string
  extraHours?: number
  extraCharge?: number
  totalCharge?: number
}

const basePrices = {
  Deluxe: 2800,
  Executive: 4500,
  Suite: 6800,
}

const HOURLY_LATE_FEE = 200 // ₹200 per extra hour

// stable id generator
const genId = (() => {
  let counter = 0
  return () => `id_${Date.now()}_${++counter}`
})()

// helper to format 12-hour time & date
const formatDateTime12 = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function Page() {
  const router = useRouter()

  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [passportImage, setPassportImage] = useState<File | null>(null)
  const [housekeepingAlerted, setHousekeepingAlerted] = useState<number[]>([])
  const [form, setForm] = useState({
    name: "",
    address: "",
    idProof: "",
    days: 1,
    manualPrice: "",
  })

  const [guests, setGuests] = useState<Guest[]>([]) // includes checked-in and checked-out records

  // notification sound
  const playSound = () => {
    const audio = new Audio("/sounds/notify.mp3")
    audio.play().catch(() => {})
  }

  // persist and load from localStorage keys
  const STORAGE_KEYS = {
    rooms: "rms_rooms_v1",
    guests: "rms_guests_v1",
  }

  // initialize current date (keeps live clock)
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // load saved data or generate initial rooms
  useEffect(() => {
    const storedRooms = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.rooms)
    const storedGuests = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.guests)

    if (storedRooms) {
      try {
        setRooms(JSON.parse(storedRooms))
      } catch {
        setRooms(generateRooms())
      }
    } else {
      setRooms(generateRooms())
    }

    if (storedGuests) {
      try {
        setGuests(JSON.parse(storedGuests))
      } catch {
        setGuests([])
      }
    }
  }, [])

  // persist rooms & guests when they change
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.guests, JSON.stringify(guests))
  }, [guests])

  // dropzone for passport image
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: acceptedFiles => setPassportImage(acceptedFiles[0]),
  })

  // utility: generate 33 rooms, deterministic categories but random initial statuses
  function generateRooms(): Room[] {
    return Array.from({ length: 33 }, (_, i) => {
      const id = i + 1
      let category: Room["category"] = "Deluxe"
      if (id > 11 && id <= 22) category = "Executive"
      else if (id > 22) category = "Suite"

      // make many free by default
      const statuses: Room["status"][] = ["free", "occupied", "maintenance", "housekeeping"]
      const randomStatus = Math.random() < 0.5 ? "free" : statuses[Math.floor(Math.random() * statuses.length)]

      return {
        id,
        name: `Room ${id}`,
        category,
        status: randomStatus,
        pricePerDay: basePrices[category],
        guestId: null,
      }
    })
  }

  // compute base price for selected rooms * days or manual override
  const calculateTotalPrice = () => {
    if (form.manualPrice) return Number(form.manualPrice)
    return selectedRooms.reduce((sum, r) => sum + r.pricePerDay, 0) * Math.max(1, form.days)
  }

  // room click: housekeeping alert or select/free only
  const handleRoomClick = (room: Room) => {
    if (room.status === "housekeeping") {
      if (housekeepingAlerted.includes(room.id)) {
        toast("Housekeeping already alerted for this room.")
        playSound()
        return
      }
      toast.success(`🧹 Cleaning alert sent for ${room.name}!`)
      playSound()
      setHousekeepingAlerted(prev => [...prev, room.id])
      return
    }

    if (room.status !== "free") return
    setSelectedRooms(prev =>
      prev.find(r => r.id === room.id) ? prev.filter(r => r.id !== room.id) : [...prev, room]
    )
  }

  // check-in action (create guest, mark rooms occupied)
  const handleCheckIn = () => {
    if (!form.name.trim()) {
      toast.error("Enter guest name")
      return
    }
    if (!selectedRooms.length) {
      toast.error("Select at least one room")
      return
    }

    const guestId = genId()
    const checkInISO = new Date().toISOString()
    const baseAmount = calculateTotalPrice()

    const newGuest: Guest = {
      id: guestId,
      name: form.name.trim(),
      address: form.address.trim(),
      idProof: form.idProof.trim(),
      roomIds: selectedRooms.map(r => r.id),
      checkInISO,
      bookedDays: Math.max(1, Number(form.days)),
      baseAmount,
      status: "checked-in",
    }

    // mark rooms occupied with guestId
    setRooms(prev =>
      prev.map(r =>
        selectedRooms.find(s => s.id === r.id)
          ? { ...r, status: "occupied", guestId }
          : r
      )
    )

    setGuests(prev => [newGuest, ...prev])
    toast.success("Guest checked in ✅")
    playSound()

    // close modal & clear selection & form (but keep guest record)
    setBookingOpen(false)
    setSelectedRooms([])
    setForm({ name: "", address: "", idProof: "", days: 1, manualPrice: "" })
    setPassportImage(null)
  }

  // compute hours elapsed from ISO strings (rounded up to full hours)
  const hoursSince = (iso: string) => {
    const start = new Date(iso).getTime()
    const now = Date.now()
    const diffMs = now - start
    const hours = diffMs / (1000 * 60 * 60)
    return Math.ceil(hours) // charge per started hour
  }

  // check-out flow: compute extra hours & charge, allow override
  const handleCheckOut = (guest: Guest) => {
    const nowISO = new Date().toISOString()
    const totalHours = hoursSince(guest.checkInISO)
    const bookedHours = guest.bookedDays * 24
    const extraHours = Math.max(0, totalHours - bookedHours)
    const extraCharge = extraHours * HOURLY_LATE_FEE
    const base = guest.baseAmount || 0
    const computedTotal = base + extraCharge

    // ask user for confirmation and show override option
    const userChoice = window.confirm(
      `Guest: ${guest.name}\nRooms: ${guest.roomIds.join(", ")}\nBooked days: ${guest.bookedDays}\nHours stayed: ${totalHours}\nExtra hours: ${extraHours}\nExtra charge: ₹${extraCharge}\n\nConfirm checkout and charge ₹${computedTotal}? (Press Cancel to open manual override)`
    )

    if (userChoice) {
      // perform checkout
      finalizeCheckOut(guest, { checkOutISO: nowISO, extraHours, extraCharge, totalCharge: computedTotal })
      toast.success("Checked out and billed ✅")
      playSound()
      return
    }

    // manual override path
    const manualInput = prompt(`Enter manual total amount to charge (numeric). Suggested: ${computedTotal}`, String(computedTotal))
    if (manualInput === null) {
      toast("Checkout cancelled")
      return
    }
    const manualTotal = Number(manualInput)
    if (isNaN(manualTotal)) {
      toast.error("Invalid manual amount")
      return
    }

    finalizeCheckOut(guest, { checkOutISO: nowISO, extraHours, extraCharge, totalCharge: manualTotal })
    toast.success("Checked out with manual override ✅")
    playSound()
  }

  // apply checkout result: update guest record, mark rooms housekeeping
  const finalizeCheckOut = (guest: Guest, result: { checkOutISO: string; extraHours: number; extraCharge: number; totalCharge: number }) => {
    // mark rooms housekeeping and remove guestId
    setRooms(prev =>
      prev.map(r =>
        guest.roomIds.includes(r.id) ? { ...r, status: "housekeeping", guestId: null } : r
      )
    )

    // update guest record to checked-out and store checkout details
    setGuests(prev =>
      prev.map(g => (g.id === guest.id ? { ...g, status: "checked-out", checkOutISO: result.checkOutISO, extraHours: result.extraHours, extraCharge: result.extraCharge, totalCharge: result.totalCharge } : g))
    )
  }

  // housekeeping: mark room as cleaned (free)
  const markRoomCleaned = (roomId: number) => {
    setRooms(prev => prev.map(r => (r.id === roomId ? { ...r, status: "free" } : r)))
    // remove alert if exists
    setHousekeepingAlerted(prev => prev.filter(id => id !== roomId))
    toast.success(`Room ${roomId} marked as cleaned`)
    playSound()
  }

  // small helpers for UI
  const occupiedGuests = useMemo(() => guests.filter(g => g.status === "checked-in"), [guests])
  const pastGuests = useMemo(() => guests.filter(g => g.status === "checked-out"), [guests])
  const housekeepingRooms = rooms.filter(r => r.status === "housekeeping")

  // Limit date selection (no past days)
  const disabledDays = (day: Date) => {
    const today = new Date()
    return day < new Date(today.setHours(0, 0, 0, 0))
  }

  // room status text mapping & style (monochrome)
  const statusInfo = {
    free: { label: "Available", style: "bg-white text-black border border-black hover:bg-gray-100" },
    housekeeping: { label: "Needs Cleaning", style: "bg-gray-100 text-black border border-dashed border-black hover:bg-gray-200" },
    occupied: { label: "Occupied", style: "bg-gray-200 text-gray-700 border border-black opacity-70 cursor-not-allowed" },
    maintenance: { label: "Under Maintenance", style: "bg-gray-300 text-gray-700 border border-black opacity-60 cursor-not-allowed" },
  } as const

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold border-b border-black pb-3">Resort Room Booking & Check-In</h1>
        <p className="text-sm mt-2 opacity-80">Current Time: {currentDate.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Calendar + Selected rooms summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-black shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={disabledDays}
                className="rounded-md border border-black"
                required={false}
              />
            </CardContent>
          </Card>

          <Card className="border border-black shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Selected Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedRooms.length ? (
                  selectedRooms.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-2 border border-gray-100 rounded">
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs opacity-70">{r.category} • ₹{r.pricePerDay}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">₹{r.pricePerDay}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">No rooms selected</div>
                )}
              </div>

              <div className="mt-4 text-center">
                <div className="font-semibold">Total: ₹{calculateTotalPrice().toLocaleString("en-IN")}</div>
                <div className="text-xs opacity-70">Days: {form.days}</div>
                <div className="mt-3 flex gap-2 justify-center">
                  {selectedRooms.length > 0 && (
                    <Button onClick={() => setBookingOpen(true)} className="border border-black bg-white text-black hover:bg-black hover:text-white">
                      Check-In Guest
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { playSound(); router.push("/checkout") }} className="border border-black bg-white text-black hover:bg-black hover:text-white">Checkout Page</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Room grid */}
        <div className="lg:col-span-1">
          <Card className="border border-black shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Room Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {rooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`${statusInfo[room.status].style} rounded-lg p-2 text-center text-sm transition ${selectedRooms.find(r => r.id === room.id) ? "ring-2 ring-black" : ""}`}
                  >
                    <div className="font-semibold">{room.name}</div>
                    <div className="text-xs opacity-70">{room.category}</div>
                    <div className="text-xs mt-1 italic">{statusInfo[room.status].label}</div>
                    {room.status === "occupied" && room.guestId && (
                      <div className="text-xs mt-1">Guest: {guests.find(g => g.id === room.guestId)?.name ?? "—"}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Current Guests + Housekeeping */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-black shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Current Guests</CardTitle>
            </CardHeader>
            <CardContent>
              {occupiedGuests.length ? (
                <div className="space-y-3">
                  {occupiedGuests.map(g => {
                    const hours = hoursSince(g.checkInISO)
                    return (
                      <div key={g.id} className="p-2 border border-gray-100 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{g.name}</div>
                            <div className="text-xs opacity-70">Rooms: {g.roomIds.join(", ")}</div>
                            <div className="text-xs opacity-70">Checked in: {formatDateTime12(g.checkInISO)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{hours} hrs</div>
                            <div className="text-xs opacity-60">Booked: {g.bookedDays} days</div>
                          </div>
                        </div>

                        <div className="mt-2 flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => handleCheckOut(g)} className="text-sm border border-black bg-white hover:bg-black hover:text-white">Check-Out</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-xs text-gray-500">No current guests</div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-black shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Housekeeping</CardTitle>
            </CardHeader>
            <CardContent>
              {housekeepingRooms.length ? (
                housekeepingRooms.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 border border-gray-100 rounded mb-2">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs opacity-70">{r.category}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => markRoomCleaned(r.id)} className="text-sm border border-black bg-white hover:bg-black hover:text-white">Mark Cleaned</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No rooms pending cleaning</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking / Check-in Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="bg-white text-black border border-black rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-semibold text-lg">Check-In Guest</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Guest name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-black" />
            </div>

            <div>
              <Label>Address</Label>
              <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="border border-black" />
            </div>

            <div>
              <Label>ID / Passport</Label>
              <Input placeholder="Passport or ID number" value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })} className="border border-black" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Number of Days</Label>
                <Input type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: Math.max(1, Number(e.target.value)) })} className="border border-black" />
              </div>
              <div>
                <Label>Manual Price (optional)</Label>
                <Input type="number" placeholder="Custom total" value={form.manualPrice} onChange={(e) => setForm({ ...form, manualPrice: e.target.value })} className="border border-black" />
              </div>
            </div>

            <div className="font-semibold text-center">Calculated Total: ₹{calculateTotalPrice().toLocaleString("en-IN")}</div>

            <div {...getRootProps()} className="border border-dashed border-black p-4 text-center rounded-lg cursor-pointer">
              <input {...getInputProps()} />
              {isDragActive ? <p>Drop ID image...</p> : passportImage ? (
                <div className="flex flex-col items-center">
                  <Image src={URL.createObjectURL(passportImage)} alt="id" width={150} height={150} className="rounded-md" />
                  <p className="text-sm mt-2">{passportImage.name}</p>
                </div>
              ) : <p>Drag or click to upload ID image (optional)</p>}
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => { setBookingOpen(false); playSound() }} className="border border-black bg-white text-black hover:bg-black hover:text-white">Cancel</Button>
              <Button onClick={handleCheckIn} className="border border-black bg-black text-white hover:bg-white hover:text-black">Confirm Check-In</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
