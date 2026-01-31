import 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: string;
        name?: string;
      };
      userId?: string;
    }

    namespace Multer {
      interface File {
        bucket: string;
        key: string;
        location: string;
        etag: string;
      }
    }
  }
}
