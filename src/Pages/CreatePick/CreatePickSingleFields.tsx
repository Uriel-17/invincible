import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from '../types'

const CreatePickSingleFields = () => {
  const { t } = useTranslation()
  const {
    register,
    formState: { errors },
  } = useFormContext<CreatePickFormValues>()

  return (
    <>
      <label className="create-pick-field">
        <span>{t('betAmount')}</span>
        <input type="number" step="0.01" {...register('betAmount', { required: true })} />
        {errors.betAmount ? (
          <span className="create-pick-error">{t('requiredField')}</span>
        ) : null}
      </label>
      <label className="create-pick-field">
        <span>{t('quota')}</span>
        <input
          type="text"
          placeholder={t('quotaPlaceholder')}
          {...register('quota', { required: true })}
        />
        {errors.quota ? (
          <span className="create-pick-error">{t('requiredField')}</span>
        ) : null}
      </label>
    </>
  )
}

export default CreatePickSingleFields
