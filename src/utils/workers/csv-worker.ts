import { PrismaClient } from '@prisma/client';
import { createApartmentCommandRepo } from '../../domain/apartment/repo/apartment-command';
import { CSVStateProps } from '../../domain/state/entity/state';
import { createStateCommandRepo } from '../../domain/state/repo/state-command';
import { createUserCommandRepo } from '../../domain/user/repo/user-command';
import {
  UserCommandService,
  createUserCommandService,
} from '../../domain/user/service/user-command';
import { createBcryptHashManager } from '../../managers/bcrypt-hash-manager';
import { createUnitOfWork } from '../../managers/unit-of-work';
import { IUnitOfWork } from '../../shared/interface/i-unit-of-work';
import { createRedisExternal } from '../externals/redis';
import { createWorkerExternal } from '../externals/worker';
import { createFileStream } from '../fileStream';

export const createCSVWorker = (userCommandService: UserCommandService) => {
  const run = async (csvStatesProps: CSVStateProps[]) => {
    await userCommandService.createResidentBulk(csvStatesProps);
  };

  return {
    run,
  };
};

export default async (props: { csvStatesProps: CSVStateProps[] }) => {
  const prismaClient = new PrismaClient();
  const userCommandRepo = createUserCommandRepo(prismaClient);
  const stateCommandRepo = createStateCommandRepo(prismaClient);
  const apartmentCommandRepo = createApartmentCommandRepo(prismaClient);
  const hashManager = createBcryptHashManager();
  const fileStream = createFileStream();
  const workerExternal = createWorkerExternal();

  const redisExternal = createRedisExternal();
  const unitOfWork: IUnitOfWork = createUnitOfWork(prismaClient);
  const userCommandService = createUserCommandService(
    unitOfWork,
    hashManager,
    userCommandRepo,
    apartmentCommandRepo,
    stateCommandRepo,
    redisExternal,
    fileStream,
    workerExternal,
  );

  const csvParseWorker = createCSVWorker(userCommandService);
  await csvParseWorker.run(props.csvStatesProps);
};
