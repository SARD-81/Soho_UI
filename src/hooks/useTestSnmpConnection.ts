import { useMutation } from '@tanstack/react-query';
import type {
  SnmpTestConnectionPayload,
  SnmpTestConnectionResponse,
} from '../@types/snmp';
import axiosInstance from '../lib/axiosInstance';

const testSnmpConnection = async (payload: SnmpTestConnectionPayload) => {
  const { data } = await axiosInstance.post<SnmpTestConnectionResponse>(
    '/api/snmp/test-connection/',
    payload
  );

  return data;
};

export const useTestSnmpConnection = () =>
  useMutation<SnmpTestConnectionResponse, Error, SnmpTestConnectionPayload>({
    mutationFn: testSnmpConnection,
  });

export type UseTestSnmpConnectionReturn = ReturnType<typeof useTestSnmpConnection>;
