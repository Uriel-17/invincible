import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { I18nextProvider } from 'react-i18next'
import CreatePickFields from './CreatePickFields'
import type { CreatePickFormValues } from '../types'
import i18n from '../../i18n'

const renderWithForm = (defaultValues?: Partial<CreatePickFormValues>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<CreatePickFormValues>({
      defaultValues: {
        betType: 'single',
        betAmount: '',
        quota: '',
        outcome: 'pending',
        placedAt: '',
        legs: [{ description: '', quota: '' }],
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

    expect(screen.getByLabelText('Bet Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Bet amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Quota')).toBeInTheDocument()
    expect(screen.getByLabelText('Outcome')).toBeInTheDocument()
    expect(screen.getByLabelText('Placed at')).toBeInTheDocument()
    expect(screen.queryByText('Parlay legs')).not.toBeInTheDocument()
  })

  it('shows parlay leg inputs when bet type is parlay', async () => {
    const user = userEvent.setup()
    renderWithForm()

    await user.selectOptions(screen.getByLabelText('Bet Type'), 'parlay')

    expect(screen.getByText('Parlay legs')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Team vs Team')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. -110')).toBeInTheDocument()
  })
})
