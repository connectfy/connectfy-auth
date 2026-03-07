import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { MICROSERVICE_NAMES } from 'connectfy-shared';

export type KafkaCallArgs<TPayload> = {
  topic: string; // pattern / topic name
  payload: TPayload;
  timeoutMs?: number; // only for send (RPC)
};

@Injectable()
export class KafkaConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConnectionService.name);
  private connected = false;

  constructor(
    @Inject(MICROSERVICE_NAMES.KAFKA)
    private readonly client: ClientKafka,
    private readonly cls: ClsService,
  ) {}

  async onModuleInit() {
    if (this.connected) return;

    await this.client.connect();
    this.connected = true;

    this.logger.log('✅ Kafka client connected');
  }

  async onModuleDestroy() {
    // Nest ClientKafka-da close() mövcuddur (versiondan asılı ola bilər)
    // yoxdursa problem deyil, sadəcə connect qalacaq.
    try {
      await this.client.close?.();
      this.logger.log('🛑 Kafka client closed');
    } catch (e) {
      this.logger.warn('Kafka client close skipped/failed');
    }
  }

  /**
   * RPC (request-reply) üçün cavab topic-ini subscribe etmək lazımdır.
   * send() istifadə edəcəyin topic-ləri app start-da qeydiyyata al.
   */
  registerRequestPattern(topic: string) {
    this.client.subscribeToResponseOf(topic);
  }

  registerRequestPatterns(topic: string[]) {
    topic.forEach((e) => this.client.subscribeToResponseOf(e));
  }

  /**
   * RPC: cavab gözləyərək mesaj göndərir (MessagePattern tərəfdə).
   */
  async send<TPayload, TResponse = any>({
    topic,
    payload,
    timeoutMs = 15000,
  }: KafkaCallArgs<TPayload>): Promise<TResponse> {
    const obs$ = this.client
      .send<TResponse, TPayload>(topic, payload)
      .pipe(timeout(timeoutMs));

    return lastValueFrom(obs$);
  }

  /**
   * RPC safe: error olsa app-i yıxmır, null qaytarır.
   */
  async sendSafe<TPayload, TResponse = any>(
    args: KafkaCallArgs<TPayload>,
  ): Promise<TResponse | null> {
    try {
      return await this.send<TPayload, TResponse>(args);
    } catch (e) {
      this.logger.error(`❌ Kafka send failed: ${args.topic}`, e as any);
      return null;
    }
  }

  /**
   * Event: cavab gözləmədən mesaj göndərir (EventPattern tərəfdə).
   */
  async emit<TPayload>({
    topic,
    payload,
  }: KafkaCallArgs<TPayload>): Promise<void> {
    await lastValueFrom(this.client.emit(topic, payload));
  }

  /**
   * Event safe: error olsa false qaytarır.
   */
  async emitSafe<TPayload>(args: KafkaCallArgs<TPayload>): Promise<boolean> {
    try {
      await this.emit(args);
      return true;
    } catch (e) {
      this.logger.error(`❌ Kafka emit failed: ${args.topic}`, e as any);
      return false;
    }
  }

  /**
   * Bir topic-ə çox event göndərmək (parallel).
   */
  async emitMany<TPayload>(topic: string, payloads: TPayload[]): Promise<void> {
    await Promise.all(payloads.map((payload) => this.emit({ topic, payload })));
  }

  /**
   * Sadə context ötürmə (istəsən istifadə et).
   * Consumer tərəfdə __ctx-dən oxuya bilərsən.
   */
  async sendWithContext<TPayload extends object, TResponse = any>(args: {
    topic: string;
    payload: TPayload;
    ctx?: Record<string, any>;
    timeoutMs?: number;
  }): Promise<TResponse> {
    const { topic, payload, ctx, timeoutMs } = args;
    return this.send<TPayload & { __ctx?: any }, TResponse>({
      topic,
      payload: ctx ? ({ ...payload, __ctx: ctx } as any) : (payload as any),
      timeoutMs,
    });
  }

  async emitWithContext<TPayload extends object>(args: {
    topic: string;
    payload: TPayload;
    ctx?: Record<string, any>;
  }): Promise<void> {
    const user = this.cls?.get('user') || null;
    const { topic, payload } = args;
    const enrichedPayload = {
      ...payload,
      _loggedUser: user,
    };

    return this.emit({ topic, payload: enrichedPayload });
  }
}
