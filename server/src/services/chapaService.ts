export interface InitializePaymentParams {
  amount: number;
  currency?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  tx_ref: string;
  callbackUrl?: string;
  returnUrl: string;
  customizationTitle?: string;
  customizationDescription?: string;
}

export interface ChapaInitializeResponse {
  message: string;
  status: string;
  data?: {
    checkout_url: string;
  };
}

export interface ChapaVerifyResponse {
  message: string;
  status: string;
  data?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    currency: string;
    amount: number | string;
    charge?: number;
    mode?: string;
    method?: string;
    type?: string;
    status: string;
    reference?: string;
    tx_ref: string;
    [key: string]: any;
  };
}

const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';

export class ChapaService {
  private static getSecretKey(): string {
    return (process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-WmBRCg3oewnRHlu1gE51q2dPk4t7NgPk').trim();
  }

  public static async initialize(params: InitializePaymentParams): Promise<ChapaInitializeResponse> {
    const secretKey = this.getSecretKey();

    // Split name or use friendly fallback
    const fullName = (params.firstName || '').trim();
    const nameParts = fullName ? fullName.split(' ') : ['Guest', 'Customer'];
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';
    const email = (params.email || '').trim() || 'customer@gmail.com';

    if (!secretKey) {
      console.warn('CHAPA_SECRET_KEY not set. Using test simulation sandbox response.');
      return {
        message: 'Simulation Hosted link',
        status: 'success',
        data: {
          checkout_url: `${params.returnUrl}${params.returnUrl.includes('?') ? '&' : '?'}simulation=true`,
        },
      };
    }

    const payload = {
      amount: params.amount.toString(),
      currency: params.currency || 'ETB',
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: params.tx_ref,
      callback_url: params.callbackUrl,
      return_url: params.returnUrl,
      'customization[title]': params.customizationTitle || 'Zion Cafeteria',
      'customization[description]': params.customizationDescription || 'Cafeteria Order Payment',
    };

    const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as ChapaInitializeResponse;
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || `Chapa initialization failed with status ${response.status}`);
    }

    return data;
  }

  public static async verify(tx_ref: string): Promise<ChapaVerifyResponse> {
    const secretKey = this.getSecretKey();

    if (!secretKey) {
      console.warn('CHAPA_SECRET_KEY not set. Simulating successful test verification.');
      return {
        message: 'Payment verified (simulation)',
        status: 'success',
        data: {
          status: 'success',
          tx_ref,
          currency: 'ETB',
          amount: 0,
          reference: `sim-${Date.now()}`,
          mode: 'test',
        },
      };
    }

    const response = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${encodeURIComponent(tx_ref)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = (await response.json()) as ChapaVerifyResponse;
    if (!response.ok) {
      throw new Error(data.message || `Chapa verification failed with status ${response.status}`);
    }

    return data;
  }
}
