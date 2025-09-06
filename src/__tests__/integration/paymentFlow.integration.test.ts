import { paymentService } from '../../services/paymentService';
import { subscriptionService } from '../../services/subscriptionService';
import { scheduledPaymentService } from '../../services/scheduledPaymentService';
import { ValidationService } from '../../services/validationService';
import { notificationService } from '../../services/notificationService';
import { databaseService } from '../../database';
import { Company, SubscriptionPlan } from '../../types';

// Mock external dependencies
jest.mock('../../services/paymentService');
jest.mock('../../services/subscriptionService');
jest.mock('../../services/scheduledPaymentService');
jest.mock('../../services/notificationService');
jest.mock('../../database');

const mockPaymentService = paymentService as jest.Mocked<typeof paymentService>;
const mockSubscriptionService = subscriptionService as jest.Mocked<typeof subscriptionService>;
const mockScheduledPaymentService = scheduledPaymentService as jest.Mocked<typeof scheduledPaymentService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;

describe('Payment Flow Integration Tests', () => {
  const mockCompany: Company = {
    id: 'company-123',
    email: 'company@test.com',
    role: 'company',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
    companyName: 'Test Company SL',
    cif: 'A12345678',
    address: 'Calle Mayor 123, Madrid',
    phone: '+34612345678',
    contactPerson: 'John Doe',
    subscription: {
      plan: '6months',
      price: 399,
      startDate: new Date(),
      endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
    paymentMethod: 'card',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup database mocks
    mockDatabaseService.companies = {
      findById: jest.fn(),
      update: jest.fn(),
      findByCif: jest.fn(),
    } as any;

    mockDatabaseService.payments = {
      create: jest.fn(),
      findByCompany: jest.fn(),
      findPendingPayments: jest.fn(),
    } as any;

    // Setup service mocks
    mockPaymentService.processPayment = jest.fn();
    mockPaymentService.validatePaymentMethod = jest.fn();
    mockPaymentService.generateInvoice = jest.fn();
    mockSubscriptionService.createSubscription = jest.fn();
    mockSubscriptionService.renewSubscription = jest.fn();
    mockSubscriptionService.cancelSubscription = jest.fn();
    mockScheduledPaymentService.scheduleRecurringPayment = jest.fn();
    mockNotificationService.sendNotification = jest.fn();
  });

  describe('Complete Subscription Payment Flow', () => {
    it('should handle complete subscription creation and payment flow', async () => {
      // Step 1: Validate company data
      const companySchema = ValidationService.getCompanyProfileSchema();
      const validationResult = await ValidationService.validate(companySchema, mockCompany);
      expect(validationResult.isValid).toBe(true);

      // Step 2: Validate payment method
      mockPaymentService.validatePaymentMethod.mockResolvedValue({
        isValid: true,
        paymentMethodId: 'pm_test123',
      });

      const paymentValidation = await mockPaymentService.validatePaymentMethod({
        type: 'card',
        cardNumber: '4242424242424242',
        expiryMonth: 12,
        expiryYear: 2025,
        cvc: '123',
        holderName: 'John Doe',
      });

      expect(paymentValidation.isValid).toBe(true);
      expect(paymentValidation.paymentMethodId).toBeDefined();

      // Step 3: Calculate subscription price based on plan
      const subscriptionPlans = {
        '3months': { price: 499, duration: 3 },
        '6months': { price: 399, duration: 6 },
        '12months': { price: 299, duration: 12 },
      };

      const selectedPlan = subscriptionPlans[mockCompany.subscription.plan];
      expect(selectedPlan.price).toBe(399);
      expect(selectedPlan.duration).toBe(6);

      // Step 4: Process initial payment
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_test123',
        amount: selectedPlan.price,
        currency: 'EUR',
        status: 'succeeded',
      });

      const paymentResult = await mockPaymentService.processPayment({
        amount: selectedPlan.price,
        currency: 'EUR',
        paymentMethodId: paymentValidation.paymentMethodId,
        customerId: mockCompany.id,
        description: `Suscripción ${mockCompany.subscription.plan} - ${mockCompany.companyName}`,
      });

      expect(paymentResult.success).toBe(true);
      expect(paymentResult.transactionId).toBeDefined();
      expect(paymentResult.amount).toBe(selectedPlan.price);

      // Step 5: Create subscription record
      mockSubscriptionService.createSubscription.mockResolvedValue({
        id: 'sub_test123',
        companyId: mockCompany.id,
        plan: mockCompany.subscription.plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + selectedPlan.duration * 30 * 24 * 60 * 60 * 1000),
        price: selectedPlan.price,
        paymentMethodId: paymentValidation.paymentMethodId,
      });

      const subscription = await mockSubscriptionService.createSubscription({
        companyId: mockCompany.id,
        plan: mockCompany.subscription.plan,
        paymentMethodId: paymentValidation.paymentMethodId,
        initialPaymentId: paymentResult.transactionId,
      });

      expect(subscription.status).toBe('active');
      expect(subscription.plan).toBe(mockCompany.subscription.plan);

      // Step 6: Schedule recurring payments
      mockScheduledPaymentService.scheduleRecurringPayment.mockResolvedValue({
        id: 'schedule_test123',
        subscriptionId: subscription.id,
        nextPaymentDate: new Date(Date.now() + selectedPlan.duration * 30 * 24 * 60 * 60 * 1000),
        amount: selectedPlan.price,
        isActive: true,
      });

      const recurringSchedule = await mockScheduledPaymentService.scheduleRecurringPayment({
        subscriptionId: subscription.id,
        amount: selectedPlan.price,
        intervalMonths: selectedPlan.duration,
        startDate: subscription.endDate,
      });

      expect(recurringSchedule.isActive).toBe(true);
      expect(recurringSchedule.nextPaymentDate).toBeInstanceOf(Date);

      // Step 7: Generate invoice
      mockPaymentService.generateInvoice.mockResolvedValue({
        invoiceId: 'inv_test123',
        invoiceNumber: 'ZYR-2024-001',
        amount: selectedPlan.price,
        currency: 'EUR',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'paid',
        downloadUrl: 'https://invoices.zyro.com/inv_test123.pdf',
      });

      const invoice = await mockPaymentService.generateInvoice({
        paymentId: paymentResult.transactionId,
        companyId: mockCompany.id,
        amount: selectedPlan.price,
        description: `Suscripción ${mockCompany.subscription.plan}`,
      });

      expect(invoice.status).toBe('paid');
      expect(invoice.downloadUrl).toBeDefined();

      // Step 8: Send confirmation notifications
      await mockNotificationService.sendNotification({
        type: 'payment_confirmation',
        recipient: mockCompany.id,
        title: 'Pago Confirmado',
        body: `Tu suscripción ${mockCompany.subscription.plan} ha sido activada correctamente.`,
        data: {
          subscriptionId: subscription.id,
          invoiceUrl: invoice.downloadUrl,
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'payment_confirmation',
          recipient: mockCompany.id,
        })
      );

      // Step 9: Update company record
      mockDatabaseService.companies.update.mockResolvedValue({
        ...mockCompany,
        subscription: {
          ...mockCompany.subscription,
          status: 'active',
        },
      });

      const updatedCompany = await mockDatabaseService.companies.update(mockCompany.id, {
        subscription: {
          ...mockCompany.subscription,
          status: 'active',
        },
      });

      expect(updatedCompany.subscription.status).toBe('active');
    });

    it('should handle payment failure gracefully', async () => {
      // Mock payment failure
      mockPaymentService.processPayment.mockResolvedValue({
        success: false,
        error: 'insufficient_funds',
        errorMessage: 'Your card has insufficient funds.',
      });

      const paymentResult = await mockPaymentService.processPayment({
        amount: 399,
        currency: 'EUR',
        paymentMethodId: 'pm_test123',
        customerId: mockCompany.id,
        description: 'Test payment',
      });

      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toBe('insufficient_funds');

      // Verify subscription was not created
      expect(mockSubscriptionService.createSubscription).not.toHaveBeenCalled();

      // Verify failure notification was sent
      await mockNotificationService.sendNotification({
        type: 'payment_failed',
        recipient: mockCompany.id,
        title: 'Error en el Pago',
        body: 'No se pudo procesar tu pago. Por favor, verifica tu método de pago.',
        data: {
          error: paymentResult.error,
          errorMessage: paymentResult.errorMessage,
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'payment_failed',
          recipient: mockCompany.id,
        })
      );
    });
  });

  describe('Subscription Renewal Flow', () => {
    it('should handle automatic subscription renewal', async () => {
      const existingSubscription = {
        id: 'sub_existing123',
        companyId: mockCompany.id,
        plan: '6months' as SubscriptionPlan,
        status: 'active' as const,
        startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires tomorrow
        price: 399,
        paymentMethodId: 'pm_test123',
      };

      // Step 1: Identify subscriptions due for renewal
      mockDatabaseService.payments.findPendingPayments.mockResolvedValue([
        {
          subscriptionId: existingSubscription.id,
          companyId: mockCompany.id,
          amount: 399,
          dueDate: existingSubscription.endDate,
        },
      ]);

      const pendingPayments = await mockDatabaseService.payments.findPendingPayments();
      expect(pendingPayments).toHaveLength(1);

      // Step 2: Process renewal payment
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_renewal123',
        amount: 399,
        currency: 'EUR',
        status: 'succeeded',
      });

      const renewalPayment = await mockPaymentService.processPayment({
        amount: 399,
        currency: 'EUR',
        paymentMethodId: existingSubscription.paymentMethodId,
        customerId: mockCompany.id,
        description: 'Renovación automática suscripción 6 meses',
      });

      expect(renewalPayment.success).toBe(true);

      // Step 3: Renew subscription
      mockSubscriptionService.renewSubscription.mockResolvedValue({
        ...existingSubscription,
        startDate: existingSubscription.endDate,
        endDate: new Date(existingSubscription.endDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      });

      const renewedSubscription = await mockSubscriptionService.renewSubscription(
        existingSubscription.id,
        renewalPayment.transactionId
      );

      expect(renewedSubscription.status).toBe('active');
      expect(renewedSubscription.endDate.getTime()).toBeGreaterThan(existingSubscription.endDate.getTime());

      // Step 4: Generate renewal invoice
      mockPaymentService.generateInvoice.mockResolvedValue({
        invoiceId: 'inv_renewal123',
        invoiceNumber: 'ZYR-2024-002',
        amount: 399,
        currency: 'EUR',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'paid',
        downloadUrl: 'https://invoices.zyro.com/inv_renewal123.pdf',
      });

      const renewalInvoice = await mockPaymentService.generateInvoice({
        paymentId: renewalPayment.transactionId,
        companyId: mockCompany.id,
        amount: 399,
        description: 'Renovación suscripción 6 meses',
      });

      expect(renewalInvoice.status).toBe('paid');

      // Step 5: Send renewal confirmation
      await mockNotificationService.sendNotification({
        type: 'subscription_renewed',
        recipient: mockCompany.id,
        title: 'Suscripción Renovada',
        body: 'Tu suscripción ha sido renovada automáticamente por 6 meses más.',
        data: {
          subscriptionId: renewedSubscription.id,
          newEndDate: renewedSubscription.endDate,
          invoiceUrl: renewalInvoice.downloadUrl,
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'subscription_renewed',
          recipient: mockCompany.id,
        })
      );
    });

    it('should handle renewal payment failure', async () => {
      const existingSubscription = {
        id: 'sub_existing123',
        companyId: mockCompany.id,
        plan: '6months' as SubscriptionPlan,
        status: 'active' as const,
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires tomorrow
        paymentMethodId: 'pm_test123',
      };

      // Mock renewal payment failure
      mockPaymentService.processPayment.mockResolvedValue({
        success: false,
        error: 'card_declined',
        errorMessage: 'Your card was declined.',
      });

      const renewalPayment = await mockPaymentService.processPayment({
        amount: 399,
        currency: 'EUR',
        paymentMethodId: existingSubscription.paymentMethodId,
        customerId: mockCompany.id,
        description: 'Renovación automática suscripción 6 meses',
      });

      expect(renewalPayment.success).toBe(false);

      // Step 1: Mark subscription as payment_failed
      mockSubscriptionService.renewSubscription.mockResolvedValue({
        ...existingSubscription,
        status: 'payment_failed',
      });

      // Step 2: Send payment failure notification
      await mockNotificationService.sendNotification({
        type: 'renewal_failed',
        recipient: mockCompany.id,
        title: 'Error en Renovación',
        body: 'No se pudo renovar tu suscripción. Por favor, actualiza tu método de pago.',
        data: {
          subscriptionId: existingSubscription.id,
          error: renewalPayment.error,
          retryUrl: 'https://app.zyro.com/billing/retry',
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'renewal_failed',
          recipient: mockCompany.id,
        })
      );

      // Step 3: Schedule retry attempts
      mockScheduledPaymentService.scheduleRecurringPayment.mockResolvedValue({
        id: 'retry_schedule123',
        subscriptionId: existingSubscription.id,
        nextPaymentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Retry in 3 days
        amount: 399,
        isActive: true,
        retryAttempt: 1,
      });

      const retrySchedule = await mockScheduledPaymentService.scheduleRecurringPayment({
        subscriptionId: existingSubscription.id,
        amount: 399,
        intervalMonths: 0, // Immediate retry schedule
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isRetry: true,
      });

      expect(retrySchedule.retryAttempt).toBe(1);
    });
  });

  describe('Payment Method Management Flow', () => {
    it('should handle payment method updates', async () => {
      const newPaymentMethod = {
        type: 'card' as const,
        cardNumber: '5555555555554444',
        expiryMonth: 6,
        expiryYear: 2026,
        cvc: '456',
        holderName: 'John Doe',
      };

      // Step 1: Validate new payment method
      mockPaymentService.validatePaymentMethod.mockResolvedValue({
        isValid: true,
        paymentMethodId: 'pm_new123',
      });

      const validation = await mockPaymentService.validatePaymentMethod(newPaymentMethod);
      expect(validation.isValid).toBe(true);

      // Step 2: Update company payment method
      mockDatabaseService.companies.update.mockResolvedValue({
        ...mockCompany,
        paymentMethod: 'card',
      });

      const updatedCompany = await mockDatabaseService.companies.update(mockCompany.id, {
        paymentMethod: 'card',
      });

      expect(updatedCompany.paymentMethod).toBe('card');

      // Step 3: Update subscription payment method
      mockSubscriptionService.renewSubscription.mockResolvedValue({
        ...mockCompany.subscription,
        paymentMethodId: validation.paymentMethodId,
      });

      // Step 4: Send confirmation
      await mockNotificationService.sendNotification({
        type: 'payment_method_updated',
        recipient: mockCompany.id,
        title: 'Método de Pago Actualizado',
        body: 'Tu método de pago ha sido actualizado correctamente.',
        data: {
          paymentMethodType: newPaymentMethod.type,
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'payment_method_updated',
          recipient: mockCompany.id,
        })
      );
    });
  });

  describe('Subscription Cancellation Flow', () => {
    it('should handle subscription cancellation', async () => {
      const activeSubscription = {
        id: 'sub_active123',
        companyId: mockCompany.id,
        plan: '6months' as SubscriptionPlan,
        status: 'active' as const,
        endDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months remaining
      };

      // Step 1: Cancel subscription
      mockSubscriptionService.cancelSubscription.mockResolvedValue({
        ...activeSubscription,
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: 'User requested cancellation',
      });

      const cancelledSubscription = await mockSubscriptionService.cancelSubscription(
        activeSubscription.id,
        'User requested cancellation'
      );

      expect(cancelledSubscription.status).toBe('cancelled');
      expect(cancelledSubscription.cancelledAt).toBeInstanceOf(Date);

      // Step 2: Cancel scheduled payments
      mockScheduledPaymentService.scheduleRecurringPayment.mockResolvedValue({
        id: 'schedule_cancelled123',
        subscriptionId: activeSubscription.id,
        isActive: false,
        cancelledAt: new Date(),
      });

      // Step 3: Send cancellation confirmation
      await mockNotificationService.sendNotification({
        type: 'subscription_cancelled',
        recipient: mockCompany.id,
        title: 'Suscripción Cancelada',
        body: 'Tu suscripción ha sido cancelada. Tendrás acceso hasta la fecha de vencimiento.',
        data: {
          subscriptionId: activeSubscription.id,
          accessUntil: activeSubscription.endDate,
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'subscription_cancelled',
          recipient: mockCompany.id,
        })
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle payment service downtime', async () => {
      // Mock service unavailable
      mockPaymentService.processPayment.mockRejectedValue(
        new Error('Payment service temporarily unavailable')
      );

      await expect(
        mockPaymentService.processPayment({
          amount: 399,
          currency: 'EUR',
          paymentMethodId: 'pm_test123',
          customerId: mockCompany.id,
          description: 'Test payment',
        })
      ).rejects.toThrow('Payment service temporarily unavailable');

      // Verify error notification
      await mockNotificationService.sendNotification({
        type: 'payment_error',
        recipient: mockCompany.id,
        title: 'Error Temporal',
        body: 'Estamos experimentando problemas técnicos. Por favor, intenta más tarde.',
        data: {
          error: 'service_unavailable',
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'payment_error',
          recipient: mockCompany.id,
        })
      );
    });

    it('should handle invalid subscription plans', async () => {
      const invalidCompany = {
        ...mockCompany,
        subscription: {
          ...mockCompany.subscription,
          plan: 'invalid_plan' as any,
        },
      };

      // Validation should fail
      const companySchema = ValidationService.getCompanyProfileSchema();
      const validationResult = await ValidationService.validate(companySchema, invalidCompany);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors?.['subscription.plan']).toBeDefined();
    });

    it('should handle concurrent payment processing', async () => {
      // Simulate concurrent payment attempts
      const paymentPromises = [
        mockPaymentService.processPayment({
          amount: 399,
          currency: 'EUR',
          paymentMethodId: 'pm_test123',
          customerId: mockCompany.id,
          description: 'Payment 1',
        }),
        mockPaymentService.processPayment({
          amount: 399,
          currency: 'EUR',
          paymentMethodId: 'pm_test123',
          customerId: mockCompany.id,
          description: 'Payment 2',
        }),
      ];

      // Mock one success, one failure (duplicate payment prevention)
      mockPaymentService.processPayment
        .mockResolvedValueOnce({
          success: true,
          transactionId: 'txn_first123',
          amount: 399,
          currency: 'EUR',
          status: 'succeeded',
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'duplicate_payment',
          errorMessage: 'A payment for this subscription is already being processed.',
        });

      const results = await Promise.all(paymentPromises);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('duplicate_payment');
    });
  });
});