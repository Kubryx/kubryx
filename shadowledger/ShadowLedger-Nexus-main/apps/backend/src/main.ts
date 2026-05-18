import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { TrpcRouter } from './trpc/trpc.router';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { NexusLogger } from './common/logging/nexus.logger';
import * as trpcExpress from '@trpc/server/adapters/express';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set — AI orchestration features will be degraded.');
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      logger: new NexusLogger(),
    },
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(helmet());
  app.use(compression());
  const STATIC_ORIGINS = [
    'https://kubryx.vercel.app',
    'https://kubryx-2xclq5gjr-vsrupeshoffl-5415s-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];
  const VERCEL_PREVIEW_RE = /^https:\/\/kubryx-[a-z0-9-]+\.vercel\.app$/i;
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (STATIC_ORIGINS.includes(origin)) return cb(null, true);
      if (VERCEL_PREVIEW_RE.test(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const trpcRouter = app.get(TrpcRouter);
  
  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter.appRouter,
      createContext: () => ({}),
    }),
  );

  await app.listen(process.env.PORT || 3003, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
