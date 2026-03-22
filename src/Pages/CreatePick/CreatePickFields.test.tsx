import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { I18nextProvider } from 'react-i18next'
import CreatePickFields from 'src/Pages/CreatePick/CreatePickFields'
import type { CreateBetFormValues } from 'src/types/bets'
import i18n from 'src/i18n'

const renderWithForm = (defaultValues?: Partial<CreateBetFormValues>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<CreateBetFormValues>({
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

  return render(<CreatePickFields />, { wrapper: Wrapper })
}

describe('CreatePickFields', () => {
  it('renders the single bet fields by default', () => {
    renderWithForm()

    expect(screen.getByLabelText('Bet Type', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Bet amount', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Quota', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Outcome', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Placed at', { exact: false })).toBeInTheDocument()
    expect(screen.queryByText('Parlay legs')).not.toBeInTheDocument()
  })

  it('shows parlay leg inputs when bet type is parlay', async () => {
    const user = userEvent.setup()
    renderWithForm()

    await user.selectOptions(screen.getByLabelText('Bet Type'), 'parlay')

    expect(screen.getByText('Parlay legs')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Team vs Team')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('e.g. -110').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Leg market', { exact: false })).toBeInTheDocument()
  })
})
