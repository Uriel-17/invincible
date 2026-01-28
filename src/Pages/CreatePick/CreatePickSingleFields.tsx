import { useT } from '../../hooks/useT'
import { useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from '../types'
import TextField from '../../Components/Form/TextField'

const CreatePickSingleFields = () => {
  const _T = useT()
  const { watch } = useFormContext<CreatePickFormValues>()
  const outcome = watch('outcome')

  return (
    <>
      <TextField
        name="betAmount"
        label={_T('Bet amount')}
        type="number"
        step="0.01"
        requiredMessage={_T('This field is required.')}
      />
      <TextField
        name="market"
        label={_T('Market')}
        type="text"
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

export default CreatePickSingleFields
