import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import './ToastContainer.css'

const ICONS = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (!toasts.length) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            role={isError ? 'alert' : 'status'}
          >
            <span className="toast__icon">
              <Icon size={18} />
            </span>

            <span className="toast__message">{toast.message}</span>

            <button
              type="button"
              className="toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
