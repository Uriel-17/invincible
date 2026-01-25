import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from '../types'
import CreatePickSingleFields from './CreatePickSingleFields'
import CreatePickParlayFields from './CreatePickParlayFields'

const CreatePickFields = () => {
  const { t } = useTranslation()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreatePickFormValues>()

  const betType = watch('betType')

  return (
    <>
      <label className="create-pick-field">
        <span>{t('betType')}</span>
        <select {...register('betType')} required>
          <option value="single">{t('single')}</option>
          <option value="parlay">{t('parlay')}</option>
        </select>
      </label>
      <label className="create-pick-field">
        <span>{t('outcome')}</span>
        <select {...register('outcome')} required>
          <option value="win">{t('win')}</option>
          <option value="loss">{t('loss')}</option>
          <option value="pending">{t('pending')}</option>
        </select>
      </label>
      <label className="create-pick-field">
        <span>{t('placedAt')}</span>
        <input type="date" {...register('placedAt', { required: true })} />
        {errors.placedAt ? (
          <span className="create-pick-error">{t('requiredField')}</span>
        ) : null}
      </label>
      {betType === 'parlay' ? <CreatePickParlayFields /> : <CreatePickSingleFields />}
    </>
  )
}

export default CreatePickFields
