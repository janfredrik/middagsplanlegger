import { useCallback, useRef } from 'react'

export function useLongPress(callback: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => callbackRef.current(), ms)
  }, [ms])

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }
}
