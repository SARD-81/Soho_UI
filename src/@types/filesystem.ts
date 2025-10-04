export interface FileSystemRawEntry {
  [key: string]: unknown;
}

export interface FileSystemAttributeEntry {
  key: string;
  value: string;
}

export interface FileSystemEntry {
  id: string;
  fullName: string;
  poolName: string;
  filesystemName: string;
  attributes: FileSystemAttributeEntry[];
  attributeMap: Record<string, string>;
  raw: FileSystemRawEntry;
}

export interface FileSystemApiResponse {
  data?: unknown;
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export interface FileSystemQueryResult {
  filesystems: FileSystemEntry[];
}
