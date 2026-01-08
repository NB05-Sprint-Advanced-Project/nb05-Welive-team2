import { IRepos } from './i-repos';

export type TransactionOptions =
  | {
      useTransaction: false;
    }
  | {
      useTransaction: true;
      isolationLevel: 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
    };

export type UnitOfWorkOptions = {
  transactionOptions: TransactionOptions;
  useOptimisticLock: boolean;
};

export interface IUnitOfWork {
  repos: IRepos;
  doWork<T>(work: (repos: IRepos) => Promise<T>, options?: UnitOfWorkOptions): Promise<T>;
}
