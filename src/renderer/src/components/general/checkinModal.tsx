import { createPortal } from 'react-dom'

export default function Modal({
  onClose,
  children
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a2e',
          borderRadius: 6,
          padding: '1.5rem',
          minWidth: 320,
          border: '0.5px solid rgba(128,128,128,0.3)'
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
