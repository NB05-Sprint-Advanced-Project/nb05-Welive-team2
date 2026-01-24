import { randomUUID } from 'crypto';
import { IRedisExternal } from '../shared/interface/i-redis';
import { RedisLockWork, IRedisLocker, RedisLockRequest } from '../shared/interface/i-redis-locker';

const DEFAULT_OPTIONS = {
  cacheTtlSeconds: 3,
  lockTtlSeconds: 3,
  retryCount: 10,
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
    //console.log("캐시 확인 전")
    if (cache) {
      result = JSON.parse(cache);
      // console.log("이미 캐시 있어서 리턴")
    } else {
      for (let i = 0; i < retryCount; i++) {
        // console.log("캐시가 없는 상태")
        const lockToken = randomUUID();
        const isLocked = await redisExternal.setIfNotExist(lockKey, lockToken, lockTtlSeconds);

        if (isLocked) {
          try {
            // console.log("한명 락 잡음")
            result = await resolveWork(work);
            await redisExternal.set(key, JSON.stringify(result), cacheTtlSeconds);
          } finally {
            // console.log("한명 락 잡아서 캐시 발급 끝")
            await redisExternal.delifmatch(lockKey, lockToken);
          }
        } else {
          // console.log("대기 중인 사람들")
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
