import { PaymentTransactionEntity, SubscriptionEntity } from '../database/entities';
import { SubscriptionPlan } from '../types';

// Payment method types
export type PaymentMethod = 'card' | 'sepa' | 'bizum' | 'apple_pay' | 'google_pay' | 'bank_transfer';

export interface PaymentConfig {
  adminBankAccount: {
    iban: string;
    swift: string;
    accountHolder: string;
  };
  companyDetails: {
    name: string;
    cif: string;
    address: string;
    taxInfo: string;
  };
  supportedMethods: PaymentMethod[];
}

export interface PaymentRequest {
  companyId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  requiresAction?: boolean;
  actionUrl?: string;
}

export interface RecurringPaymentSetup {
  companyId: string;
  paymentMethod: PaymentMethod;
  plan: SubscriptionPlan;
  startDate: Date;
}

export interface InvoiceData {
  transactionId: string;
  companyId: string;
  amount: number;
  currency: string;
  description: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

class PaymentService {
  private config: PaymentConfig;

  constructor() {
    this.config = {
      adminBankAccount: {
        iban: 'ES91 2100 0418 4502 0005 1332', // Example IBAN
        swift: 'CAIXESBBXXX',
        accountHolder: 'ZYRO MARKETPLACE SL',
      },
      companyDetails: {
        name: 'Zyro Marketplace SL',
        cif: 'B12345678',
        address: 'Calle Ejemplo 123, 28001 Madrid, España',
        taxInfo: 'IVA incluido (21%)',
      },
      supportedMethods: ['card', 'sepa', 'bizum', 'apple_pay', 'google_pay', 'bank_transfer'],
    };
  }

  /**
   * Process a one-time payment
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate payment request
      if (!this.validatePaymentRequest(request)) {
        return {
          success: false,
          error: 'Invalid payment request',
        };
      }

      // Process payment based on method
      switch (request.paymentMethod) {
        case 'card':
          return await this.processCardPayment(request);
        case 'sepa':
          return await this.processSEPAPayment(request);
        case 'bizum':
          return await this.processBizumPayment(request);
        case 'apple_pay':
          return await this.processApplePayPayment(request);
        case 'google_pay':
          return await this.processGooglePayPayment(request);
        case 'bank_transfer':
          return await this.processBankTransferPayment(request);
        default:
          return {
            success: false,
            error: 'Unsupported payment method',
          };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: 'Payment processing failed',
      };
    }
  }

  /**
   * Set up recurring payments for a subscription
   */
  async setupRecurringPayment(setup: RecurringPaymentSetup): Promise<PaymentResult> {
    try {
      // Create recurring payment setup based on method
      switch (setup.paymentMethod) {
        case 'card':
          return await this.setupCardRecurring(setup);
        case 'sepa':
          return await this.setupSEPARecurring(setup);
        default:
          // For other methods, we'll handle them as manual recurring
          return await this.setupManualRecurring(setup);
      }
    } catch (error) {
      console.error('Recurring payment setup error:', error);
      return {
        success: false,
        error: 'Failed to set up recurring payment',
      };
    }
  }

  /**
   * Process recurring payment for active subscriptions
   */
  async processRecurringPayments(): Promise<void> {
    try {
      // This would be called by a scheduled job
      const activeSubscriptions = await this.getActiveSubscriptions();
      
      for (const subscription of activeSubscriptions) {
        if (this.shouldProcessRecurringPayment(subscription)) {
          await this.processSubscriptionPayment(subscription);
        }
      }
    } catch (error) {
      console.error('Recurring payment processing error:', error);
    }
  }

  /**
   * Generate invoice for a payment
   */
  async generateInvoice(invoiceData: InvoiceData): Promise<string> {
    try {
      // Generate invoice PDF or HTML
      const invoiceHtml = this.generateInvoiceHTML(invoiceData);
      
      // In a real implementation, you would:
      // 1. Generate PDF from HTML
      // 2. Store the invoice file
      // 3. Send via email
      // 4. Return the invoice URL or ID
      
      return `invoice_${invoiceData.transactionId}`;
    } catch (error) {
      console.error('Invoice generation error:', error);
      throw error;
    }
  }

  /**
   * Get payment configuration
   */
  getPaymentConfig(): PaymentConfig {
    return this.config;
  }

