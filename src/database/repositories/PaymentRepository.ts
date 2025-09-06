import { BaseRepository } from './BaseRepository';
import { PaymentTransactionEntity, SubscriptionEntity } from '../entities';
import { DatabaseService } from '../DatabaseService';

export interface CreatePaymentTransactionData {
  company_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  processed_at?: string;
}

export interface UpdatePaymentTransactionData {
  transaction_id?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  processed_at?: string;
}

export interface PaymentTransactionFilters {
  company_id?: string;
  subscription_id?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  date_from?: string;
  date_to?: string;
}

export interface PaymentStats {
  total_revenue: number;
  monthly_revenue: number;
  active_subscriptions: number;
  failed_payments: number;
  pending_payments: number;
}

export class PaymentRepository extends BaseRepository {
  constructor(db: DatabaseService) {
    super(db);
  }

  /**
   * Create a new payment transaction
   */
  async createTransaction(data: CreatePaymentTransactionData): Promise<PaymentTransactionEntity> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const query = `
      INSERT INTO payment_transactions (
        id, company_id, subscription_id, amount, currency, 
        payment_method, transaction_id, status, processed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      data.company_id,
      data.subscription_id,
      data.amount,
      data.currency,
      data.payment_method,
      data.transaction_id || null,
      data.status,
      data.processed_at || null,
      now,
    ];

    await this.db.execute(query, params);

    const transaction = await this.getTransactionById(id);
    if (!transaction) {
      throw new Error('Failed to create payment transaction');
    }

    return transaction;
  }

  /**
   * Get payment transaction by ID
   */
  async getTransactionById(id: string): Promise<PaymentTransactionEntity | null> {
    const query = `
      SELECT * FROM payment_transactions 
      WHERE id = ?
    `;

    const result = await this.db.get<PaymentTransactionEntity>(query, [id]);
    return result || null;
  }

  /**
   * Get payment transaction by external transaction ID
   */
  async getTransactionByExternalId(transactionId: string): Promise<PaymentTransactionEntity | null> {
    const query = `
      SELECT * FROM payment_transactions 
      WHERE transaction_id = ?
    `;

    const result = await this.db.get<PaymentTransactionEntity>(query, [transactionId]);
    return result || null;
  }

  /**
   * Update payment transaction
   */
  async updateTransaction(id: string, data: UpdatePaymentTransactionData): Promise<PaymentTransactionEntity | null> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.transaction_id !== undefined) {
      updates.push('transaction_id = ?');
      params.push(data.transaction_id);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.processed_at !== undefined) {
      updates.push('processed_at = ?');
      params.push(data.processed_at);
    }

    if (updates.length === 0) {
      return await this.getTransactionById(id);
    }

    params.push(id);

    const query = `
      UPDATE payment_transactions 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    await this.db.execute(query, params);
    return await this.getTransactionById(id);
  }

  /**
   * Get payment transactions with filters
   */
  async getTransactions(filters: PaymentTransactionFilters = {}, limit = 50, offset = 0): Promise<PaymentTransactionEntity[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.company_id) {
      conditions.push('company_id = ?');
      params.push(filters.company_id);
    }

    if (filters.subscription_id) {
      conditions.push('subscription_id = ?');
      params.push(filters.subscription_id);
    }

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.payment_method) {
      conditions.push('payment_method = ?');
      params.push(filters.payment_method);
    }

    if (filters.date_from) {
      conditions.push('created_at >= ?');
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      conditions.push('created_at <= ?');
      params.push(filters.date_to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const query = `
      SELECT * FROM payment_transactions 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    return await this.db.all<PaymentTransactionEntity>(query, params);
  }

  /**
   * Get payment transactions for a company
   */
  async getCompanyTransactions(companyId: string, limit = 50, offset = 0): Promise<PaymentTransactionEntity[]> {
    return await this.getTransactions({ company_id: companyId }, limit, offset);
  }

  /**
   * Get payment transactions for a subscription
   */
  async getSubscriptionTransactions(subscriptionId: string): Promise<PaymentTransactionEntity[]> {
    return await this.getTransactions({ subscription_id: subscriptionId });
  }

  /**
   * Get pending payment transactions
   */
  async getPendingTransactions(): Promise<PaymentTransactionEntity[]> {
    return await this.getTransactions({ status: 'pending' });
  }

  /**
   * Get failed payment transactions
   */
  async getFailedTransactions(limit = 50): Promise<PaymentTransactionEntity[]> {
    return await this.getTransactions({ status: 'failed' }, limit);
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<PaymentStats> {
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM format

    // Total revenue (completed payments)
    const totalRevenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payment_transactions 
      WHERE status = 'completed'
    `;
    const totalRevenueResult = await this.db.get<{ total: number }>(totalRevenueQuery);
    const totalRevenue = totalRevenueResult?.total || 0;

    // Monthly revenue
    const monthlyRevenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payment_transactions 
      WHERE status = 'completed' 
      AND strftime('%Y-%m', created_at) = ?
    `;
    const monthlyRevenueResult = await this.db.get<{ total: number }>(monthlyRevenueQuery, [currentMonth]);
    const monthlyRevenue = monthlyRevenueResult?.total || 0;

    // Active subscriptions
    const activeSubscriptionsQuery = `
      SELECT COUNT(*) as count
      FROM subscriptions 
      WHERE status = 'active' 
      AND end_date > datetime('now')
    `;
    const activeSubscriptionsResult = await this.db.get<{ count: number }>(activeSubscriptionsQuery);
    const activeSubscriptions = activeSubscriptionsResult?.count || 0;

    // Failed payments
    const failedPaymentsQuery = `
      SELECT COUNT(*) as count
      FROM payment_transactions 
      WHERE status = 'failed'
    `;
    const failedPaymentsResult = await this.db.get<{ count: number }>(failedPaymentsQuery);
    const failedPayments = failedPaymentsResult?.count || 0;

    // Pending payments
    const pendingPaymentsQuery = `
      SELECT COUNT(*) as count
      FROM payment_transactions 
      WHERE status = 'pending'
    `;
    const pendingPaymentsResult = await this.db.get<{ count: number }>(pendingPaymentsQuery);
    const pendingPayments = pendingPaymentsResult?.count || 0;

    return {
      total_revenue: totalRevenue,
      monthly_revenue: monthlyRevenue,
      active_subscriptions: activeSubscriptions,
      failed_payments: failedPayments,
      pending_payments: pendingPayments,
    };
  }

  /**
   * Get monthly revenue data for charts
   */
  async getMonthlyRevenueData(months = 12): Promise<Array<{ month: string; revenue: number }>> {
    const query = `
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COALESCE(SUM(amount), 0) as revenue
      FROM payment_transactions 
      WHERE status = 'completed'
      AND created_at >= date('now', '-${months} months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `;

    return await this.db.all<{ month: string; revenue: number }>(query);
  }

  /**
   * Get revenue by payment method
   */
  async getRevenueByPaymentMethod(): Promise<Array<{ payment_method: string; revenue: number; count: number }>> {
    const query = `
      SELECT 
        payment_method,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(*) as count
      FROM payment_transactions 
      WHERE status = 'completed'
      GROUP BY payment_method
      ORDER BY revenue DESC
    `;

    return await this.db.all<{ payment_method: string; revenue: number; count: number }>(query);
  }

  /**
   * Get subscriptions expiring soon
   */
  async getExpiringSubscriptions(days = 7): Promise<SubscriptionEntity[]> {
    const query = `
      SELECT * FROM subscriptions 
      WHERE status = 'active'
      AND end_date <= date('now', '+${days} days')
      AND end_date > datetime('now')
      ORDER BY end_date ASC
    `;

    return await this.db.all<SubscriptionEntity>(query);
  }

  /**
   * Mark transaction as completed
   */
  async markTransactionCompleted(id: string, transactionId?: string): Promise<PaymentTransactionEntity | null> {
    const now = new Date().toISOString();
    return await this.updateTransaction(id, {
      status: 'completed',
      processed_at: now,
      transaction_id: transactionId,
    });
  }

  /**
   * Mark transaction as failed
   */
  async markTransactionFailed(id: string): Promise<PaymentTransactionEntity | null> {
    const now = new Date().toISOString();
    return await this.updateTransaction(id, {
      status: 'failed',
      processed_at: now,
    });
  }

  /**
   * Process refund for a transaction
   */
  async processRefund(transactionId: string, refundAmount?: number): Promise<PaymentTransactionEntity | null> {
    const transaction = await this.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'completed') {
      throw new Error('Can only refund completed transactions');
    }

    const amount = refundAmount || transaction.amount;
    if (amount > transaction.amount) {
      throw new Error('Refund amount cannot exceed original transaction amount');
    }

    // Create refund transaction
    const refundTransaction = await this.createTransaction({
      company_id: transaction.company_id,
      subscription_id: transaction.subscription_id,
      amount: -amount, // Negative amount for refund
      currency: transaction.currency,
      payment_method: transaction.payment_method,
      status: 'completed',
      processed_at: new Date().toISOString(),
    });

    // Update original transaction status if full refund
    if (amount === transaction.amount) {
      await this.updateTransaction(transactionId, {
        status: 'refunded',
      });
    }

    return refundTransaction;
  }

  /**
   * Delete old transaction records (for cleanup)
   */
  async deleteOldTransactions(olderThanDays = 365): Promise<number> {
    const query = `
      DELETE FROM payment_transactions 
      WHERE created_at < date('now', '-${olderThanDays} days')
      AND status IN ('failed', 'refunded')
    `;

    const result = await this.db.execute(query);
    return result.changes || 0;
  }
}