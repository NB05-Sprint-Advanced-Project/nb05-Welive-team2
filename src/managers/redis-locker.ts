import { randomUUID } from 'crypto';
import { IRedisExternal } from '../shared/interface/i-redis';
import { RedisLockWork, IRedisLocker, RedisLockRequest } from '../shared/interface/i-redis-locker';

const DEFAULT_OPTIONS = {
  cacheTtlSeconds: 3,
  lockTtlSeconds: 3,
  retryCount: 310,
  retryDelayMs: 1000,
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
    let result: T | null = null;

    if (cache) {
      result = JSON.parse(cache);
    } else {
      for (let i = 0; i < retryCount; i++) {
        const lockToken = randomUUID();
        const isLocked = await redisExternal.setIfNotExist(lockKey, lockToken, lockTtlSeconds);

        if (isLocked) {
          try {
            result = await resolveWork(work);
            await redisExternal.set(key, JSON.stringify(result), cacheTtlSeconds);
          } finally {
            await redisExternal.delifmatch(lockKey, lockToken);
          }
        } else {
          await sleep(retryDelayMs);
          const cachedResult = await redisExternal.get(key);
          if (cachedResult) {
            result = JSON.parse(cachedResult);
            break;
          }
        }
      }
    }

    return result;
  };

  return {
    doWork,
  };
};
