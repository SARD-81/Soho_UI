import { createContext, useContext } from 'react';
import type { PowerAction } from '../hooks/usePowerAction';

export interface SystemPowerActionsContextValue {
  requestPowerAction: (action: PowerAction) => void;
  isPowerActionDisabled: boolean;
}

const SystemPowerActionsContext =
  createContext<SystemPowerActionsContextValue | null>(null);

export const SystemPowerActionsProvider = SystemPowerActionsContext.Provider;

export const useSystemPowerActions = () => {
  const context = useContext(SystemPowerActionsContext);

  if (!context) {
    throw new Error(
      'useSystemPowerActions must be used within SystemPowerActionsProvider'
    );
  }

  return context;
};
