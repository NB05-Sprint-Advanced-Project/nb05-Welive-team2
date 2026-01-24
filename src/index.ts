import { createInjector } from './injector';

const { httpServer, noticeScheduler, wsServer } = createInjector();
httpServer.listen();
wsServer.run();
noticeScheduler.start();
