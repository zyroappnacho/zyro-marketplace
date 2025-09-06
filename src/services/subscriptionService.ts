import { SubscriptionEntity, PaymentTransactionEntity } from '../database/entities';
import { SubscriptionPlan, SubscriptionStatus } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { PaymentRepository } from '../database/repositories/PaymentRepository';
import { CompanyRepository } from '../database/repositories/CompanyRepository';
import { paymentService, PaymentRequest } from './paymentService';
import { notificationService } from './notificationService';

export interface SubscriptionData {
  companyId: string;
  plan: SubscriptionPlan;
  paymentMethod: string;
  startDate?: Date;
}

export interface SubscriptionUpdate {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  endDate?: Date;
}

export interface SubscriptionMetrics {
  totalActiveSubscriptions: number;
  totalMonthlyRevenue: number;
  subscriptionsByPlan: Record<SubscriptionPlan, number>;
  churnRate: number;
  averageSubscriptionValue: number;
}

class SubscriptionService {
  private db: DatabaseService;
  private paymentRepository: PaymentRepository;
  private companyRepository: CompanyRepository;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.paymentRepository = new PaymentRepository(this.db);
    this.companyRepository = new CompanyRepository(this.db);
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data: SubscriptionData): Promise<SubscriptionEntity> {
    try {
      const startDate = data.startDate || new Date();
      const price = this.getPlanPrice(data.plan);
      const endDate = this.calculateEndDate(startDate, data.plan);

      // Create subscription record
      const subscriptionId = this.generateId();
      const now = new Date().toISOString();

      const query = `
        INSERT INTO subscriptions (
          id, company_id, plan, price, start_date, end_date, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.execute(query, [
        subscriptionId,
        data.companyId,
        data.plan,
        price,
        startDate.toISOString(),
        endDate.toISOString(),
        'active',
        now,
        now,
      ]);

      // Update company payment method
      await this.companyRepository.updateCompany(data.companyId, {
        payment_method: data.paymentMethod,
      });

      // Process initial payment
      await this.processSubscriptionPayment(subscriptionId);

      const subscription = await this.getSubscriptionById(subscriptionId);
      if (!subscription) {
        throw new Error('Failed to create subscription');
      }

      // Send confirmation notification
      await this.sendSubscriptionConfirmation(subscription);

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<SubscriptionEntity | null> {
    const query = `SELECT * FROM subscriptions WHERE id = ?`;
    const result = await this.db.get<SubscriptionEntity>(query, [id]);
    return result || null;
  }

  /**
   * Get active subscription for a company
   */
  async getCompanyActiveSubscription(companyId: string): Promise<SubscriptionEntity | null> {
    const query = `
      SELECT * FROM subscriptions 
      WHERE company_id = ? 
      AND status = 'active' 
      AND end_date > datetime('now')
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await this.db.get<SubscriptionEntity>(query, [companyId]);
    return result || null;
  }

  /**
   * Get all subscriptions for a company
   */
  async getCompanySubscriptions(companyId: string): Promise<SubscriptionEntity[]> {
    const query = `
      SELECT * FROM subscriptions 
      WHERE company_id = ? 
      ORDER BY created_at DESC
    `;
    
    return await this.db.all<SubscriptionEntity>(query, [companyId]);
  }

  /**
   * Update subscription
   */
  async updateSubscription(id: string, updates: SubscriptionUpdate): Promise<SubscriptionEntity | null> {
    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.plan !== undefined) {
      updateFields.push('plan = ?');
      params.push(updates.plan);
      
      // Update price if plan changes
      updateFields.push('price = ?');
      params.push(this.getPlanPrice(updates.plan));
    }

    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      params.push(updates.status);
    }

    if (updates.endDate !== undefined) {
      updateFields.push('end_date = ?');
      params.push(updates.endDate.toISOString());
    }

    if (updateFields.length === 0) {
      return await this.getSubscriptionById(id);
    }

    updateFields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const query = `
      UPDATE subscriptions 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await this.db.execute(query, params);
    return await this.getSubscriptionById(id);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(id: string, reason?: string): Promise<SubscriptionEntity | null> {
    const subscription = await this.getSubscriptionById(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const updatedSubscription = await this.updateSubscription(id, {
      status: 'cancelled',
    });

    if (updatedSubscription) {
      // Send cancellation notification
      await this.sendSubscriptionCancellation(updatedSubscription, reason);
    }

    return updatedSubscription;
  }

  /**
   * Renew subscription
   */
  async renewSubscription(id: string): Promise<SubscriptionEntity | null> {
    const subscription = await this.getSubscriptionById(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const newEndDate = this.calculateEndDate(new Date(subscription.end_date), subscription.plan);
    
    const updatedSubscription = await this.updateSubscription(id, {
      status: 'active',
      endDate: newEndDate,
    });

    if (updatedSubscription) {
      // Process renewal payment
      await this.processSubscriptionPayment(id);
      
      // Send renewal confirmation
      await this.sendSubscriptionRenewal(updatedSubscription);
    }

    return updatedSubscription;
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(subscriptionId: string): Promise<PaymentTransactionEntity> {
    const subscription = await this.getSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const company = await this.companyRepository.getCompanyById(subscription.company_id);
    if (!company) {
      throw new Error('Company not found');
    }

    // Create payment transaction record
    const transaction = await this.paymentRepository.createTransaction({
      company_id: subscription.company_id,
      subscription_id: subscriptionId,
      amount: subscription.price,
      currency: 'EUR',
      payment_method: company.payment_method || 'card',
      status: 'pending',
    });

    try {
      // Process payment
      const paymentRequest: PaymentRequest = {
        companyId: subscription.company_id,
        subscriptionId: subscriptionId,
        amount: subscription.price,
        currency: 'EUR',
        paymentMethod: company.payment_method as any || 'card',
        metadata: {
          plan: subscription.plan,
          period: this.getPlanDuration(subscription.plan),
        },
      };

      const paymentResult = await paymentService.processPayment(paymentRequest);

      if (paymentResult.success) {
        // Mark transaction as completed
        await this.paymentRepository.markTransactionCompleted(
          transaction.id,
          paymentResult.transactionId
        );

        // Generate and send invoice
        await this.generateSubscriptionInvoice(transaction, subscription);

        return transaction;
      } else {
        // Mark transaction as failed
        await this.paymentRepository.markTransactionFailed(transaction.id);
        
        // Send payment failure notification
        await this.sendPaymentFailureNotification(subscription, paymentResult.error);
        
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      // Mark transaction as failed
      await this.paymentRepository.markTransactionFailed(transaction.id);
      throw error;
    }
  }

  /**
   * Process recurring payments for all active subscriptions
   */
  async processRecurringPayments(): Promise<void> {
    try {
      const expiringSubscriptions = await this.paymentRepository.getExpiringSubscriptions(7);
      
      for (const subscription of expiringSubscriptions) {
        try {
          await this.renewSubscription(subscription.id);
        } catch (error) {
          console.error(`Failed to renew subscription ${subscription.id}:`, error);
          
          // Send renewal failure notification
          await this.sendRenewalFailureNotification(subscription, error.message);
        }
      }
    } catch (error) {
      console.error('Error processing recurring payments:', error);
    }
  }

  /**
   * Get subscription metrics
   */
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    // Total active subscriptions
    const activeQuery = `
      SELECT COUNT(*) as count 
      FROM subscriptions 
      WHERE status = 'active' AND end_date > datetime('now')
    `;
    const activeResult = await this.db.get<{ count: number }>(activeQuery);
    const totalActiveSubscriptions = activeResult?.count || 0;

    // Total monthly revenue
    const revenueQuery = `
      SELECT COALESCE(SUM(price), 0) as total 
      FROM subscriptions 
      WHERE status = 'active' AND end_date > datetime('now')
    `;
    const revenueResult = await this.db.get<{ total: number }>(revenueQuery);
    const totalMonthlyRevenue = revenueResult?.total || 0;

    // Subscriptions by plan
    const planQuery = `
      SELECT plan, COUNT(*) as count 
      FROM subscriptions 
      WHERE status = 'active' AND end_date > datetime('now')
      GROUP BY plan
    `;
    const planResults = await this.db.all<{ plan: SubscriptionPlan; count: number }>(planQuery);
    
    const subscriptionsByPlan: Record<SubscriptionPlan, number> = {
      '3months': 0,
      '6months': 0,
      '12months': 0,
    };
    
    planResults.forEach(result => {
      subscriptionsByPlan[result.plan] = result.count;
    });

    // Churn rate (cancelled subscriptions in last 30 days / total subscriptions)
    const churnQuery = `
      SELECT 
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'cancelled' AND updated_at > date('now', '-30 days')) as cancelled,
        (SELECT COUNT(*) FROM subscriptions WHERE created_at > date('now', '-30 days')) as total
    `;
    const churnResult = await this.db.get<{ cancelled: number; total: number }>(churnQuery);
    const churnRate = churnResult?.total ? (churnResult.cancelled / churnResult.total) * 100 : 0;

    // Average subscription value
    const avgQuery = `
      SELECT COALESCE(AVG(price), 0) as avg 
      FROM subscriptions 
      WHERE status = 'active' AND end_date > datetime('now')
    `;
    const avgResult = await this.db.get<{ avg: number }>(avgQuery);
    const averageSubscriptionValue = avgResult?.avg || 0;

    return {
      totalActiveSubscriptions,
      totalMonthlyRevenue,
      subscriptionsByPlan,
      churnRate,
      averageSubscriptionValue,
    };
  }

  /**
   * Get expiring subscriptions
   */
  async getExpiringSubscriptions(days = 7): Promise<SubscriptionEntity[]> {
    return await this.paymentRepository.getExpiringSubscriptions(days);
  }

  // Private helper methods

  private generateId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPlanPrice(plan: SubscriptionPlan): number {
    switch (plan) {
      case '3months': return 499;
      case '6months': return 399;
      case '12months': return 299;
      default: return 0;
    }
  }

  private getPlanDuration(plan: SubscriptionPlan): string {
    switch (plan) {
      case '3months': return '3 meses';
      case '6months': return '6 meses';
      case '12months': return '12 meses';
      default: return '';
    }
  }

  private calculateEndDate(startDate: Date, plan: SubscriptionPlan): Date {
    const endDate = new Date(startDate);
    
    switch (plan) {
      case '3months':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '6months':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '12months':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    
    return endDate;
  }

  private async generateSubscriptionInvoice(
    transaction: PaymentTransactionEntity,
    subscription: SubscriptionEntity
  ): Promise<void> {
    try {
      const company = await this.companyRepository.getCompanyById(subscription.company_id);
      if (!company) return;

      const invoiceData = {
        transactionId: transaction.id,
        companyId: subscription.company_id,
        amount: transaction.amount,
        currency: transaction.currency,
        description: `Suscripción Zyro Marketplace - Plan ${this.getPlanDuration(subscription.plan)}`,
        issueDate: new Date(),
        dueDate: new Date(), // Immediate payment
        items: [
          {
            description: `Plan ${this.getPlanDuration(subscription.plan)} - Zyro Marketplace`,
            quantity: 1,
            unitPrice: transaction.amount,
            total: transaction.amount,
          },
        ],
      };

      await paymentService.generateInvoice(invoiceData);
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  }

  private async sendSubscriptionConfirmation(subscription: SubscriptionEntity): Promise<void> {
    try {
      const company = await this.companyRepository.getCompanyById(subscription.company_id);
      if (!company) return;

      await notificationService.sendNotification({
        userId: company.user_id,
        type: 'subscription_confirmed',
        title: '¡Suscripción Activada!',
        body: `Tu suscripción al plan ${this.getPlanDuration(subscription.plan)} ha sido activada correctamente.`,
        data: {
          subscriptionId: subscription.id,
          plan: subscription.plan,
        },
      });
    } catch (error) {
      console.error('Error sending subscription confirmation:', error);
    }
  }

  private async sendSubscriptionCancellation(
    subscription: SubscriptionEntity,
    reason?: string
  ): Promise<void> {
    try {
      const company = await this.companyRepository.getCompanyById(subscription.company_id);
      if (!company) return;

      await notificationService.sendNotification({
        userId: company.user_id,
        type: 'subscription_cancelled',
        title: 'Suscripción Cancelada',
        body: `Tu suscripción ha sido cancelada. ${reason ? `Motivo: ${reason}` : ''}`,
        data: {
          subscriptionId: subscription.id,
          reason,
        },
      });
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
  }

  private async sendSubscriptionRenewal(subscription: SubscriptionEntity): Promise<void> {
    try {
      const company = await this.companyRepository.getCompanyById(subscription.company_id);
      if (!company) return;

      await notificationService.sendNotification({
        userId: company.user_id,
        type: 'subscription_renewed',
        title: 'Suscripción Renovada',
        body: `Tu suscripción ha sido renovada hasta ${new Date(subscription.end_date).toLocaleDateString('es-ES')}.`,
        data: {
          subscriptionId: subscription.id,
          endDate: subscription.end_date,
        },
      });
    } catch (error) {
      console.error('Error sending renewal notification:', error);
    }
  }

  private async sendPaymentFailureNotification(
    subscription: SubscriptionEntity,
    error?: string
  ): Promise<void> {
    try {
      const company = await this.companyRepository.getCompanyById(subscription.company_id);
      if (!company) return;

      await notificationService.sendNotification({
        userId: company.user_id,
        type: 'payment_failed',
        title: 'Error en el Pago',
        body: `No se pudo procesar el pago de tu suscripción. Por favor, actualiza tu método de pago.`,
        data: {
          subscriptionId: subscription.id,
          error,
        },
      });
    } catch (error) {
      console.error('Error sending payment failure notification:', error);
    }
  }

  private async sendRenewalFailureNotification(
    subscription: SubscriptionEntity,
    error: string
  ): Promise<void> {
    try {
      const company = await this.companyRepository.getCompanyById(subscription.company_id);
      if (!company) return;

      await notificationService.sendNotification({
        userId: company.user_id,
        type: 'renewal_failed',
        title: 'Error en la Renovación',
        body: `No se pudo renovar tu suscripción automáticamente. Por favor, contacta con soporte.`,
        data: {
          subscriptionId: subscription.id,
          error,
        },
      });
    } catch (error) {
      console.error('Error sending renewal failure notification:', error);
    }
  }
}

export const subscriptionService = new SubscriptionService();