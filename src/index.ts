import { createInjector } from './injector';

const { httpServer, noticeScheduler, complaintScheduler } = createInjector();
httpServer.listen();
noticeScheduler.start();
complaintScheduler.start();
