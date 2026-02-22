import { type ReactNode, type MouseEvent } from 'react'
import './Modal.css'

export interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  children: ReactNode
  titleId: string
  classNamePrefix: string
  zIndex?: number
  overlayOpacity?: number
  showBackdropBlur?: boolean
}

const Modal = ({
  isOpen,
  onClose,
  children,
  titleId,
  classNamePrefix,
  zIndex = 100,
  overlayOpacity = 0.98,
  showBackdropBlur = true,
}: ModalProps) => {
  if (!isOpen) {
    return null
  }

  const handleOverlayClick = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleDialogClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const overlayStyle = {
    '--modal-z-index': zIndex,
    '--modal-overlay-opacity': overlayOpacity,
    '--modal-backdrop-blur': showBackdropBlur ? 'blur(8px)' : 'none',
  } as React.CSSProperties

  return (
    <div
      className={`${classNamePrefix}-overlay modal-overlay`}
      role="presentation"
      onClick={handleOverlayClick}
      style={overlayStyle}
    >
      <div
        className={`${classNamePrefix}-dialog modal-dialog`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={handleDialogClick}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal

