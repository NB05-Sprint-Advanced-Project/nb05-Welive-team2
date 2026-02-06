import { Response } from 'express';
import { Role } from './domain/user/entity/base-user';
import { LiveNotificationPayload, WorkType } from './domain/state/entity/state';

// 관리자, 유저 - aptId , userId, connections
const clients = new Map<string, Map<string, Set<Response>>>();
// 슈퍼관리자 - userId, connections
const superClients = new Map<string, Set<Response>>();
// 아파트-역할별 보조인덱스 - aptId, role, connections
const roleIndex = new Map<string, Map<Role, Set<Response>>>();

export const ClientManager = {
  set: (params: { userId: string; role: Role; apartmentId?: string; connection: Response }) => {
    const aptId = params.apartmentId;

    if (!aptId) {
      // 슈퍼관리자
      if (!superClients.has(params.userId)) {
        superClients.set(params.userId, new Set());
      }
      superClients.get(params.userId)?.add(params.connection);
    } else {
      // 관리자 & 주민
      if (!clients.has(aptId)) {
        clients.set(aptId, new Map());
      }
      const aptClients = clients.get(aptId)!;
      if (!aptClients.has(params.userId)) {
        aptClients.set(params.userId, new Set());
      }
      aptClients.get(params.userId)!.add(params.connection);

      // 아파트-역할별 보조인덱스 저장
      if (!roleIndex.has(aptId)) {
        roleIndex.set(aptId, new Map());
      }
      const roles = roleIndex.get(aptId)!;
      if (!roles.has(params.role)) {
        roles.set(params.role, new Set());
      }
      roles.get(params.role)!.add(params.connection);
    }
  },

  broadcastToSuperAdmins: (payloads: LiveNotificationPayload[]) => {
    superClients.forEach((connections) => {
      connections.forEach((conn) => {
        conn.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(payloads)}\n\n`);
      });
    });
  },

  broadcastToAdmins: (apartmentId: string, payloads: LiveNotificationPayload[]) => {
    const connections = roleIndex.get(apartmentId)?.get(Role.ADMIN);
    if (!connections) return;

    connections.forEach((conn) => {
      conn.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(payloads)}\n\n`);
    });
  },

  broadcastToResidents: (apartmentId: string, payloads: LiveNotificationPayload[]) => {
    const connections = roleIndex.get(apartmentId)?.get(Role.USER);
    if (!connections) return;

    connections.forEach((conn) => {
      conn.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(payloads)}\n\n`);
    });
  },

  broadcastToIndividual: (
    apartmentId: string,
    userId: string,
    payloads: LiveNotificationPayload[],
  ) => {
    const connections = clients.get(apartmentId)?.get(userId);
    if (!connections) return;

    connections.forEach((conn) => {
      conn.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(payloads)}\n\n`);
    });
  },
};
