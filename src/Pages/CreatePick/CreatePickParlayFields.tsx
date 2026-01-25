import { useTranslation } from 'react-i18next'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from '../types'

const CreatePickParlayFields = () => {
  const { t } = useTranslation()
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreatePickFormValues>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'legs',
  })

  return (
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
  )
}

export default CreatePickParlayFields
