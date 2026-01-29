import express from 'express';
import { Role } from '../../domain/user/entity/base-user';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: string;
        name?: string;
      }; // 현재 방식
      userId?: string; // 기존 방식
    }
  }
}
