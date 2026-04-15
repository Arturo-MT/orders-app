import { useState, useEffect } from 'react'

function calcElapsed(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
  const minutes = Math.floor(diff / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (diff < 60) return 'ahora'
  if (hours < 1) return `${minutes} min`
  if (days < 1) {
    const remainingMins = minutes % 60
    return remainingMins > 0 ? `${hours} h ${remainingMins} min` : `${hours} h`
  }
  if (weeks < 1) return days === 1 ? '1 día' : `${days} días`
  return weeks === 1 ? '1 semana' : `${weeks} semanas`
}

export function useElapsedTime(createdAt: string) {
  const [label, setLabel] = useState(() => calcElapsed(createdAt))

  useEffect(() => {
    const interval = setInterval(() => setLabel(calcElapsed(createdAt)), 60_000)
    return () => clearInterval(interval)
  }, [createdAt])

  return label
}
