export type ServicePrimitiveValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type ServiceValue = ServicePrimitiveValue | ServicePrimitiveValue[];

export interface ServiceDetails {
  unit?: string | null;
  description?: string | null;
  load?: string | null;
  active?: string | null;
  sub?: string | null;
  enabled?: boolean | null;
  masked?: boolean | null;
  status?: string | null;
  [key: string]: ServiceValue;
}

export interface ServiceEntry extends ServiceDetails {
  unit: string;
}

export interface ServicesResponseMeta {
  timestamp?: string;
  response_status_code?: number;
  response_status_text?: string;
}

export interface ServicesResponse {
  ok?: boolean;
  error?: string | null;
  message?: string | null;
  data?: ServiceEntry[];
  details?: Record<string, ServiceValue>;
  meta?: ServicesResponseMeta;
  request_data?: Record<string, ServiceValue>;
}

export type ServiceActionType =
  | 'start'
  | 'stop'
  | 'reload'
  | 'restart'
  | 'enable'
  | 'disable'
  | 'mask'
  | 'unmask';