import { Request } from 'express';
import { getEnv } from '../../config';
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { UploadType } from './file-manager';

export const FileStorage = {
  createLocalStorage: () => {
    const localStorage = multer.diskStorage({
      destination: (req: Request, file, cb) => {
        cb(null, 'uploads/csv/');
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${path.basename(file.originalname, ext)}.${Date.now()}${ext}`;
        cb(null, filename);
      },
    });
    return { localStorage };
  },

  createS3Storage: (type: UploadType) => {
    let filePath = '';
    const s3client = new S3Client({
      region: getEnv().AWS_REGION,
      credentials: {
        accessKeyId: getEnv().AWS_ACCESS_KEY_ID,
        secretAccessKey: getEnv().AWS_SECRET_ACCESS_KEY,
      },
    });

    const s3Storage = multerS3({
      s3: s3client,
      bucket: getEnv().AWS_S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'private',
      key: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        const filename = `${path.basename(file.originalname, ext)}.${Date.now()}${ext}`;
        const dir = type === 'image' ? 'profile-image' : 'CSV-from';
        filePath = `${dir}/${filename}`;
        callback(null, filePath);
      },
    });

    return { s3Storage, s3client, filePath };
  },
};
