import { Toaster } from 'react-hot-toast';
import type { AppToasterProps } from '../@types/components/appToaster';
import '../index.css';

export default function AppToaster({
  position = 'top-center',
}: AppToasterProps) {
  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-card-bg)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-primary)',
          borderRadius: '8px',
          fontFamily: 'var(--font-vazir)',
          direction: 'rtl',
        },
        success: {
          iconTheme: { primary: 'var(--color-primary)', secondary: 'white' },
        },
        error: {
          iconTheme: { primary: 'var(--color-error)', secondary: 'white' },
        },
      }}
    />
  );
}
