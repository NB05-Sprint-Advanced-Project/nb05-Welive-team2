import express from 'express';
import http from 'http';
import { Middlewares } from '../shared/interface/i-middlewares';
import { Controllers } from '../shared/interface/i-controllers';
import { getEnv } from '../config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { monitorEventLoopDelay } from 'perf_hooks';

export const createHttpServer = (middlewares: Middlewares, controllers: Controllers) => {
  const app = express();
  const defaultHttpServer = http.createServer(app);

  // ===============================
  // 이벤트 루프 & 리소스 모니터링
  // ===============================
  const h = monitorEventLoopDelay({ resolution: 20 });
  h.enable();

  setInterval(() => {
    const mem = process.memoryUsage();
    console.clear(); // 콘솔 깔끔하게 유지
    console.log('=== 서버 상태 모니터링 ===');
    console.log('CPU 사용량(프로세스):', Math.round(process.cpuUsage().user / 10000) / 100, '%');
    console.log('메모리 사용량 (RSS):', Math.round(mem.rss / 1024 / 1024), 'MB');
    console.log('HeapUsed:', Math.round(mem.heapUsed / 1024 / 1024), 'MB');
    console.log('Event Loop Delay 평균(ms):', (h.mean / 1e6).toFixed(2));
    console.log('Event Loop Delay 최대(ms):', (h.max / 1e6).toFixed(2));
  }, 1000);

  // middlewares
  app.use(
    cors({
      origin: getEnv().CLIENT_DOMAIN,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(cookieParser());

  // controllers
  for (const controllerKey in controllers) {
    const controller = controllers[controllerKey as keyof Controllers];
    app.use(controller.path, controller.router);
  }

  //errors
  app.use(middlewares.globalError);
  app.use(middlewares.notFound);

  const listen = () => {
    defaultHttpServer.listen(getEnv().PORT, () => {
      console.log(`Listening on port ${getEnv().PORT}`);
    });
  };

  return { app, defaultHttpServer, listen };
};
