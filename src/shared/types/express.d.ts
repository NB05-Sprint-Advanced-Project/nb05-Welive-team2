import 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: string;
        name?: string;
        apartmentId?: string;
      };
      userId?: string;
    }

    namespace Multer {
      interface File {
        key: string;
      }
    }
  }
}
