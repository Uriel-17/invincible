import { useT } from 'src/hooks/useT'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { CreateBetFormValues } from 'src/types/bets'
import TextField from 'src/Components/Form/TextField'
import {
  getBetAmountValidation,
  getSelectionValidation,
  getQuotaValidation,
  getPotentialGainsValidation,
  getNotesValidation,
  getCashoutValidation,
  getNetGainValidation,
  getLegDescriptionValidation,
  getLegMarketValidation,
  getLegQuotaValidation,
} from './helpers/fieldValidations'

const CreatePickParlayFields = () => {
  const _T = useT()
  const { control, watch } = useFormContext<CreateBetFormValues>()
  const outcome = watch('outcome')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'legs',
  })

  return (
    <>
      <TextField
        name="betAmount"
        label={_T('Bet amount')}
        {...getBetAmountValidation()}
      />
      <TextField
        name="selection"
        label={_T('Selection')}
        {...getSelectionValidation()}
      />
      <TextField
        name="quota"
        label={_T('Quota')}
        {...getQuotaValidation()}
      />
      <TextField
        name="potentialGains"
        label={_T('Potential Gains')}
        {...getPotentialGainsValidation()}
      />
      <TextField
        name="notes"
        label={_T('Notes')}
        {...getNotesValidation()}
      />
      {outcome === 'cashout' && (
        <TextField
          name="cashout"
          label={_T('Cashout')}
          {...getCashoutValidation()}
        />
      )}
      <TextField
        name="netGain"
        label={_T('Net Gain')}
        {...getNetGainValidation()}
      />
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
              {...getLegDescriptionValidation()}
            />
            <TextField
              name={`legs.${index}.market`}
              label={_T('Leg market')}
              {...getLegMarketValidation()}
            />
            <TextField
              name={`legs.${index}.quota`}
              label={_T('Leg quota')}
              {...getLegQuotaValidation()}
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
    </>
  )
}

export default CreatePickParlayFields
