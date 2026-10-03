import { useEffect, useRef } from 'react'
import './Modal.css'

function Modal({ title, children, onClose }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        className="modal" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        ref={modalRef}
      >
        <button 
          className="modal-close" 
          onClick={onClose} 
          aria-label="Close"
        >
          &times;
        </button>

        <h2 id="modal-title">{title}</h2>

        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal