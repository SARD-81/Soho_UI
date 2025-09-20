export type HistoryPoint = {
  time: number;
  upload: number;
  download: number;
};

export type History = Record<string, HistoryPoint[]>;

export type IPv4Info = {
  address: string;
  netmask: string | null;
};
