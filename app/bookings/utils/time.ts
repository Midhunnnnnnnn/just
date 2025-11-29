// Format in clean Indian 12-hour style
export const formatDateTime12 = (iso: string) => {
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
