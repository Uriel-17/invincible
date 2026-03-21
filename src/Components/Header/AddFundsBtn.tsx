import { useState } from 'react'
import { useT } from 'src/hooks/useT'
import AddFundsModal from './AddFundsModal'
import './helpers/HeaderButtons.css'

const AddFundsBtn = () => {
  const _T = useT()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="header-btn-wrapper">
        <button
          type="button"
          className="header-btn header-btn-secondary"
          onClick={() => setIsModalOpen(true)}
        >
          {_T('Add Funds')}
        </button>
      </div>

      <AddFundsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default AddFundsBtn