import { createInjector } from './injector';

const { httpServer, noticeScheduler } = createInjector();
httpServer.listen();
noticeScheduler.start();
