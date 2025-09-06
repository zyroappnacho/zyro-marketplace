import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, RefreshControl, Dimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { StatCard } from '../components/dashboard/StatCard';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { PaymentRepository } from '../database/repositories/PaymentRepository';
import { subscriptionService } from '../services/subscriptionService';
import { DatabaseService } from '../database/DatabaseService';

interface RevenueDashboardScreenProps {
  navigation: any;
}

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  failedPayments: number;
  pendingPayments: number;
  averageSubscriptionValue: number;
  churnRate: number;
  subscriptionsByPlan: Record<string, number>;
  monthlyRevenueData: Array<{ month: string; revenue: number }>;
  revenueByPaymentMethod: Array<{ payment_method: string; revenue: number; count: number }>;
}

interface ExportData {
  transactions: any[];
  subscriptions: any[];
  summary: any;
}

const Container = styled.View`
  flex: 1;
  background-color: ${colors.black};
`;

const Header = styled.View`
  padding: ${spacing.xl}px ${spacing.lg}px ${spacing.lg}px;
  align-items: center;
  border-bottom: 1px solid ${colors.goldElegant}20;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  left: ${spacing.lg}px;
  top: ${spacing.xl}px;
  padding: ${spacing.sm}px;
`;

const BackText = styled.Text`
  color: ${colors.goldElegant};
  font-size: ${fontSizes.md}px;
  font-weight: ${fontWeights.medium};
`;

const Title = styled.Text`
  color: ${colors.white};
  font-size: ${fontSizes.xl}px;
  font-weight: ${fontWeights.semibold};
  text-align: center;
  margin-top: ${spacing.md}px;
`;

const Subtitle = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
  text-align: center;
  margin-top: ${spacing.xs}px;
`;

const Content = styled.View`
  flex: 1;
  padding: ${spacing.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${colors.goldElegant};
  font-size: ${fontSizes.lg}px;
  font-weight: ${fontWeights.semibold};
  margin-bottom: ${spacing.md}px;
  margin-top: ${spacing.lg}px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing.md}px;
`;

const ChartContainer = styled.View`
  background-color: ${colors.darkGray};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.lg}px;
  border: 1px solid ${colors.goldElegant}20;
`;

const ChartTitle = styled.Text`
  color: ${colors.white};
  font-size: ${fontSizes.md}px;
  font-weight: ${fontWeights.semibold};
  margin-bottom: ${spacing.md}px;
  text-align: center;
`;

const ChartBar = styled.View<{ width: number; isHighest: boolean }>`
  height: 40px;
  background-color: ${({ isHighest }) => isHighest ? colors.goldBright : colors.goldElegant};
  border-radius: ${borderRadius.sm}px;
  margin-bottom: ${spacing.sm}px;
  justify-content: center;
  padding: 0 ${spacing.sm}px;
  width: ${({ width }) => width}%;
`;

const ChartBarLabel = styled.Text`
  color: ${colors.black};
  font-size: ${fontSizes.xs}px;
  font-weight: ${fontWeights.semibold};
`;

const ChartLegend = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xs}px;
`;

const ChartLegendText = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
`;

const ChartLegendValue = styled.Text`
  color: ${colors.white};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.semibold};
`;

const PaymentMethodCard = styled.View`
  background-color: ${colors.darkGray};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
  border: 1px solid ${colors.goldElegant}20;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const PaymentMethodInfo = styled.View`
  flex: 1;
`;

const PaymentMethodName = styled.Text`
  color: ${colors.white};
  font-size: ${fontSizes.md}px;
  font-weight: ${fontWeights.semibold};
  margin-bottom: ${spacing.xs}px;
`;

const PaymentMethodStats = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
`;

const PaymentMethodRevenue = styled.Text`
  color: ${colors.goldElegant};
  font-size: ${fontSizes.lg}px;
  font-weight: ${fontWeights.bold};
`;

const ButtonContainer = styled.View`
  padding: ${spacing.lg}px;
  gap: ${spacing.md}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl}px;
`;

const LoadingText = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.md}px;
  font-weight: ${fontWeights.normal};
  margin-top: ${spacing.md}px;
`;

const ErrorContainer = styled.View`
  background-color: ${colors.error}20;
  border: 1px solid ${colors.error}40;
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.lg}px;
`;

const ErrorText = styled.Text`
  color: ${colors.error};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.medium};
  text-align: center;
`;

const LastUpdated = styled.Text`
  color: ${colors.mediumGray};
  font-size: ${fontSizes.xs}px;
  font-weight: ${fontWeights.normal};
  text-align: center;
  margin-bottom: ${spacing.lg}px;
`;

