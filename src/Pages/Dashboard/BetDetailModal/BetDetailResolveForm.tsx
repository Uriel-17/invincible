import { useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useT } from 'src/hooks/useT'
import { useUpdateBet } from 'src/hooks/useUpdateBet'
import SelectField from 'src/Components/Form/SelectField'
import TextField from 'src/Components/Form/TextField'
import {
  getBetAmountValidation,
  getCashoutValidation,
  getMarketValidation,
  getNetGainValidation,
  getNotesValidation,
  getQuotaValidation,
  getSelectionValidation,
} from 'src/Pages/CreatePick/helpers/fieldValidations'
import type { BetRecord } from 'src/types/electron'
import type { OutcomeType } from 'src/types/bets'

interface BetDetailResolveFormProps {
  bet: BetRecord
  onSuccess: () => void
}

interface ResolveFormValues {
  outcome: OutcomeType
  netGain: string
  cashout: string
  market: string
  selection: string
  betAmount: string
  quota: string
  notes: string
}

const BetDetailResolveForm = ({ bet, onSuccess }: BetDetailResolveFormProps) => {
  const _T = useT()

  const methods = useForm<ResolveFormValues>({
    mode: 'onChange',
    defaultValues: {
      outcome: bet.outcome,
      netGain: String(bet.net_gain),
      cashout: bet.cashout_amount != null ? String(bet.cashout_amount) : '',
      market: bet.market ?? '',
      selection: bet.selection ?? '',
      betAmount: String(bet.bet_amount),
      quota: bet.quota,
      notes: bet.notes ?? '',
    },
  })

  const { trigger } = methods
  useEffect(() => { void trigger() }, [trigger])

  const outcome = useWatch({ control: methods.control, name: 'outcome' })
  const { mutate, isPending, error } = useUpdateBet({ onSuccess })

  const handleSubmit = methods.handleSubmit((values) => {
    mutate({
      betId: bet.id,
      outcome: values.outcome,
      netGain: values.netGain,
      cashout: values.outcome === 'cashout' ? values.cashout : undefined,
      market: values.market || undefined,
      selection: values.selection || undefined,
      betAmount: values.betAmount,
      quota: values.quota,
      notes: values.notes,
    })
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="bet-detail-resolve">
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
          name="betAmount"
          label={_T('Bet Amount')}
          {...getBetAmountValidation()}
        />
        <TextField
          name="quota"
          label={_T('Odds')}
          {...getQuotaValidation()}
        />
        <SelectField
          name="outcome"
          label={_T('Outcome')}
          requiredMessage={_T('This field is required.')}
          options={[
            { label: _T('Win'), value: 'win' },
            { label: _T('Loss'), value: 'loss' },
            { label: _T('Push'), value: 'push' },
            { label: _T('Cashout'), value: 'cashout' },
            { label: _T('Pending'), value: 'pending' },
          ]}
        />
        <TextField
          name="netGain"
          label={_T('Net Gain')}
          {...getNetGainValidation()}
        />
        {outcome === 'cashout' && (
          <TextField
            name="cashout"
            label={_T('Cashout')}
            {...getCashoutValidation()}
          />
        )}
        <TextField
          name="notes"
          label={_T('Notes')}
          {...getNotesValidation()}
        />

        {error && (
          <p className="bet-detail-resolve-error">{error.message}</p>
        )}

        <button
          type="submit"
          className="bet-detail-resolve-save"
          disabled={isPending || !methods.formState.isDirty || !methods.formState.isValid}
        >
          {isPending ? _T('Saving...') : _T('Save')}
        </button>
      </form>
    </FormProvider>
  )
}

export default BetDetailResolveForm
