import { useT } from 'src/hooks/useT';
import type { SettingsData } from 'src/hooks/useSettings';
import { useForm } from 'react-hook-form';
export interface SettingsFormProps {
  initialData: SettingsData;
}

export interface PreferencesSectionProps {
  _T: ReturnType<typeof useT>;
  methods: ReturnType<typeof useForm<SettingsData>>;
}

export interface UserInformationSectionProps {
  _T: ReturnType<typeof useT>;
  currentBankroll: number | undefined;
  formatCurrency: (amount: number) => string;
}

export interface SettingsActionsProps {
  _T: ReturnType<typeof useT>;
  hasChanges: boolean;
  isValid: boolean;
  isPending: boolean;
}