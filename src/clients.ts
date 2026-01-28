import { Response } from 'express';
import { Role } from './domain/user/entity/base-user';
import { randomUUID } from 'node:crypto';

const clients = new Map<Role, Map<string, Response>>();

export const ClientManager = {
  get: () => clients,
  set: (params: { userId: string; role: Role; connection: Response }) => {
    if (!clients.has(params.role)) {
      clients.set(params.role, new Map());
    }
    clients.get(params.role)!.set(params.userId + randomUUID(), params.connection);
  },
};
