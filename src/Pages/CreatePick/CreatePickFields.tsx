import { useT } from 'src/hooks/useT'
import { useFormContext } from 'react-hook-form'
import type { CreatePickFormValues } from 'src/Pages/types'
import CreatePickSingleFields from 'src/Pages/CreatePick/CreatePickSingleFields'
import CreatePickParlayFields from 'src/Pages/CreatePick/CreatePickParlayFields'
import SelectField from 'src/Components/Form/SelectField'
import DateField from 'src/Components/Form/DateField'

const CreatePickFields = () => {
  const _T = useT()
  const { watch } = useFormContext<CreatePickFormValues>()
  const betType = watch('betType')

  return (
    <>
      <SelectField
        name="betType"
        label={_T('Bet Type')}
        options={[
          { label: _T('Single'), value: 'single' },
          { label: _T('Parlay'), value: 'parlay' },
        ]}
      />
      <SelectField
        name="outcome"
        label={_T('Outcome')}
        options={[
          { label: _T('Win'), value: 'win' },
          { label: _T('Loss'), value: 'loss' },
          { label: _T('Push'), value: 'push' },
          { label: _T('Cashout'), value: 'cashout' },
          { label: _T('Pending'), value: 'pending' },
        ]}
      />
      <DateField
        name="placedAt"
        label={_T('Placed at')}
        requiredMessage={_T('This field is required.')}
      />
      {betType === 'parlay' ? <CreatePickParlayFields /> : <CreatePickSingleFields />}
    </>
  )
}

export default CreatePickFields
