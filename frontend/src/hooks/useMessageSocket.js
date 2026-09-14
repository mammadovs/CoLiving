import { useEffect, useRef } from 'react'

const WS_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/^http/, 'ws')

/**
 * Connects to the backend's live messaging WebSocket for as long as the
 * component using this hook is mounted, and calls `onMessage` for every
 * message pushed to the current user.
 */
export function useMessageSocket(onMessage) {
    const socketRef = useRef(null)
    const onMessageRef = useRef(onMessage)
    onMessageRef.current = onMessage

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        const socket = new WebSocket(`${WS_BASE_URL}/messages/ws?token=${token}`)
        socketRef.current = socket

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                onMessageRef.current?.(data)
            } catch {
                // ignore malformed payloads
            }
        }

        socket.onerror = () => {
            // Connection issues are non-fatal: the app still works via
            // regular REST calls, this just loses live push until reconnect.
        }

        return () => {
            socket.close()
            socketRef.current = null
        }
    }, [])
}

export default useMessageSocket