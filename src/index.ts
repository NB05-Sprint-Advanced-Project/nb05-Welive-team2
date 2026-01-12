import { createInjector } from './injector';

const { httpServer } = createInjector();
httpServer.listen();
