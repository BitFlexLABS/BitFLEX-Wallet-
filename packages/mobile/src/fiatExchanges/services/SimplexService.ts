import { CASH_IN_SUCCESS_DEEPLINK } from 'src/config'

const uuidv4 = () =>
  (String(1e7) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
  )

export interface SimplexPaymentRequestConfig {
  userId: string
  app: {
    version: string
    installDate: number
  }
  phone: string
  email: string
  verified: {
    phone: boolean
    email: boolean
  }
  quoteId: string
  address: string
  asset: string
}

export class SimplexService {
  static getInstance() {
    if (!this.instance) {
      this.instance = new SimplexService()
    }
    return this.instance
  }

  private static instance: SimplexService

  private apiKey: string
  private baseUrl: string
  private appUrl: string

  constructor() {
    this.apiKey = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXJ0bmVyIjoidmFsb3JhcHAiLCJpcCI6WyIxLjIuMy40Il0sInNhbmRib3giOnRydWV9.7cGx60gkefkR2bxDCtm-WBB7HGgs9R3lyVt34gZ2Sqc`
    this.baseUrl = 'https://sandbox.test-simplexcc.com'
    this.appUrl = 'https://valoraapp.com'
  }

  getQuote(
    userId: string,
    cryptoAsset: string,
    fiatAsset: string,
    requested: string,
    requestedAmount: number
  ) {
    return this.post('/wallet/merchant/v2/quote', {
      end_user_id: userId,
      digital_currency: cryptoAsset,
      fiat_currency: fiatAsset,
      requested_currency: requested,
      requested_amount: requestedAmount,
      wallet_id: 'valorapp',
      client_ip: '0.0.0.0',
      payment_methods: ['credit_card'],
    })
  }

  async paymentRequest(config: SimplexPaymentRequestConfig) {
    const paymentId = uuidv4()
    const result = await this.post('/wallet/merchant/v2/payments/partner/data', {
      account_details: {
        app_provider_id: 'valorapp',
        app_version_id: config.app.version,
        app_end_user_id: config.userId,
        app_install_date: new Date(config.app.installDate).toISOString(),
        email: config.email,
        phone: config.phone,
        verified_details: [
          config.verified.email && 'email',
          config.verified.phone && 'phone',
        ].filter((_) => !!_),
        signup_login: {
          // Fake data from example
          ip: '212.179.111.110',
          location: '36.848460,-174.763332',
          uaid:
            'IBAnKPg1bdxRiT6EDkIgo24Ri8akYQpsITRKIueg+3XjxWqZlmXin7YJtQzuY4K73PWTZOvmuhIHu + ee8m4Cs4WLEqd2SvQS9jW59pMDcYu + Tpl16U / Ss3SrcFKnriEn4VUVKG9QnpAJGYB3JUAPx1y7PbAugNoC8LX0Daqg66E = ',
          accept_language: 'de,en-US;q=0.7,en;q=0.3',
          http_accept_language: 'de,en-US;q=0.7,en;q=0.3',
          user_agent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
          cookie_session_id: '7r7rz_VfGC_viXTp5XPh5Bm--rWM6RyU',
          timestamp: '2018-01-15T09:27:34.431Z',
        },
      },
      transaction_details: {
        payment_details: {
          quote_id: config.quoteId,
          payment_id: paymentId,
          order_id: uuidv4(),
          destination_wallet: {
            currency: config.asset,
            address: config.address,
            tag: '',
          },
          original_http_ref_url: this.appUrl,
        },
      },
    })
    console.log({ result: await result.json(), quoteId: config.quoteId, paymentId })
    return paymentId
  }

  generateForm(paymentId: string) {
    return `
      <html>
        <body>
          <form id="payment_form" action="${this.baseUrl}/payments/new" method="post">
            <input type="hidden" name="version" value="1">
            <input type="hidden" name="partner" value="valorapp">
            <input type="hidden" name="payment_flow_type" value="wallet">
            <input type="hidden" name="return_url_success" value="${encodeURIComponent(
              CASH_IN_SUCCESS_DEEPLINK
            )}">
            <input type="hidden" name="return_url_fail" value="${encodeURIComponent(
              CASH_IN_SUCCESS_DEEPLINK
            )}">
            <input type="hidden" name="payment_id" value="${paymentId}">
          </form>
          <script type="text/javascript">
            document.forms["payment_form"].submit();
          </script>
        </body>
      </html>
    `
  }

  private post(path: string, body: { [key: string]: any }) {
    return fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    })
  }
}