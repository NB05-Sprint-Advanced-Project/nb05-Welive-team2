import multerS3 from 'multer-s3';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import { getEnv } from '../config';
import path from 'path';
import { BusinessException } from '../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../shared/exception/business-exception/exception-info';

type UploadType = 'image' | 'csv';

export const createMulterMiddleware = () => {
  const s3Client = new S3Client({
    region: getEnv().AWS_REGION,
    credentials: {
      accessKeyId: getEnv().AWS_ACCESS_KEY_ID,
      secretAccessKey: getEnv().AWS_SECRET_ACCESS_KEY,
    },
  });

  const createUploader = (type: UploadType) =>
    multer({
      storage: multerS3({
        s3: s3Client,
        bucket: getEnv().AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: type === 'image' ? 'public-read' : 'private',
        key: (req, file, callback) => {
          const ext = path.extname(file.originalname);
          const filename = `${path.basename(file.originalname, ext)}.${Date.now()}${ext}`;
          const dir = type === 'image' ? 'images' : 'csv';

          callback(null, `${dir}/${filename}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 최대 10메가까지
      },
      fileFilter: (req, file, cb) => {
        if (type === 'image') {
          if (!file.mimetype.startsWith('image/')) {
            return cb(
              BusinessException({
                type: BusinessExceptionType.NOT_IMAGE_FILE,
              }),
            );
          }
        }

        if (type === 'csv') {
          if (file.mimetype !== 'text/csv') {
            return cb(
              BusinessException({
                type: BusinessExceptionType.NOT_CSV_FILE,
              }),
            );
          }
        }

        cb(null, true);
      },
    });

  return {
    image: () => createUploader('image').single('image'),
    csv: () => createUploader('csv').single('csv'),
  };
};

export type MulterMiddleware = ReturnType<typeof createMulterMiddleware>;
