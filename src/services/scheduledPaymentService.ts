import { subscriptionService } from './subscriptionService';
import { paymentService } from './paymentService';
import { notificationService } from './notificationService';

/**
 * Service for handling scheduled payment processing
 * This would typically be run as a background job or cron task
 */
class ScheduledPaymentService {
  private isProcessing = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the scheduled payment processor
   * In a production environment, this would be handled by a proper job scheduler
   */
  startScheduledProcessing(intervalMinutes = 60): void {
    if (this.intervalId) {
      this.stopScheduledProcessing();
    }

    console.log(`Starting scheduled payment processing every ${intervalMinutes} minutes`);
    
    // Run immediately
    this.processScheduledPayments();
    
    // Then run on interval
    this.intervalId = setInterval(() => {
      this.processScheduledPayments();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the scheduled payment processor
   */
  stopScheduledProcessing(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Stopped scheduled payment processing');
    }
  }

  /**
   * Process all scheduled payments
   */
  async processScheduledPayments(): Promise<void> {
    if (this.isProcessing) {
      console.log('Payment processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    console.log('Starting scheduled payment processing...');

    try {
      // Process recurring payments for subscriptions
      await this.processRecurringPayments();
      
      // Process payment reminders
      await this.processPaymentReminders();
      
      // Clean up old failed transactions
      await this.cleanupOldTransactions();
      
      console.log('Scheduled payment processing completed successfully');
    } catch (error) {
      console.error('Error in scheduled payment processing:', error);
      
      // Send alert to admin about processing failure
      await this.sendProcessingErrorAlert(error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process recurring payments for expiring subscriptions
   */
  private async processRecurringPayments(): Promise<void> {
    try {
      console.log('Processing recurring payments...');
      
      // Get subscriptions expiring in the next 7 days
      const expiringSubscriptions = await subscriptionService.getExpiringSubscriptions(7);
      
      console.log(`Found ${expiringSubscriptions.length} subscriptions expiring soon`);
      
      for (const subscription of expiringSubscriptions) {
        try {
          // Check if we should process this subscription
          const daysUntilExpiry = this.getDaysUntilExpiry(new Date(subscription.end_date));
          
          if (daysUntilExpiry <= 3) {
            // Process renewal 3 days before expiry
            console.log(`Processing renewal for subscription ${subscription.id}`);
            await subscriptionService.renewSubscription(subscription.id);
          } else if (daysUntilExpiry <= 7) {
            // Send reminder 7 days before expiry
            console.log(`Sending renewal reminder for subscription ${subscription.id}`);
            await this.sendRenewalReminder(subscription);
          }
        } catch (error) {
          console.error(`Error processing subscription ${subscription.id}:`, error);
          // Continue with other subscriptions
        }
      }
    } catch (error) {
      console.error('Error processing recurring payments:', error);
      throw error;
    }
  }

  /**
   * Process payment reminders for failed or pending payments
   */
  private async processPaymentReminders(): Promise<void> {
    try {
      console.log('Processing payment reminders...');
      
      // This would typically query for failed payments and send reminders
      // For now, we'll just log the action
      console.log('Payment reminders processed');
    } catch (error) {
      console.error('Error processing payment reminders:', error);
      throw error;
    }
  }

  /**
   * Clean up old transaction records
   */
  private async cleanupOldTransactions(): Promise<void> {
    try {
      console.log('Cleaning up old transactions...');
      
      // This would typically remove old failed/refunded transactions
      // For now, we'll just log the action
      console.log('Transaction cleanup completed');
    } catch (error) {
      console.error('Error cleaning up transactions:', error);
      throw error;
    }
  }

  /**
   * Send renewal reminder to company
   */
  private async sendRenewalReminder(subscription: any): Promise<void> {
    try {
      const daysUntilExpiry = this.getDaysUntilExpiry(new Date(subscription.end_date));
      
      // This would send a notification to the company
      console.log(`Sending renewal reminder for subscription ${subscription.id} (expires in ${daysUntilExpiry} days)`);
      
      // In a real implementation, you would:
      // 1. Get company details
      // 2. Send push notification
      // 3. Send email reminder
      // 4. Update reminder status
    } catch (error) {
      console.error('Error sending renewal reminder:', error);
    }
  }

  /**
   * Send processing error alert to admin
   */
  private async sendProcessingErrorAlert(error: any): Promise<void> {
    try {
      console.log('Sending processing error alert to admin');
      
      // In a real implementation, you would:
      // 1. Send notification to admin users
      // 2. Log error to monitoring system
      // 3. Send email alert
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Payment processing error alert:', errorMessage);
    } catch (alertError) {
      console.error('Error sending processing error alert:', alertError);
    }
  }

  /**
   * Calculate days until expiry
   */
  private getDaysUntilExpiry(expiryDate: Date): number {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get processing status
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Manual trigger for payment processing (for testing or admin use)
   */
  async triggerManualProcessing(): Promise<void> {
    console.log('Manual payment processing triggered');
    await this.processScheduledPayments();
  }
}

export const scheduledPaymentService = new ScheduledPaymentService();

// Auto-start in development (in production, this would be handled by a proper scheduler)
if (__DEV__) {
  // Start with a longer interval in development to avoid spam
  scheduledPaymentService.startScheduledProcessing(120); // Every 2 hours
}