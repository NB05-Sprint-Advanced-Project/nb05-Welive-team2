import { randomUUID } from 'crypto';
import { IRedisExternal } from '../shared/interface/i-redis';
import { IRedisLocker, RedisLockRequest, RedisLockWork } from '../shared/interface/i-redis-locker';

const DEFAULT_OPTIONS = {
  cacheTtlSeconds: 3,
  lockTtlSeconds: 3,
  retryCount: 10,
  retryDelayMs: 100,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveWork = async <T>(work: RedisLockWork<T>): Promise<T> => {
  if (typeof work === 'function') {
    return await work();
  }
  return await work;
};

export const createRedisLocker = (redisExternal: IRedisExternal): IRedisLocker => {
  const doWork = async <T>(request: RedisLockRequest<T>): Promise<T | null> => {
    const {
      key,
      lockKey,
      work,
      cacheTtlSeconds = DEFAULT_OPTIONS.cacheTtlSeconds,
      lockTtlSeconds = DEFAULT_OPTIONS.lockTtlSeconds,
      retryCount = DEFAULT_OPTIONS.retryCount,
      retryDelayMs = DEFAULT_OPTIONS.retryDelayMs,
    } = request;

    const cache = await redisExternal.get(key);
    if (cache) {
      return JSON.parse(cache) as T;
    }

    for (let i = 0; i < retryCount; i++) {
      const lockToken = randomUUID();
      const isLocked = await redisExternal.setIfNotExist(lockKey, lockToken, lockTtlSeconds);

      if (isLocked) {
        try {
          const result = await resolveWork(work);
          await redisExternal.set(key, JSON.stringify(result), cacheTtlSeconds);
          return result;
        } finally {
          await redisExternal.delifmatch(lockKey, lockToken);
        }
      }

      await sleep(retryDelayMs);
      const result = await redisExternal.get(key);
      if (result) {
        return JSON.parse(result) as T;
      }
    }

    return null;
  };

  return {
    doWork,
  };
};
