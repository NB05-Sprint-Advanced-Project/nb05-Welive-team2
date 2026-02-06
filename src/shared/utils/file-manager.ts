/* eslint-disable @typescript-eslint/no-explicit-any */
import { getEnv } from '../../config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { FileStorage } from './file-storage';
import { Readable } from 'stream';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IFileManager } from '../interface/i-file-manager';

export type UploadType = 'image' | 'csv';
export type ContentType = {
  body: string;
  contentType: string;
  contentLength: number;
};

let storage = null;
let s3Client: S3Client;

export const FileManager = (): IFileManager => {
  const getStorage = (type: UploadType) => {
    if (getEnv().NODE_ENV !== 'development') {
      const { localStorage } = FileStorage.createLocalStorage();
      storage = localStorage;
    } else {
      const { s3Storage, s3client } = FileStorage.createS3Storage(type);
      storage = s3Storage;
      s3Client = s3client;
    }
    return storage;
  };

  const getFile = async (filePath: string) => {
    const results: any[] = [];

    if (getEnv().NODE_ENV !== 'development') {
      const abs = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
      // const stat = await fs.promises.stat(abs);
      fs.createReadStream(abs)
        .pipe(csv()) // Pipe the file stream to the CSV parser
        .on('data', (data: any) => results.push(data)) // Each 'data' event is a parsed row (object)
        .on('end', () => {
          console.log(results);
        });
      console.log(results);
      return {
        body: results.toString(),
        contentType: 'text/csv',
        contentLength: results.length,
      } as ContentType;
    } else {
      const command = new GetObjectCommand({
        Bucket: getEnv().AWS_S3_BUCKET_NAME,
        Key: filePath,
      });

      const response = await s3Client.send(command);

      return {
        body: (await response.Body?.transformToString()) ?? '',
        contentType: response.ContentType,
        contentLength: response.ContentLength,
      } as ContentType;
    }
  };

  const readFile = async (body: StreamingBlobPayloadOutputTypes): Promise<string[]> => {
    const encoding: BufferEncoding = 'utf8';
    let content = '';
    if (body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      content = Buffer.concat(chunks).toString(encoding);
    }

    if (typeof Blob !== 'undefined' && body instanceof Blob) {
      content = await body.text();
    }

    if (typeof body === 'string') {
      content = body;
    }

    if (body instanceof Uint8Array) {
      content = Buffer.from(body).toString(encoding);
    }
    const contents = content.split(/\r?\n/);
    return contents;
    // throw new Error('Unsupported S3 Body type');
  };

  const getUrl = async (filePath: string) => {
    const command = new GetObjectCommand({
      Bucket: getEnv().AWS_S3_BUCKET_NAME,
      Key: filePath,
    });

    const signedUrl = await getSignedUrl(s3Client, command);

    return signedUrl;
  };
  return { getStorage, getFile, readFile, getUrl };
};
