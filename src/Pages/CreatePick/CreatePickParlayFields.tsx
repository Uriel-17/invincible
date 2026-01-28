import { useT } from '../../hooks/useT'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from '../types'
import TextField from '../../Components/Form/TextField'

const CreatePickParlayFields = () => {
  const _T = useT()
  const { control, watch } = useFormContext<CreatePickFormValues>()
  const outcome = watch('outcome')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'legs',
  })

  return (
    <>
      <div className="create-pick-legs">
        <div className="create-pick-legs-header">
          <span>{_T('Parlay legs')}</span>
          <button
            type="button"
            className="create-pick-button create-pick-button-ghost"
            onClick={() => append({ description: '', quota: '', market: '' })}
          >
            {_T('Add leg')}
          </button>
        </div>
        {fields.map((field, index) => (
          <div className="create-pick-leg" key={field.id}>
            <TextField
              name={`legs.${index}.description`}
              label={`${_T('Leg')} ${index + 1}`}
              placeholder={_T('Team vs Team')}
              requiredMessage={_T('This field is required.')}
            />
            <TextField
              name={`legs.${index}.market`}
              label={_T('Leg market')}
              type="text"
              requiredMessage={_T('This field is required.')}
            />
            <TextField
              name={`legs.${index}.quota`}
              label={_T('Leg quota')}
              placeholder={_T('e.g. -110')}
              requiredMessage={_T('This field is required.')}
            />
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
      <TextField
        name="betAmount"
        label={_T('Bet amount')}
        type="number"
        step="0.01"
        requiredMessage={_T('This field is required.')}
      />
      <TextField
        name="selection"
        label={_T('Selection')}
        type="text"
        requiredMessage={_T('This field is required.')}
      />
      <TextField
        name="quota"
        label={_T('Quota')}
        placeholder={_T('e.g. -110')}
        requiredMessage={_T('This field is required.')}
      />
      <TextField
        name="potentialGains"
        label={_T('Potential Gains')}
        type="number"
        step="0.01"
        requiredMessage={_T('This field is required.')}
      />
      <TextField
        name="notes"
        label={_T('Notes')}
        type="text"
      />
      {outcome === 'cashout' && (
        <TextField
          name="cashout"
          label={_T('Cashout')}
          type="number"
          step="0.01"
          requiredMessage={_T('This field is required.')}
        />
      )}
      <TextField
        name="netGain"
        label={_T('Net Gain')}
        type="number"
        step="0.01"
        requiredMessage={_T('This field is required.')}
      />
    </>
  )
}

export default CreatePickParlayFields
