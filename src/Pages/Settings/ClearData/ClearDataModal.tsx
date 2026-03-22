import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useT } from 'src/hooks/useT'
import { getElectronAPI } from 'src/services/database'
import Modal from 'src/Components/Modal/Modal'
import './helpers/ClearDataModal.css'
import { useNavigate } from '@tanstack/react-router'

interface ClearDataModalProps {
  isOpen: boolean
  onClose: () => void
}

const ClearDataModal = ({ isOpen, onClose }: ClearDataModalProps) => {
  const _T = useT()
  const queryClient = useQueryClient()
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('')
  const [isClearing, setIsClearing] = useState(false)

  const handleConfirm = async () => {
    if (confirmText.toUpperCase() !== 'DELETE') {
      alert(_T('Please type DELETE to confirm'))
      return
    }

    setIsClearing(true)
    try {
      const api = getElectronAPI()
      const response = await api.database.clearAllData()

      if (response.success) {
        console.log('✅ All data cleared successfully')
        queryClient.invalidateQueries()
        setConfirmText('')
        onClose()
        navigate({ to: '/' });
      } else {
        throw new Error(response.error || 'Failed to clear data')
      }
    } catch (error) {
      console.error('❌ Failed to clear data:', error)
      alert(_T('Error clearing data: ') + (error as Error).message)
    }
  }

  const handleCancel = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      titleId="clear-data-title"
      classNamePrefix="clear-data"
      overlayOpacity={0.98}
    >
      <div className="clear-data-header">
        <h2 id="clear-data-title">{_T('Clear All Data')}</h2>
      </div>

      <div className="clear-data-content">
        <p className="clear-data-warning">
          ⚠️ {_T('This action cannot be undone!')}
        </p>
        <p className="clear-data-description">
          {_T('This will permanently delete all bets, parlay legs, bankroll snapshots, and monthly archives. Your user settings will be preserved.')}
        </p>
        <p className="clear-data-instruction">
          {_T('Type')} <strong>DELETE</strong> {_T('to confirm')}:
        </p>
        <input
          type="text"
          className="clear-data-input"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          disabled={isClearing}
          autoFocus
        />
      </div>

      <div className="clear-data-actions">
        <button
          type="button"
          className="clear-data-button clear-data-button-cancel"
          onClick={handleCancel}
          disabled={isClearing}
        >
          {_T('Cancel')}
        </button>
        <button
          type="button"
          className="clear-data-button clear-data-button-danger"
          onClick={handleConfirm}
          disabled={isClearing || confirmText.toUpperCase() !== 'DELETE'}
        >
          {isClearing ? _T('Clearing...') : _T('Clear All Data')}
        </button>
      </div>
    </Modal>
  )
}

export default ClearDataModal

