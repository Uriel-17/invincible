import { useT } from '../../hooks/useT'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from '../types'

const CreatePickParlayFields = () => {
  const _T = useT()
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
        <span>{_T('Parlay legs')}</span>
        <button
          type="button"
          className="create-pick-button create-pick-button-ghost"
          onClick={() => append({ description: '', quota: '' })}
        >
          {_T('Add leg')}
        </button>
      </div>
      {fields.map((field, index) => (
        <div className="create-pick-leg" key={field.id}>
          <label className="create-pick-field">
            <span>
              {_T('Leg')} {index + 1}
            </span>
            <input
              type="text"
              placeholder={_T('Team vs Team')}
              {...register(`legs.${index}.description`, { required: true })}
            />
            {errors.legs?.[index]?.description ? (
              <span className="create-pick-error">{_T('This field is required.')}</span>
            ) : null}
          </label>
          <label className="create-pick-field">
            <span>{_T('Leg quota')}</span>
            <input
              type="text"
              placeholder={_T('e.g. -110')}
              {...register(`legs.${index}.quota`, { required: true })}
            />
            {errors.legs?.[index]?.quota ? (
              <span className="create-pick-error">{_T('This field is required.')}</span>
            ) : null}
          </label>
          {fields.length > 1 ? (
            <button
              type="button"
              className="create-pick-button create-pick-button-link"
              onClick={() => remove(index)}
            >
              {_T('Remove')}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default CreatePickParlayFields
