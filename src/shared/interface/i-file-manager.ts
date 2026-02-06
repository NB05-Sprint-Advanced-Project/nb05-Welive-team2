import { StreamingBlobPayloadOutputTypes } from '@smithy/types/dist-types/streaming-payload/streaming-blob-payload-output-types';
import { ContentType, UploadType } from '../utils/file-manager';
import multer from 'multer';

export interface IFileManager {
  getStorage: (type: UploadType) => multer.StorageEngine;
  getFile: (filePath: string) => Promise<ContentType>;
  readFile: (body: StreamingBlobPayloadOutputTypes) => Promise<string[]>;
  getUrl: (filePath: string) => Promise<string>;
}
