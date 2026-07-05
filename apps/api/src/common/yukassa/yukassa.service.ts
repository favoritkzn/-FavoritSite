import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

interface YooKassaPaymentResponse {
  id: string;
  status: string;
  confirmation?: { confirmation_url?: string };
}

@Injectable()
export class YooKassaService {
  private readonly logger = new Logger(YooKassaService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('YUKASSA_SHOP_ID') &&
        this.config.get<string>('YUKASSA_SECRET_KEY'),
    );
  }

  async createPayment(params: {
    amount: number;
    description: string;
    returnUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{ externalId: string; confirmationUrl: string } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const shopId = this.config.get<string>('YUKASSA_SHOP_ID')!;
    const secretKey = this.config.get<string>('YUKASSA_SECRET_KEY')!;
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': randomUUID(),
      },
      body: JSON.stringify({
        amount: { value: params.amount.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: params.returnUrl },
        description: params.description.slice(0, 128),
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`YooKassa error ${response.status}: ${body}`);
      throw new Error('Не удалось создать платёж в ЮKassa');
    }

    const data = (await response.json()) as YooKassaPaymentResponse;
    const confirmationUrl = data.confirmation?.confirmation_url;
    if (!confirmationUrl) {
      throw new Error('ЮKassa не вернула ссылку на оплату');
    }

    return { externalId: data.id, confirmationUrl };
  }
}
