import { Response } from 'express';
import { Role } from './domain/user/entity/base-user';
import { randomUUID } from 'node:crypto';
import { LiveNotificationPayload, WorkType } from './domain/state/entity/state';

const clients = new Map<Role, Map<string, Response>>();

export const ClientManager = {
  get: () => {
    const superAdmins = clients.get(Role.SUPER_ADMIN);
    const admins = clients.get(Role.ADMIN);
    const residents = clients.get(Role.USER);

    return { clients, superAdmins, admins, residents };
  },

  set: (params: { userId: string; role: Role; connection: Response }) => {
    if (!clients.has(params.role)) {
      clients.set(params.role, new Map());
    }
    clients.get(params.role)!.set(params.userId + randomUUID(), params.connection);
  },

  send: (connections: Map<string, Response> | undefined, payloads: LiveNotificationPayload[]) => {
    if (!connections) return;
    connections.forEach((connection) => {
      connection.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(payloads)}\n\n`);
    });
  },
};
