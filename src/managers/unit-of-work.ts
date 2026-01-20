import { Prisma, PrismaClient } from '@prisma/client';
import { IUnitOfWork, UnitOfWorkOptions } from '../shared/interface/i-unit-of-work';
import { TechnicalExceptionType } from '../shared/exception/technical-exception/exception-info';
import { isTechnicalException } from '../shared/exception/technical-exception/technical-exception';
import { getEnv } from '../config';
import { asyncContextStorage } from '../utils/async-context-storage-util';

export const createUnitOfWork = (prismaClient: PrismaClient): IUnitOfWork => {
  const doWork = async <T>(
    work: () => Promise<T>,
    options: UnitOfWorkOptions = {
      transactionOptions: {
        useTransaction: false,
      },
      useOptimisticLock: true,
    },
  ): Promise<T> => {
    const { transactionOptions, useOptimisticLock } = options;

    let lastErr: unknown;

    const maxRetries = useOptimisticLock ? getEnv().MAX_RETRIES : 0;
    for (let i = 0; i <= maxRetries; i++) {
      if (i > 0) {
        console.warn(`재시도 ${i}/${maxRetries}회차`);
      }
      try {
        if (!transactionOptions.useTransaction) {
          return await work();
        }

        return await prismaClient.$transaction(
          async (txPrismaClient: Prisma.TransactionClient) => {
            return await asyncContextStorage.run(txPrismaClient, work);
          },
          {
            isolationLevel: transactionOptions.isolationLevel,
            maxWait: 5000,
            timeout: 5000,
          },
        );
      } catch (err) {
        if (
          isTechnicalException(err) &&
          err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED &&
          i < maxRetries
        ) {
          const baseDelay = getEnv().OPTIMISTIC_LOCK_RETRY_DELAY_MS;
          const jitter = Math.random() * 1000;
          const delay = Math.pow(2, i) * baseDelay + jitter;
          console.log(`재시도 전 대기중... ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        lastErr = err;
        console.log('UnitOfWork 실패:', lastErr);
        break;
      }
    }
    //console.log('전부 실패:', lastErr);
    throw lastErr;
  };

  return {
    doWork,
  };
};
