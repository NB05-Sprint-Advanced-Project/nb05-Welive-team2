import { ReadStream } from 'fs';

export interface IFileStream {
  readStream(path: string): Promise<ReadStream>;
}
