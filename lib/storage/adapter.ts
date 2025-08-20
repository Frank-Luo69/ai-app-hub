export interface PutResult {
  url: string;
  key: string;
  contentType: string;
  size: number;
}

export interface StorageAdapter {
  put(opts: { key?: string; data: Buffer; contentType: string }): Promise<PutResult>;
  delete(keyOrUrl: string): Promise<void>;
}
