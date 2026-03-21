import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import type { ReactNode } from 'react'
import Header from 'src/Components/Header'
import i18n from 'src/i18n'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: ReactNode } & Record<string, unknown>) => <a {...props}>{children}</a>,
}))

vi.mock('src/Components/HeaderComponents/AddFundsBtn', () => ({
  default: () => <div data-testid="add-funds-btn">Add Funds</div>,
}))

vi.mock('src/Components/HeaderComponents/HomeBtn', () => ({
  default: () => <div data-testid="home-btn">Home</div>,
}))

vi.mock('src/Components/HeaderComponents/SettingsBtn', () => ({
  default: () => <div data-testid="settings-btn">Settings</div>,
}))

vi.mock('src/Components/HeaderComponents/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme</div>,
}))

vi.mock('src/Pages/Welcome/CreatePickModal/CreatePickModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="create-pick-modal">
        <button type="button" onClick={onClose}>Close modal</button>
      </div>
    ) : null,
}))

const renderHeader = () => render(
  <I18nextProvider i18n={i18n}>
    <Header />
  </I18nextProvider>
)

describe('Header', () => {
  it('renders Create pick as the first primary header action', () => {
    const { container } = renderHeader()
    const createPickButton = screen.getByRole('button', { name: /Create pick/i })
    const actions = container.querySelector('.app-header-actions')

    expect(createPickButton).toHaveClass('header-btn', 'header-btn-outlined')
    expect(actions?.firstElementChild).toHaveTextContent('Create pick')
  })

  it('opens and closes the CreatePickModal from the header button', async () => {
    const user = userEvent.setup()
    renderHeader()

    expect(screen.queryByTestId('create-pick-modal')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Create pick/i }))
    expect(screen.getByTestId('create-pick-modal')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Close modal/i }))
    expect(screen.queryByTestId('create-pick-modal')).not.toBeInTheDocument()
  })
})