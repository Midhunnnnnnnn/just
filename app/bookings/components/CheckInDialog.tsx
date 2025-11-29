"use client"

import { useState } from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (data: {
    name: string
    address: string
    idProof: string
    days: number
    manualPrice: string
    passportImage: File | null
  }) => void
  calculatedTotal: number
}

export default function CheckInDialog({
  open,
  onClose,
  onConfirm,
  calculatedTotal,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    idProof: "",
    days: 1,
    manualPrice: "",
  })

  const [passportImage, setPassportImage] = useState<File | null>(null)

  // Dropzone for ID upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => setPassportImage(acceptedFiles[0]),
  })

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Guest name required")
      return
    }

    onConfirm({
      ...form,
      passportImage,
    })

    setForm({
      name: "",
      address: "",
      idProof: "",
      days: 1,
      manualPrice: "",
    })
    setPassportImage(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black border border-black rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Check-In Guest
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border border-black"
              placeholder="Guest name"
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              className="border border-black"
              placeholder="Guest address"
            />
          </div>

          <div>
            <Label>ID / Passport No</Label>
            <Input
              value={form.idProof}
              onChange={(e) =>
                setForm({ ...form, idProof: e.target.value })
              }
              className="border border-black"
              placeholder="ID / Passport"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Days</Label>
              <Input
                type="number"
                min={1}
                value={form.days}
                onChange={(e) =>
                  setForm({
                    ...form,
                    days: Math.max(1, Number(e.target.value)),
                  })
                }
                className="border border-black"
              />
            </div>

            <div>
              <Label>Manual Price (optional)</Label>
              <Input
                type="number"
                value={form.manualPrice}
                onChange={(e) =>
                  setForm({
                    ...form,
                    manualPrice: e.target.value,
                  })
                }
                className="border border-black"
                placeholder="Override total"
              />
            </div>
          </div>

          <div className="font-semibold text-center pt-2">
            Calculated Total: ₹{calculatedTotal.toLocaleString("en-IN")}
          </div>

          {/* Passport / ID Upload */}
          <div
            {...getRootProps()}
            className="border border-dashed border-black p-4 rounded-lg text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the ID image here...</p>
            ) : passportImage ? (
              <div className="flex flex-col items-center">
                <Image
                  src={URL.createObjectURL(passportImage)}
                  alt="id"
                  width={130}
                  height={130}
                  className="rounded-md"
                />
                <p className="text-xs mt-2">{passportImage.name}</p>
              </div>
            ) : (
              <p className="text-sm opacity-70">
                Drag or click to upload ID (optional)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="border border-black bg-white text-black hover:bg-black hover:text-white"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              className="border border-black bg-black text-white hover:bg-white hover:text-black"
            >
              Confirm Check-In
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
