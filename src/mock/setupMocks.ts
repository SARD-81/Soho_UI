import type { AxiosInstance } from 'axios';
import routes from './routes';
import { createMockAdapter } from './mockAdapter';
import { mockState } from './mockState';

export const setupAxiosMockAdapter = (axiosInstance: AxiosInstance) => {
  axiosInstance.defaults.adapter = createMockAdapter(routes, mockState);
};