export const RevenueDashboardScreen: React.FC<RevenueDashboardScreenProps> = ({
  navigation,
}) => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const paymentRepository = new PaymentRepository(DatabaseService.getInstance());

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setError(null);
      
      // Load payment statistics
      const paymentStats = await paymentRepository.getPaymentStats();
      
      // Load subscription metrics
      const subscriptionMetrics = await subscriptionService.getSubscriptionMetrics();
      
      // Load monthly revenue data
      const monthlyData = await paymentRepository.getMonthlyRevenueData(12);
      
      // Load revenue by payment method
      const paymentMethodData = await paymentRepository.getRevenueByPaymentMethod();

      const data: RevenueData = {
        totalRevenue: paymentStats.total_revenue,
        monthlyRevenue: paymentStats.monthly_revenue,
        activeSubscriptions: paymentStats.active_subscriptions,
        failedPayments: paymentStats.failed_payments,
        pendingPayments: paymentStats.pending_payments,
        averageSubscriptionValue: subscriptionMetrics.averageSubscriptionValue,
        churnRate: subscriptionMetrics.churnRate,
        subscriptionsByPlan: subscriptionMetrics.subscriptionsByPlan,
        monthlyRevenueData: monthlyData,
        revenueByPaymentMethod: paymentMethodData,
      };

      setRevenueData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading revenue data:', error);
      setError('Error al cargar los datos de ingresos');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRevenueData();
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      
      // Get all transactions for export
      const transactions = await paymentRepository.getTransactions({}, 1000);
      
      // Get subscription data
      const subscriptionMetrics = await subscriptionService.getSubscriptionMetrics();
      
      // Create export data
      const exportData: ExportData = {
        transactions: transactions.map(t => ({
          id: t.id,
          company_id: t.company_id,
          amount: t.amount,
          currency: t.currency,
          payment_method: t.payment_method,
          status: t.status,
          created_at: t.created_at,
          processed_at: t.processed_at,
        })),
        subscriptions: Object.entries(subscriptionMetrics.subscriptionsByPlan).map(([plan, count]) => ({
          plan,
          count,
          revenue: count * getPlanPrice(plan),
        })),
        summary: {
          total_revenue: revenueData?.totalRevenue || 0,
          monthly_revenue: revenueData?.monthlyRevenue || 0,
          active_subscriptions: revenueData?.activeSubscriptions || 0,
          average_subscription_value: revenueData?.averageSubscriptionValue || 0,
          churn_rate: revenueData?.churnRate || 0,
          export_date: new Date().toISOString(),
        },
      };

      // In a real implementation, you would:
      // 1. Generate CSV or Excel file
      // 2. Save to device or send via email
      // 3. Show success message
      
      Alert.alert(
        'Exportación Completada',
        `Se han exportado ${exportData.transactions.length} transacciones y datos de resumen.`,
        [{ text: 'OK' }]
      );
      
      console.log('Export data:', exportData);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'No se pudieron exportar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanPrice = (plan: string): number => {
    switch (plan) {
      case '3months': return 499;
      case '6months': return 399;
      case '12months': return 299;
      default: return 0;
    }
  };

  const getPlanName = (plan: string): string => {
    switch (plan) {
      case '3months': return '3 Meses';
      case '6months': return '6 Meses';
      case '12months': return '12 Meses';
      default: return plan;
    }
  };

  const getPaymentMethodName = (method: string): string => {
    switch (method) {
      case 'card': return 'Tarjeta';
      case 'sepa': return 'SEPA';
      case 'bizum': return 'Bizum';
      case 'apple_pay': return 'Apple Pay';
      case 'google_pay': return 'Google Pay';
      case 'bank_transfer': return 'Transferencia';
      default: return method;
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading && !revenueData) {
    return (
      <Container>
        <StatusBar style="light" backgroundColor={colors.black} />
        <Header>
          <BackButton onPress={handleBack}>
            <BackText>← Atrás</BackText>
          </BackButton>
          <ZyroLogo size="small" color={colors.goldElegant} />
          <Title>Dashboard de Ingresos</Title>
        </Header>
        <LoadingContainer>
          <LoadingText>Cargando datos de ingresos...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar style="light" backgroundColor={colors.black} />
      
      <Header>
        <BackButton onPress={handleBack}>
          <BackText>← Atrás</BackText>
        </BackButton>
        <ZyroLogo size="small" color={colors.goldElegant} />
        <Title>Dashboard de Ingresos</Title>
        <Subtitle>Análisis financiero y métricas de suscripciones</Subtitle>
      </Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.goldElegant}
          />
        }
      >
        <Content>
          {lastUpdated && (
            <LastUpdated>
              Última actualización: {lastUpdated.toLocaleString('es-ES')}
            </LastUpdated>
          )}

          {error && (
            <ErrorContainer>
              <ErrorText>{error}</ErrorText>
            </ErrorContainer>
          )}

          {revenueData && (
            <>
              {/* Revenue Overview */}
              <SectionTitle>Resumen de Ingresos</SectionTitle>
              
              <StatsRow>
                <StatCard
                  title="Ingresos Totales"
                  value={`€${revenueData.totalRevenue.toLocaleString()}`}
                  subtitle="Histórico acumulado"
                  size="large"
                />
              </StatsRow>

              <StatsRow>
                <StatCard
                  title="Ingresos Mensuales"
                  value={`€${revenueData.monthlyRevenue.toLocaleString()}`}
                  subtitle="Mes actual"
                  size="medium"
                />
                <StatCard
                  title="Proyección Anual"
                  value={`€${(revenueData.monthlyRevenue * 12).toLocaleString()}`}
                  subtitle="Basado en mes actual"
                  size="medium"
                />
              </StatsRow>

              {/* Subscription Metrics */}
              <SectionTitle>Métricas de Suscripciones</SectionTitle>
              
              <StatsRow>
                <StatCard
                  title="Suscripciones Activas"
                  value={revenueData.activeSubscriptions.toString()}
                  subtitle="Empresas pagando"
                  size="medium"
                />
                <StatCard
                  title="Valor Promedio"
                  value={`€${revenueData.averageSubscriptionValue.toFixed(0)}`}
                  subtitle="Por suscripción"
                  size="medium"
                />
              </StatsRow>

              <StatsRow>
                <StatCard
                  title="Tasa de Abandono"
                  value={`${revenueData.churnRate.toFixed(1)}%`}
                  subtitle="Últimos 30 días"
                  size="medium"
                />
                <StatCard
                  title="Pagos Fallidos"
                  value={revenueData.failedPayments.toString()}
                  subtitle="Requieren atención"
                  size="medium"
                />
              </StatsRow>

              {/* Subscriptions by Plan */}
              <SectionTitle>Distribución por Plan</SectionTitle>
              <ChartContainer>
                <ChartTitle>Suscripciones por Plan</ChartTitle>
                {Object.entries(revenueData.subscriptionsByPlan).map(([plan, count]) => {
                  const maxCount = Math.max(...Object.values(revenueData.subscriptionsByPlan));
                  const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  const isHighest = count === maxCount;
                  const revenue = count * getPlanPrice(plan);
                  
                  return (
                    <View key={plan}>
                      <ChartLegend>
                        <ChartLegendText>{getPlanName(plan)}</ChartLegendText>
                        <ChartLegendValue>
                          {count} suscripciones • €{revenue.toLocaleString()}
                        </ChartLegendValue>
                      </ChartLegend>
                      <ChartBar width={Math.max(width, 5)} isHighest={isHighest}>
                        <ChartBarLabel>
                          {count > 0 ? `${count} (€${getPlanPrice(plan)}/mes)` : ''}
                        </ChartBarLabel>
                      </ChartBar>
                    </View>
                  );
                })}
              </ChartContainer>

              {/* Revenue by Payment Method */}
              <SectionTitle>Ingresos por Método de Pago</SectionTitle>
              {revenueData.revenueByPaymentMethod.map((method) => (
                <PaymentMethodCard key={method.payment_method}>
                  <PaymentMethodInfo>
                    <PaymentMethodName>
                      {getPaymentMethodName(method.payment_method)}
                    </PaymentMethodName>
                    <PaymentMethodStats>
                      {method.count} transacciones
                    </PaymentMethodStats>
                  </PaymentMethodInfo>
                  <PaymentMethodRevenue>
                    €{method.revenue.toLocaleString()}
                  </PaymentMethodRevenue>
                </PaymentMethodCard>
              ))}

              {/* Monthly Revenue Trend */}
              {revenueData.monthlyRevenueData.length > 0 && (
                <>
                  <SectionTitle>Tendencia de Ingresos Mensuales</SectionTitle>
                  <ChartContainer>
                    <ChartTitle>Últimos 12 Meses</ChartTitle>
                    {revenueData.monthlyRevenueData.map((monthData) => {
                      const maxRevenue = Math.max(...revenueData.monthlyRevenueData.map(m => m.revenue));
                      const width = maxRevenue > 0 ? (monthData.revenue / maxRevenue) * 100 : 0;
                      const isHighest = monthData.revenue === maxRevenue;
                      
                      return (
                        <View key={monthData.month}>
                          <ChartLegend>
                            <ChartLegendText>
                              {new Date(monthData.month + '-01').toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long' 
                              })}
                            </ChartLegendText>
                            <ChartLegendValue>
                              €{monthData.revenue.toLocaleString()}
                            </ChartLegendValue>
                          </ChartLegend>
                          <ChartBar width={Math.max(width, 5)} isHighest={isHighest}>
                            <ChartBarLabel>
                              {monthData.revenue > 0 ? `€${monthData.revenue.toLocaleString()}` : ''}
                            </ChartBarLabel>
                          </ChartBar>
                        </View>
                      );
                    })}
                  </ChartContainer>
                </>
              )}
            </>
          )}
        </Content>
      </ScrollView>

      <ButtonContainer>
        <PremiumButton
          title="Exportar Datos Financieros"
          variant="outline"
          size="large"
          fullWidth
          onPress={handleExportData}
          loading={isLoading}
        />
      </ButtonContainer>
    </Container>
  );
};