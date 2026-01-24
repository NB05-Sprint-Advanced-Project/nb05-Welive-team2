import Redis from 'ioredis';
import { getEnv } from './config';
import { IRedisExternal } from './shared/interface/i-redis';

export const createRedisExternal = (): IRedisExternal => {
  const redisClient = new Redis({
    host: getEnv().REDIS_HOST,
    port: getEnv().REDIS_PORT,
  });

  const get = (key: string) => {
    return redisClient.get(key);
  };
  const getMany = (keys: string[]) => {
    return redisClient.mget(keys);
  };

  const set = async (key: string, data: string, ttl?: number) => {
    if (ttl === undefined) {
      await redisClient.set(key, data);
    } else {
      await redisClient.set(key, data, 'EX', ttl);
    }
  };
  const setIfNotExist = async (key: string, data: string, ttl?: number) => {
    if (ttl === undefined) {
      const res = await redisClient.setnx(key, data);
      if (res === 1) {
        return true;
      } else {
        return false;
      }
    } else {
      const res = await redisClient.set(key, data, 'EX', ttl, 'NX');
      if (res === 'OK') {
        return true;
      } else {
        return false;
      }
    }
  };

  const del = async (key: string) => {
    return await redisClient.del(key);
  };
  const delifmatch = async (key: string, value: string) => {
    const result = await redisClient.eval(
      `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
      `,
      1, // 키 개수
      key, // 키 목록
      value, // 값
    );
    return result === 1;
  };

  const getMembersFromSet = async (key: string) => {
    return await redisClient.smembers(key);
  };
  const addToSet = async (key: string, data: string) => {
    return await redisClient.sadd(key, data);
  };
  const removeMemberFromSet = async (key: string) => {
    return await redisClient.srem(key);
  };
  const popFromSet = async (key: string, count: number) => {
    return await redisClient.spop(key, count);
  };

  const increase = async (key: string) => {
    return await redisClient.incr(key);
  };
  const decrease = async (key: string) => {
    return await redisClient.decr(key);
  };

  const quit = async () => {
    await redisClient.quit();
  };
  return {
    get,
    getMany,
    set,
    setIfNotExist,
    del,
    delifmatch,
    getMembersFromSet,
    addToSet,
    removeMemberFromSet,
    popFromSet,
    increase,
    decrease,
    quit,
  };
};
