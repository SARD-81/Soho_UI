export type ServicePrimitiveValue = string | number | boolean | null | undefined;

export type ServiceValue = ServicePrimitiveValue | ServicePrimitiveValue[];

export interface ServiceDetails {
  unit?: string | null;
  [key: string]: ServiceValue;
}

export interface ServicesResponse {
  data?: Record<string, ServiceDetails>;
}

export type ServiceActionType = 'start' | 'stop' | 'restart';
