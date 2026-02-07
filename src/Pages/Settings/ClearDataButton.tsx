import { useState } from 'react'
import { useT } from 'src/hooks/useT'
import ClearDataModal from './ClearDataModal'

const ClearDataButton = () => {
  const _T = useT()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="settings-section settings-danger-zone">
        <h3 className="settings-section-title">{_T('Danger Zone')}</h3>
        <p className="settings-danger-description">
          {_T('Permanently delete all your betting data. This action cannot be undone.')}
        </p>
        <button
          type="button"
          className="settings-button settings-button-danger"
          onClick={() => setIsModalOpen(true)}
        >
          {_T('Clear All Data')}
        </button>
      </div>

      <ClearDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default ClearDataButton

