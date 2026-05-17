import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { TrpcRouter } from './trpc/trpc.router';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { NexusLogger } from './common/logging/nexus.logger';
import * as trpcExpress from '@trpc/server/adapters/express';
import helmet from 'helmet';
import * as compression from 'compression';

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
  app.enableCors({ origin: [
    'https://kubryx.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ] });

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
