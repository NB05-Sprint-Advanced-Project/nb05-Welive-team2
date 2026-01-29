import { IFileStream } from './i-fileStream';
import fs, { readFile, ReadStream } from 'fs';

export const createFileStream = (): IFileStream => {
  const readStream = async (path: string): Promise<ReadStream> => {
    return await fs.createReadStream(path);
  };

  return {
    readStream,
  };
};
