  "use client"

  import { cn } from "@/lib/utils"
  import { Button } from "@/components/ui/button"
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
  import { MoreVertical } from "lucide-react"

  export interface Room {
    id: string
    name: string
    category: "Deluxe" | "Executive" | "Suite"
    status: "free" | "occupied" | "maintenance" | "housekeeping"
    pricePerDay: number
    guestId?: string | null
  }

  interface RoomGridProps {
    rooms: Room[]
    guests: { id: string; name: string }[]
    selectedRooms: Room[]
    onRoomClick: (room: Room) => void
    onStatusChange?: (roomId: string, newStatus: Room["status"]) => void
  }

  export default function RoomGrid({
    rooms,
    selectedRooms,
    guests,
    onRoomClick,
    onStatusChange,
  }: RoomGridProps) {

    // 🔥 FIX: remove rooms that are now maintenance/housekeeping/free
    const cleanSelectedRooms = selectedRooms.filter(
      (r) => r.status === "free" || r.status === "housekeeping"
    );

    const statusConfig = {
      free: {
        container: "bg-white border-2 border-emerald-500 hover:border-emerald-600 hover:bg-emerald-50 cursor-pointer shadow-sm hover:shadow-md",
        indicator: "bg-emerald-500",
        badge: "bg-emerald-100 text-emerald-800 border border-emerald-200"
      },
      occupied: {
        container: "bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-rose-500 opacity-90 cursor-not-allowed shadow-sm",
        indicator: "bg-rose-500",
        badge: "bg-rose-100 text-rose-800 border border-rose-200"
      },
      maintenance: {
        container: "bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-500 opacity-85 cursor-not-allowed shadow-sm",
        indicator: "bg-amber-500",
        badge: "bg-amber-100 text-amber-800 border border-amber-200"
      },
      housekeeping: {
        container: "bg-white border-2 border-dashed border-blue-500 hover:border-blue-600 hover:bg-blue-50 cursor-pointer shadow-sm",
        indicator: "bg-blue-500",
        badge: "bg-blue-100 text-blue-800 border border-blue-200"
      },
    }

    const categoryColors = {
      Deluxe: "bg-purple-100 text-purple-800 border-purple-200",
      Executive: "bg-blue-100 text-blue-800 border-blue-200", 
      Suite: "bg-amber-100 text-amber-800 border-amber-200"
    }

    const handleStatusChange = (roomId: string, newStatus: Room["status"]) => {
      if (onStatusChange) {
        onStatusChange(roomId, newStatus);
      } else {
        console.warn("onStatusChange function not provided");
      }
    }

    return (
      <div className="space-y-4">

        {/* HEADER STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
            <div className="text-xl font-bold">{rooms.filter(r => r.status === 'free').length}</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
            <div className="text-xl font-bold text-rose-600">{rooms.filter(r => r.status === 'occupied').length}</div>
            <div className="text-xs text-gray-600">Occupied</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
            <div className="text-xl font-bold text-amber-600">{rooms.filter(r => r.status === 'maintenance').length}</div>
            <div className="text-xs text-gray-600">Maintenance</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
            <div className="text-xl font-bold text-blue-600">{rooms.filter(r => r.status === 'housekeeping').length}</div>
            <div className="text-xs text-gray-600">Cleaning</div>
          </div>
        </div>

        {/* ROOM GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
          {rooms.map((room) => {
            const isSelected = cleanSelectedRooms.find((r) => r.id === room.id)
            const guest = guests.find((g) => g.id === room.guestId)
            const config = statusConfig[room.status]

            return (
              <div
                key={room.id}
                onClick={() =>
                  room.status !== 'occupied' &&
                  room.status !== 'maintenance' &&
                  onRoomClick(room)
                }
                className={cn(
                  "relative rounded-xl p-3 transition-all duration-200 transform hover:scale-[1.02] min-h-[120px]",
                  config.container,
                  isSelected && "ring-2 ring-emerald-400 ring-offset-1",
                  (room.status === 'occupied' || room.status === 'maintenance') && "hover:scale-100"
                )}
              >

                {/* STATUS DOT */}
                <div className={cn(
                  "absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white",
                  config.indicator
                )} />

                {onStatusChange && (
                  <div className="absolute top-1 right-1 z-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-white/50">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white shadow-lg border text-xs">
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, "free")}>
                          Set as Free
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, "housekeeping")}>
                          Set as Housekeeping
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, "maintenance")}>
                          Set as Maintenance
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {/* ROOM HEADER */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{room.name}</div>
                    <div className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold mt-1 truncate",
                      config.badge
                    )}>
                      {room.status}
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border mb-2",
                  categoryColors[room.category]
                )}>
                  {room.category.charAt(0)}
                </div>

                <div className="text-center mb-2">
                  <div className="text-sm font-bold">₹{room.pricePerDay}</div>
                  <div className="text-[10px] text-gray-500">per night</div>
                </div>

                {room.status === "occupied" && guest && (
                  <div className="mt-1 p-1 bg-gray-50 rounded border border-gray-200">
                    <div className="text-[10px] text-gray-600">Guest</div>
                    <div className="text-xs font-semibold truncate">
                      {guest.name.split(' ')[0]}
                    </div>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute -top-1 -left-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

              </div>
            )
          })}
        </div>

        {/* SELECTED ROOMS SUMMARY */}
        {cleanSelectedRooms.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{cleanSelectedRooms.length} selected</div>
                <div className="text-xs text-gray-600">
                  ₹{cleanSelectedRooms.reduce((sum, room) => sum + room.pricePerDay, 0)}/night
                </div>
              </div>
              <div className="flex gap-1">
                {cleanSelectedRooms.slice(0, 3).map(room => (
                  <div 
                    key={room.id}
                    className={cn(
                      "w-6 h-6 rounded text-xs font-bold text-white flex items-center justify-center",
                      room.category === 'Deluxe' ? 'bg-purple-500' : 
                      room.category === 'Executive' ? 'bg-blue-500' : 'bg-amber-500'
                    )}
                  >
                    {room.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    )
  }
