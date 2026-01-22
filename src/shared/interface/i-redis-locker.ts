export type RedisLockOptions = {
  key: string;
  lockKey: string;
  cacheTtlSeconds?: number;
  lockTtlSeconds?: number;
  retryCount?: number;
  retryDelayMs?: number;
};

export type RedisLockWork<T> = Promise<T> | (() => Promise<T>);

export type RedisLockRequest<T> = RedisLockOptions & {
  work: RedisLockWork<T>;
};

export interface IRedisLocker {
  doWork<T>(request: RedisLockRequest<T>): Promise<T | null>;
}
