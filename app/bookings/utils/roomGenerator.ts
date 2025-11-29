import { BASE_PRICES } from "./pricing"

export const generateRoomsForDB = () => {
  return Array.from({ length: 33 }, (_, i) => {
    const id = i + 1

    let category: "Deluxe" | "Executive" | "Suite" = "Deluxe"
    if (id > 11 && id <= 22) category = "Executive"
    else if (id > 22) category = "Suite"

    return {
      room_number: `Room ${id}`,
      category,
      price_per_day: BASE_PRICES[category],
      status: "free",
    }
  })
}
