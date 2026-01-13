import express from 'express';

export const createBaseController = (basePath: string) => {
  const path: string = basePath;
  const router = express.Router();
  return { path, router };
};
