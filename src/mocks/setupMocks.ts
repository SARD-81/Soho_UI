import type { AxiosInstance } from 'axios';
import { mockAxiosAdapter } from './mockServer';
import { resetMockState } from './mockState';

let isMockAdapterAttached = false;

export const setupAxiosMockAdapter = (instance: AxiosInstance) => {
  if (isMockAdapterAttached) {
    return;
  }

  resetMockState();
  instance.defaults.adapter = mockAxiosAdapter;
  isMockAdapterAttached = true;

  if (typeof console !== 'undefined') {
    console.info('[Soho_UI] Mock API adapter enabled.');
  }
};
