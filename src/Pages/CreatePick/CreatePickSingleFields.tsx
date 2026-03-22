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
} from 'src/Pages/CreatePick/helpers/fieldValidations'

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
        hint={_T('Type of bet — e.g. Moneyline, Spread, Over/Under')}
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
        hint={_T('Odds at time of bet — e.g. -110 or +150')}
        {...getQuotaValidation()}
      />
      <TextField
        name="potentialGains"
        label={_T('Potential Gains')}
        hint={_T('Profit if the bet wins, not including your stake')}
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
          hint={_T('Amount the sportsbook paid you when you cashed out early')}
          {...getCashoutValidation()}
        />
      )}
      <TextField
        name="netGain"
        label={_T('Net Gain')}
        hint={_T('What you won or lost — negative for a loss, e.g. -50')}
        {...getNetGainValidation()}
      />
    </>
  )
}

export default CreatePickSingleFields
