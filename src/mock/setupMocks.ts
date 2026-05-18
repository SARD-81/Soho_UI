import type { AxiosInstance } from 'axios';
import { createMockAdapter } from './mockAdapter';
import { mockState } from './mockState';
import routes from './routes';

export const setupAxiosMockAdapter = (axiosInstance: AxiosInstance) => {
  axiosInstance.defaults.adapter = createMockAdapter(routes, mockState, 0);
};
