import { Readable } from 'stream';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';

export async function streamToString(
  body: StreamingBlobPayloadOutputTypes,
  encoding: BufferEncoding = 'utf8',
): Promise<string> {
  if (body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString(encoding);
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return await body.text();
  }

  if (typeof body === 'string') {
    return body;
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body).toString(encoding);
  }

  throw new Error('Unsupported S3 Body type');
}
