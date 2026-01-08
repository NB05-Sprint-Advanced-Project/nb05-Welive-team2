import { TechnicalException } from '../exceptioins/technical-exception/technical-exception';
import { configSchema, ConfigType } from './i-config';
import dotenv from 'dotenv';

const resolveEnvPath = (nodeEnv: string | undefined = process.env.NODE_ENV) => {
  return nodeEnv === 'development' ? '.env.dev' : nodeEnv === 'test' ? '.env.test' : '.env.prod';
};

const loadEnv = (path: string) => dotenv.config({ path });

export const loadConfig = (nodeEnv?: string): ConfigType => {
  const envPath = resolveEnvPath(nodeEnv);
  const { error } = loadEnv(envPath);

  if (error) {
    throw error;
  }

  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(result.error.issues[0].path + ': ' + result.error.issues[0].message);
  }
  return result.data;
};

export type IloadConfig = ReturnType<typeof loadConfig>;
