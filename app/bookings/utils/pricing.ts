export const BASE_PRICES = {
  Deluxe: 2800,
  Executive: 4500,
  Suite: 6800,
}

export const HOURLY_LATE_FEE = 200

// Calculate total room cost
export const calculateRoomTotal = (
  rooms: { pricePerDay: number }[],
  days: number
) => {
  return rooms.reduce((sum, r) => sum + r.pricePerDay, 0) * days
}

// Calculate hours from check-in
export const hoursSince = (iso: string) => {
  const start = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - start
  const hours = diffMs / (1000 * 60 * 60)
  return Math.ceil(hours)
}

// Calculate late checkout charges
export const calculateExtraCharge = (
  checkingISO: string,
  bookedDays: number
) => {
  const totalHours = hoursSince(checkingISO)
  const bookedHours = bookedDays * 24
  const extraHours = Math.max(0, totalHours - bookedHours)

  return {
    extraHours,
    extraCharge: extraHours * HOURLY_LATE_FEE,
  }
}
