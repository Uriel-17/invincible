import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { I18nextProvider } from 'react-i18next'
import CreatePickSingleFields from 'src/Pages/CreatePick/CreatePickSingleFields'
import type { CreatePickFormValues } from 'src/Pages/types'
import i18n from 'src/i18n'

const renderWithForm = (defaultValues?: Partial<CreatePickFormValues>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<CreatePickFormValues>({
      defaultValues: {
        betType: 'single',
        betAmount: '',
        quota: '',
        outcome: 'pending',
        placedAt: '',
        market: '',
        selection: '',
        potentialGains: '',
        notes: '',
        cashout: '',
        netGain: '',
        legs: [{ description: '', quota: '', market: '' }],
        ...defaultValues,
      },
    })

    return (
      <I18nextProvider i18n={i18n}>
        <FormProvider {...methods}>{children}</FormProvider>
      </I18nextProvider>
    )
  }

  return render(<CreatePickSingleFields />, { wrapper: Wrapper })
}

describe('CreatePickSingleFields', () => {
  it('renders single bet amount and quota inputs', () => {
    renderWithForm()

    expect(screen.getByLabelText('Bet amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Quota')).toBeInTheDocument()
  })

  it('does not render parlay legs section', () => {
    renderWithForm()

    expect(screen.queryByText('Parlay legs')).not.toBeInTheDocument()
  })
})
