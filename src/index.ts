import { createInjector } from './injector';

const { httpServer, noticeScheduler, complaintScheduler, notificationScheduler, csvScheduler } =
  createInjector();
httpServer.listen();
noticeScheduler.start();
complaintScheduler.start();
notificationScheduler.start();
csvScheduler.start();
