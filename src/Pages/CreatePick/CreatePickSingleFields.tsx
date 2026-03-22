import { useT } from 'src/hooks/useT'
import { useFormContext } from 'react-hook-form'
import type { CreateBetFormValues } from 'src/types/bets'
import TextField from 'src/Components/Form/TextField'
import {
  getBetAmountValidation,
  getMarketValidation,
  getSelectionValidation,
  getQuotaValidation,
  getPotentialGainsValidation,
  getNotesValidation,
  getCashoutValidation,
  getNetGainValidation,
} from 'src/Pages/CreatePick/fieldValidations'

const CreatePickSingleFields = () => {
  const _T = useT()
  const { watch } = useFormContext<CreateBetFormValues>()
  const outcome = watch('outcome')

  return (
    <>
      <TextField
        name="betAmount"
        label={_T('Bet amount')}
        {...getBetAmountValidation()}
      />
      <TextField
        name="market"
        label={_T('Market')}
        {...getMarketValidation()}
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
    </>
  )
}

export default CreatePickSingleFields
