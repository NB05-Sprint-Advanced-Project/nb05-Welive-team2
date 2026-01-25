import { createInjector } from './injector';

const { httpServer, wsServer, noticeScheduler, complaintScheduler } = createInjector();
httpServer.listen();
wsServer.run();
noticeScheduler.start();
complaintScheduler.start();
