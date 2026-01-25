import { useT } from '../../hooks/useT'
import { useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from '../types'
import CreatePickSingleFields from './CreatePickSingleFields'
import CreatePickParlayFields from './CreatePickParlayFields'

const CreatePickFields = () => {
  const _T = useT()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreatePickFormValues>()

  const betType = watch('betType')

  return (
    <>
      <label className="create-pick-field">
        <span>{_T('Bet Type')}</span>
        <select {...register('betType')} required>
          <option value="single">{_T('Single')}</option>
          <option value="parlay">{_T('Parlay')}</option>
        </select>
      </label>
      <label className="create-pick-field">
        <span>{_T('Outcome')}</span>
        <select {...register('outcome')} required>
          <option value="win">{_T('Win')}</option>
          <option value="loss">{_T('Loss')}</option>
          <option value="pending">{_T('Pending')}</option>
        </select>
      </label>
      <label className="create-pick-field">
        <span>{_T('Placed at')}</span>
        <input type="date" {...register('placedAt', { required: true })} />
        {errors.placedAt ? (
          <span className="create-pick-error">{_T('This field is required.')}</span>
        ) : null}
      </label>
      {betType === 'parlay' ? <CreatePickParlayFields /> : <CreatePickSingleFields />}
    </>
  )
}

export default CreatePickFields
