import multerS3 from 'multer-s3';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import { getEnv } from '../config';
import path from 'path';
import { BusinessException } from '../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../shared/exception/business-exception/exception-info';
import { create } from 'domain';

export const createMulterMiddleware = () => {
  const createLocalStorage = () => {
    const localStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/csv/');
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${path.basename(file.originalname, ext)}.${Date.now()}${ext}`;
        cb(null, filename);
      },
    });
    return localStorage;
  };
  const LocalUploader = multer({
    storage: createLocalStorage(),
    fileFilter: (req, file, cb) => {
      cb(null, true);
    },
  });

  const handlerCsvFile = () => {
    return LocalUploader.array('csv');
  };

  return {
    // handlerImage,
    handlerCsvFile,
  };
};

export type MulterMiddleware = ReturnType<typeof createMulterMiddleware>;

// const createS3Storage = () => {
//   const s3Client = new S3Client({
//     region: getEnv().AWS_REGION,
//     credentials: {
//       accessKeyId: getEnv().AWS_ACCESS_KEY_ID,
//       secretAccessKey: getEnv().AWS_SECRET_ACCESS_KEY,
//     },
//   });

//   const S3Storage = multerS3({
//     s3: s3Client,
//     bucket: getEnv().AWS_S3_BUCKET_NAME,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     acl: 'public-read',
//     key: (req, file, callback) => {
//       const ext = path.extname(file.originalname);
//       const filename = `${path.basename(file.originalname, ext)}.${Date.now()}${ext}`;

//       callback(null, `images/${filename}`);
//     },
//   });
//   return S3Storage;
// }

// const S3Uploader = multer({
//   storage: createS3Storage(),
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith('image/')) {
//       cb(
//         BusinessException({
//           type: BusinessExceptionType.NOT_IMAGE_FILE,
//         }),
//       );
//     }
//     cb(null, true);
//   },
// });

// const handlerImage = (key: string) => {
//   S3Uploader.single(key)
// }
