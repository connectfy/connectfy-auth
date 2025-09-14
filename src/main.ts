import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from './exception-filters/http.filter';

async function bootstrap() {
  const PORT = Number(process.env.PORT);
  const NODE_ENV = String(process.env.NODE_ENV);

  const tcpApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'auth-service',
        port: PORT,
      },
    },
  );

  // Filter
  tcpApp.useGlobalFilters(new HttpExceptionFilter());

  await tcpApp.listen();

  console.log(`✅ NODE_ENV => `, NODE_ENV);
  console.log(`✅ Server is working on ${PORT} port`);
}
bootstrap();
