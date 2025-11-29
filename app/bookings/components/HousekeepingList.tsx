"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Room } from "./RoomGrid"

interface Props {
  rooms: Room[]
  onMarkCleaned: (roomId: string) => void
}

export default function HousekeepingList({ rooms, onMarkCleaned }: Props) {
  const housekeepingRooms = rooms.filter(
    (room) => room.status === "housekeeping"
  )

  return (
    <Card className="border border-black shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Housekeeping
        </CardTitle>
      </CardHeader>

      <CardContent>
        {housekeepingRooms.length === 0 ? (
          <p className="text-sm text-gray-500">
            No rooms pending cleaning
          </p>
        ) : (
          <div className="space-y-2">
            {housekeepingRooms.map((room) => (
              <div
                key={room.id}
                className="flex justify-between items-center border border-gray-200 rounded-md p-3"
              >
                <div>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-xs opacity-70">
                    {room.category}
                  </p>
                </div>

                <Button
                  onClick={() => onMarkCleaned(room.id)}
                  className="border border-black bg-white text-black hover:bg-black hover:text-white text-sm"
                >
                  Mark Cleaned
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
