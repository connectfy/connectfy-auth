import i18n from './i18n';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from './exception-filters/http.filter';
import { AllExceptionsFilter } from './exception-filters/all.filter';

async function bootstrap() {
  // Start Kafka Microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'connectfy-auth',
          brokers: ['kafka-0:9092', 'kafka-1:9092'],
        },
        consumer: {
          groupId: 'consumer-connectfy-auth',
          allowAutoTopicCreation: false,
        },
        run: {
          autoCommit: false,
        },
      },
    },
  );

  kafkaApp.useGlobalFilters(new AllExceptionsFilter());

  await kafkaApp.listen();
  console.log('✅ Kafka Microservice is running');

  // Starting TCP Microservice
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

  console.log(
    `i18n is working... should be used like this ==> `,
    i18n.t('email_messages.signup_verify.greeting', { lng: 'en' }),
  );
  console.log(`✅ NODE_ENV => `, NODE_ENV);
  console.log(`✅ Server is working on ${PORT} port`);
}
bootstrap();
