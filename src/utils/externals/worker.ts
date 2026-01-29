import os from 'os';
import Piscina from 'piscina';
import { IWorkerExternal } from './i-worker';

export const createWorkerExternal = (): IWorkerExternal => {
  const threadPools = new Map<string, Piscina>();

  const register = async (workerScriptPath: string, workerData: unknown): Promise<unknown> => {
    const logicalCpuCount = os.cpus().length;

    let threadPool = threadPools.get(workerScriptPath);
    if (!threadPool) {
      threadPool = new Piscina({
        filename: workerScriptPath,
        maxThreads: logicalCpuCount > 1 ? logicalCpuCount - 1 : 1,
        execArgv: ['-r', 'ts-node/register'],
      });
      threadPools.set(workerScriptPath, threadPool);
    }

    threadPool.on('message', (message) => {
      console.log(message);
    });
    return await threadPool.run(workerData);
  };

  return {
    register,
  };
};
