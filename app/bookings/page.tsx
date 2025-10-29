"use client"

import { useState, useEffect } from "react"
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
}

const basePrices = {
  Deluxe: 2800,
  Executive: 4500,
  Suite: 6800,
}

// Status display text & styles (pure black/white theme)
const statusInfo: Record<
  Room["status"],
  { label: string; style: string; description: string }
> = {
  free: {
    label: "Available",
    style: "bg-white text-black border border-black hover:bg-gray-100",
    description: "This room is ready to be booked immediately.",
  },
  housekeeping: {
    label: "Needs Cleaning",
    style: "bg-gray-100 text-black border border-dashed border-black hover:bg-gray-200",
    description: "The room is being cleaned or needs cleaning before next use.",
  },
  occupied: {
    label: "Occupied",
    style: "bg-gray-200 text-gray-700 border border-black opacity-70 cursor-not-allowed",
    description: "Currently occupied by a guest. Cannot be booked now.",
  },
  maintenance: {
    label: "Under Maintenance",
    style: "bg-gray-300 text-gray-700 border border-black opacity-60 cursor-not-allowed",
    description: "This room is being repaired or checked by staff.",
  },
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
    passportNumber: "",
    days: 1,
    totalPrice: 0,
    manualPrice: "",
  })

  // 🎵 Notification sound setup
  const playSound = () => {
    const audio = new Audio("/sounds/notify.mp3")
    audio.play().catch(() => {})
  }

  // 🕓 Sync system date dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 🏠 Generate room data dynamically
  useEffect(() => {
    const generatedRooms: Room[] = Array.from({ length: 33 }, (_, i) => {
      const id = i + 1
      let category: Room["category"] = "Deluxe"
      if (id > 11 && id <= 22) category = "Executive"
      else if (id > 22) category = "Suite"

      const statuses: Room["status"][] = ["free", "occupied", "maintenance", "housekeeping"]
      const randomStatus =
        Math.random() < 0.4 ? "free" : statuses[Math.floor(Math.random() * statuses.length)]

      return {
        id,
        name: `Room ${id}`,
        category,
        status: randomStatus,
        pricePerDay: basePrices[category],
      }
    })
    setRooms(generatedRooms)
  }, [])

  // 🧹 Handle clicking on room (booking or housekeeping alert)
  const handleRoomClick = (room: Room) => {
    if (room.status === "housekeeping") {
      if (housekeepingAlerted.includes(room.id)) {
        toast("Housekeeping already alerted for this room.")
        playSound()
        return
      }
      toast.success(`🧹 Cleaning alert sent for ${room.name}!`)
      playSound()
      setHousekeepingAlerted([...housekeepingAlerted, room.id])
      return
    }

    if (room.status !== "free") return
    setSelectedRooms((prev) =>
      prev.find((r) => r.id === room.id)
        ? prev.filter((r) => r.id !== room.id)
        : [...prev, room]
    )
  }

  // 🧾 File upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => setPassportImage(acceptedFiles[0]),
  })

  // 💰 Calculate total price
  const calculateTotalPrice = () => {
    if (form.manualPrice) return Number(form.manualPrice)
    return selectedRooms.reduce((sum, r) => sum + r.pricePerDay, 0) * form.days
  }

  // ✅ Booking confirmation
  const handleSubmit = () => {
    const total = calculateTotalPrice()
    toast.success("✅ Booking confirmed successfully!")
    playSound()

    localStorage.setItem(
      "bookingData",
      JSON.stringify({
        selectedDate,
        selectedRooms,
        form,
        totalPrice: total,
      })
    )

    setBookingOpen(false)
    setSelectedRooms([])
    setForm({
      name: "",
      passportNumber: "",
      days: 1,
      totalPrice: 0,
      manualPrice: "",
    })
    setPassportImage(null)
  }

  // 🗓️ Limit date selection (no past days)
  const disabledDays = (day: Date) => {
    const today = new Date()
    return day < new Date(today.setHours(0, 0, 0, 0))
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold border-b border-black pb-3">
          Resort Room Booking System
        </h1>
        <p className="text-sm mt-2 opacity-80">
          Current Date: {currentDate.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🗓️ Calendar */}
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

        {/* 🏠 Room Grid */}
        <Card className="border border-black shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Room Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2"> 
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className={`rounded-lg p-2 text-center text-sm transition ${statusInfo[room.status].style} ${
                    selectedRooms.find((r) => r.id === room.id)
                      ? "ring-2 ring-black"
                      : ""
                  }`}
                >
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-xs opacity-70">{room.category}</div>
                  <div className="text-xs mt-1 italic">{statusInfo[room.status].label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              {selectedRooms.length > 0 && (
                <Button
                  onClick={() => {
                    playSound()
                    setBookingOpen(true)
                  }}
                  className="border border-black bg-white text-black hover:bg-black hover:text-white"
                >
                  Book {selectedRooms.length} Room
                  {selectedRooms.length > 1 ? "s" : ""}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  playSound()
                  router.push("/checkout")
                }}
                className="border border-black bg-white text-black hover:bg-black hover:text-white"
              >
                Go to Checkout 🧾
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🪶 Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="bg-white text-black border border-black rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-semibold text-lg">
              Book Room(s)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Guest name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-black"
              />
            </div>

            <div>
              <Label>Passport Number</Label>
              <Input
                placeholder="Passport number"
                value={form.passportNumber}
                onChange={(e) =>
                  setForm({ ...form, passportNumber: e.target.value })
                }
                className="border border-black"
              />
            </div>

            <div>
              <Label>Number of Days</Label>
              <Input
                type="number"
                min={1}
                value={form.days}
                onChange={(e) =>
                  setForm({ ...form, days: Number(e.target.value) })
                }
                className="border border-black"
              />
            </div>

            <div>
              <Label>Manual Price (optional)</Label>
              <Input
                type="number"
                placeholder="Custom price"
                value={form.manualPrice}
                onChange={(e) =>
                  setForm({ ...form, manualPrice: e.target.value })
                }
                className="border border-black"
              />
            </div>

            <div className="font-semibold text-center">
              Total: ₹{calculateTotalPrice().toLocaleString("en-IN")}
            </div>

            <div
              {...getRootProps()}
              className="border border-dashed border-black p-4 text-center rounded-lg cursor-pointer"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop passport image here...</p>
              ) : passportImage ? (
                <div className="flex flex-col items-center">
                  <Image
                    src={URL.createObjectURL(passportImage)}
                    alt="passport"
                    width={150}
                    height={150}
                    className="rounded-md"
                  />
                  <p className="text-sm mt-2">{passportImage.name}</p>
                </div>
              ) : (
                <p>Drag or click to upload passport</p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setBookingOpen(false)
                  playSound()
                }}
                className="border border-black bg-white text-black hover:bg-black hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="border border-black bg-black text-white hover:bg-white hover:text-black"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
