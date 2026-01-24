import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useFieldArray, useForm } from 'react-hook-form'

type CreatePickFormValues = {
  betType: 'single' | 'parlay'
  betAmount: string
  quota: string
  outcome: 'win' | 'loss' | 'pending'
  placedAt: string
  legs: Array<{
    description: string
    quota: string
  }>
}

type CreatePickFormProps = {
  onSubmit: (values: CreatePickFormValues) => void
}

const CreatePickForm = ({ onSubmit }: CreatePickFormProps) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<CreatePickFormValues>({
    defaultValues: {
      betType: 'single',
      betAmount: '',
      quota: '',
      outcome: 'pending',
      placedAt: '',
      legs: [{ description: '', quota: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'legs',
  })

  const betType = watch('betType')

  useEffect(() => {
    reset()
  }, [reset])

  return (
    <form
      className="create-pick-form"
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <label className="create-pick-field">
        <span>{t('betType')}</span>
        <select {...register('betType')} required>
          <option value="single">{t('single')}</option>
          <option value="parlay">{t('parlay')}</option>
        </select>
      </label>
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
        <input type="datetime-local" {...register('placedAt', { required: true })} />
        {errors.placedAt ? (
          <span className="create-pick-error">{t('requiredField')}</span>
        ) : null}
      </label>
      {betType === 'parlay' ? (
        <div className="create-pick-legs">
          <div className="create-pick-legs-header">
            <span>{t('parlayLegs')}</span>
            <button
              type="button"
              className="create-pick-button create-pick-button-ghost"
              onClick={() => append({ description: '', quota: '' })}
            >
              {t('addLeg')}
            </button>
          </div>
          {fields.map((field, index) => (
            <div className="create-pick-leg" key={field.id}>
              <label className="create-pick-field">
                <span>{t('legLabel', { index: index + 1 })}</span>
                <input
                  type="text"
                  placeholder={t('legPlaceholder')}
                  {...register(`legs.${index}.description`, { required: true })}
                />
                {errors.legs?.[index]?.description ? (
                  <span className="create-pick-error">{t('requiredField')}</span>
                ) : null}
              </label>
              <label className="create-pick-field">
                <span>{t('legQuota')}</span>
                <input
                  type="text"
                  placeholder={t('quotaPlaceholder')}
                  {...register(`legs.${index}.quota`, { required: true })}
                />
                {errors.legs?.[index]?.quota ? (
                  <span className="create-pick-error">{t('requiredField')}</span>
                ) : null}
              </label>
              {fields.length > 1 ? (
                <button
                  type="button"
                  className="create-pick-button create-pick-button-link"
                  onClick={() => remove(index)}
                >
                  {t('remove')}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <div className="create-pick-actions">
        <button type="submit" className="create-pick-button create-pick-button-primary">
          {t('savePick')}
        </button>
      </div>
    </form>
  )
}

export default CreatePickForm
