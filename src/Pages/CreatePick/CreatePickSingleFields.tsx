import { useT } from '../../hooks/useT'
import { useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from '../types'

const CreatePickSingleFields = () => {
  const _T = useT()
  const {
    register,
    formState: { errors },
  } = useFormContext<CreatePickFormValues>()

  return (
    <>
      <label className="create-pick-field">
        <span>{_T('Bet amount')}</span>
        <input type="number" step="0.01" {...register('betAmount', { required: true })} />
        {errors.betAmount ? (
          <span className="create-pick-error">{_T('This field is required.')}</span>
        ) : null}
      </label>
      <label className="create-pick-field">
        <span>{_T('Quota')}</span>
        <input
          type="text"
          placeholder={_T('e.g. -110')}
          {...register('quota', { required: true })}
        />
        {errors.quota ? (
          <span className="create-pick-error">{_T('This field is required.')}</span>
        ) : null}
      </label>
    </>
  )
}

export default CreatePickSingleFields
