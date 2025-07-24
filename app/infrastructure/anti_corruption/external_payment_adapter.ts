export interface ExternalPaymentProvider {
  processPayment(amount: number, currency: string, paymentMethod: string): Promise<PaymentResult>
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  fees?: number
}

export interface RefundResult {
  success: boolean
  refundId?: string
  error?: string
}

export interface PaymentStatus {
  transactionId: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  currency: string
  processedAt?: Date
}

export class StripePaymentAdapter implements ExternalPaymentProvider {
  constructor(
    private apiKey: string,
    private baseUrl: string
  ) {}

  async processPayment(
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: (amount * 100).toString(),
          currency: currency.toLowerCase(),
          payment_method: paymentMethod,
          confirm: 'true',
        }),
      })

      const result = (await response.json()) as any

      if (result.status === 'succeeded') {
        return {
          success: true,
          transactionId: result.id,
          fees: result.application_fee_amount || 0,
        }
      } else {
        return {
          success: false,
          error: result.last_payment_error?.message || 'Payment failed',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Payment processing error: ${error.message}`,
      }
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
    try {
      const body = new URLSearchParams({
        payment_intent: transactionId,
      })

      if (amount) {
        body.append('amount', (amount * 100).toString())
      }

      const response = await fetch(`${this.baseUrl}/v1/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      })

      const result = (await response.json()) as any

      if (result.status === 'succeeded') {
        return {
          success: true,
          refundId: result.id,
        }
      } else {
        return {
          success: false,
          error: result.failure_reason || 'Refund failed',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Refund processing error: ${error.message}`,
      }
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payment_intents/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      const result = (await response.json()) as any

      return {
        transactionId: result.id,
        status: this.mapStripeStatus(result.status),
        amount: result.amount / 100,
        currency: result.currency.toUpperCase(),
        processedAt: result.created ? new Date(result.created * 1000) : undefined,
      }
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`)
    }
  }

  private mapStripeStatus(stripeStatus: string): PaymentStatus['status'] {
    switch (stripeStatus) {
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending'
      case 'succeeded':
        return 'completed'
      case 'canceled':
        return 'failed'
      default:
        return 'pending'
    }
  }
}