  /**
   * Update payment configuration (admin only)
   */
  updatePaymentConfig(newConfig: Partial<PaymentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private methods for payment processing

  private validatePaymentRequest(request: PaymentRequest): boolean {
    return !!(
      request.companyId &&
      request.subscriptionId &&
      request.amount > 0 &&
      request.currency &&
      request.paymentMethod &&
      this.config.supportedMethods.includes(request.paymentMethod)
    );
  }

  private async processCardPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate card payment processing
    // In a real implementation, integrate with Stripe, Square, or similar
    
    const transactionId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        transactionId,
      };
    } else {
      return {
        success: false,
        error: 'Card payment declined',
      };
    }
  }

  private async processSEPAPayment(request: PaymentRequest): Promise<PaymentResult> {
    // SEPA payments typically require bank account details and take 1-3 business days
    const transactionId = `sepa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      requiresAction: true,
      actionUrl: `sepa://authorize/${transactionId}`,
    };
  }

  private async processBizumPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Bizum is a Spanish mobile payment system
    const transactionId = `bizum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      requiresAction: true,
      actionUrl: `bizum://pay/${transactionId}`,
    };
  }

  private async processApplePayPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Apple Pay integration
    const transactionId = `apple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
    };
  }

  private async processGooglePayPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Google Pay integration
    const transactionId = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
    };
  }

  private async processBankTransferPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Bank transfer requires manual verification
    const transactionId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      requiresAction: true,
      actionUrl: `bank://transfer/${transactionId}`,
    };
  }

  private async setupCardRecurring(setup: RecurringPaymentSetup): Promise<PaymentResult> {
    // Set up recurring card payments
    const setupId = `card_recurring_${Date.now()}`;
    
    return {
      success: true,
      transactionId: setupId,
    };
  }

  private async setupSEPARecurring(setup: RecurringPaymentSetup): Promise<PaymentResult> {
    // Set up SEPA Direct Debit mandate
    const mandateId = `sepa_mandate_${Date.now()}`;
    
    return {
      success: true,
      transactionId: mandateId,
      requiresAction: true,
      actionUrl: `sepa://mandate/${mandateId}`,
    };
  }

  private async setupManualRecurring(setup: RecurringPaymentSetup): Promise<PaymentResult> {
    // For payment methods that don't support automatic recurring
    return {
      success: true,
      transactionId: `manual_${Date.now()}`,
    };
  }

  private async getActiveSubscriptions(): Promise<SubscriptionEntity[]> {
    // This would query the database for active subscriptions
    // For now, return empty array
    return [];
  }

  private shouldProcessRecurringPayment(subscription: SubscriptionEntity): boolean {
    // Check if it's time to process the next payment
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    
    // Process if subscription is ending in the next 7 days
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 7 && subscription.status === 'active';
  }

  private async processSubscriptionPayment(subscription: SubscriptionEntity): Promise<void> {
    // Process recurring payment for subscription
    // This would involve creating a new payment request and processing it
    console.log(`Processing recurring payment for subscription ${subscription.id}`);
  }

  private generateInvoiceHTML(invoiceData: InvoiceData): string {
    const { companyDetails } = this.config;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura - ${invoiceData.transactionId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .company-info { margin-bottom: 30px; }
          .invoice-details { margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURA</h1>
          <h2>Zyro Marketplace</h2>
        </div>
        
        <div class="company-info">
          <strong>${companyDetails.name}</strong><br>
          CIF: ${companyDetails.cif}<br>
          ${companyDetails.address}
        </div>
        
        <div class="invoice-details">
          <p><strong>Número de Factura:</strong> ${invoiceData.transactionId}</p>
          <p><strong>Fecha de Emisión:</strong> ${invoiceData.issueDate.toLocaleDateString('es-ES')}</p>
          <p><strong>Fecha de Vencimiento:</strong> ${invoiceData.dueDate.toLocaleDateString('es-ES')}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>€${item.unitPrice.toFixed(2)}</td>
                <td>€${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total: €${invoiceData.amount.toFixed(2)}</p>
          <p style="font-size: 14px;">${companyDetails.taxInfo}</p>
        </div>
        
        <div class="footer">
          <p>Gracias por confiar en Zyro Marketplace</p>
          <p>Para cualquier consulta, contacta con nosotros en soporte@zyromarketplace.com</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const paymentService = new PaymentService();