import { createInjector } from './injector';

const { httpServer, noticeScheduler, complaintScheduler, notificationScheduler } = createInjector();
httpServer.listen();
noticeScheduler.start();
complaintScheduler.start();
notificationScheduler.start();
