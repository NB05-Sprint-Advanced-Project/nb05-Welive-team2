import { Prisma, PrismaClient } from '@prisma/client';
import { IUnitOfWork, UnitOfWorkOptions } from '../application/ports/i-unit-of-work';
import { BasePrismaClient, IRepos } from '../application/ports/i-repos';
import { TechnicalExceptionType } from '../shared/exceptioins/technical-exception/exception-info';
import { isTechnicalException } from '../shared/exceptioins/technical-exception/technical-exception';
import { getEnv } from '../shared/utils/env-util';

export const createUnitOfWork = (
  _prismaClient: PrismaClient,
  _repoFactory: (prismaClient: BasePrismaClient) => IRepos,
): IUnitOfWork => {
  const _repos: IRepos = _repoFactory(_prismaClient);

  const doWork = async <T>(
    work: (repos: IRepos) => Promise<T>,
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
          return await work(_repos);
        }

        return await _prismaClient.$transaction(
          async (txPrismaClient: Prisma.TransactionClient) => {
            const txRepos = _repoFactory(txPrismaClient);
            return await work(txRepos);
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
          const jitter = Math.random() * 100;
          const delay = Math.pow(2, i) * baseDelay + jitter;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        lastErr = err;
        break;
      }
    }

    throw lastErr;
  };

  return {
    repos: _repos,
    doWork,
  };
};
