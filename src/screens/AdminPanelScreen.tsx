import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchPendingUsers,
  updateUserStatus,
  clearError,
  UserStatusNotification,
} from '../store/slices/userManagementSlice';
import {
  fetchDashboardStats,
  fetchRecentActivity,
  refreshDashboard,
  clearError as clearDashboardError,
} from '../store/slices/dashboardSlice';
import { logout } from '../store/slices/authSlice';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivityCard } from '../components/dashboard/RecentActivityCard';
import { theme } from '../styles/theme';
import { BaseUser, UserStatus } from '../types';
import { notificationService } from '../services/notificationService';
import { scheduledPaymentService } from '../services/scheduledPaymentService';

interface AdminPanelScreenProps {
  navigation: any;
}

interface UserCardProps {
  user: BaseUser;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  isLoading: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onApprove, onReject, isLoading }) => {
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'influencer':
        return 'Influencer';
      case 'company':
        return 'Empresa';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'influencer':
        return theme.colors.accent;
      case 'company':
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
              <Text style={styles.roleText}>{getRoleDisplayName(user.role)}</Text>
            </View>
            <Text style={styles.timeAgo}>{getTimeAgo(user.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.userActions}>
        <PremiumButton
          title="Aprobar"
          onPress={() => onApprove(user.id)}
          loading={isLoading}
          style={styles.approveButton}
          size="small"
        />
        <PremiumButton
          title="Rechazar"
          onPress={() => onReject(user.id)}
          loading={isLoading}
          variant="outline"
          style={styles.rejectButton}
          size="small"
        />
      </View>
    </View>
  );
};

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const {
    pendingUsers,
    isLoading,
    error,
    statusUpdateLoading,
    notifications,
  } = useAppSelector(state => state.userManagement);
  
  const {
    stats,
    recentActivity,
    isLoading: dashboardLoading,
    error: dashboardError,
    lastUpdated,
  } = useAppSelector(state => state.dashboard);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load initial data when component mounts
    dispatch(fetchPendingUsers());
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentActivity());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (dashboardError) {
      Alert.alert('Error del Dashboard', dashboardError, [
        { text: 'OK', onPress: () => dispatch(clearDashboardError()) }
      ]);
    }
  }, [dashboardError, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchPendingUsers()),
      dispatch(refreshDashboard()),
    ]);
    setRefreshing(false);
  };

  const handleApproveUser = async (userId: string) => {
    const userToApprove = pendingUsers.find(u => u.id === userId);
    if (!userToApprove) return;

    Alert.alert(
      'Aprobar Usuario',
      `¿Estás seguro de que quieres aprobar a ${userToApprove.email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          onPress: async () => {
            try {
              // Update user status
              await dispatch(updateUserStatus({
                userId,
                newStatus: 'approved',
                notificationMessage: '¡Felicidades! Tu cuenta ha sido aprobada. Ya puedes acceder a todas las funcionalidades de Zyro.',
              }));

              // Send notification
              await notificationService.sendUserStatusNotification(
                userId,
                'approved'
              );

              // Send email notification
              await notificationService.sendEmailNotification(
                userToApprove.email,
                'approved'
              );

              Alert.alert('Éxito', 'Usuario aprobado correctamente');
            } catch (error) {
              console.error('Error approving user:', error);
              Alert.alert('Error', 'No se pudo aprobar el usuario');
            }
          }
        }
      ]
    );
  };

  const handleRejectUser = async (userId: string) => {
    const userToReject = pendingUsers.find(u => u.id === userId);
    if (!userToReject) return;

    Alert.alert(
      'Rechazar Usuario',
      `¿Estás seguro de que quieres rechazar a ${userToReject.email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update user status
              await dispatch(updateUserStatus({
                userId,
                newStatus: 'rejected',
                notificationMessage: 'Tu solicitud de registro ha sido rechazada. Por favor, contacta con soporte para más información.',
              }));

              // Send notification
              await notificationService.sendUserStatusNotification(
                userId,
                'rejected'
              );

              // Send email notification
              await notificationService.sendEmailNotification(
                userToReject.email,
                'rejected'
              );

              Alert.alert('Usuario Rechazado', 'El usuario ha sido rechazado');
            } catch (error) {
              console.error('Error rejecting user:', error);
              Alert.alert('Error', 'No se pudo rechazar el usuario');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          onPress: () => {
            dispatch(logout());
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  const handleProcessPayments = async () => {
    Alert.alert(
      'Procesar Pagos',
      '¿Quieres procesar manualmente los pagos recurrentes y renovaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Procesar',
          onPress: async () => {
            try {
              await scheduledPaymentService.triggerManualProcessing();
              Alert.alert('Éxito', 'Procesamiento de pagos completado');
            } catch (error) {
              console.error('Error processing payments:', error);
              Alert.alert('Error', 'No se pudieron procesar los pagos');
            }
          }
        }
      ]
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ZyroLogo size="medium" />
        <View style={styles.headerActions}>
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>{unreadNotifications}</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Text style={styles.title}>Panel de Administrador</Text>
        <Text style={styles.subtitle}>Bienvenido, {user?.email}</Text>
        
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}

        {/* Dashboard Statistics */}
        {stats && (
          <>
            <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
            
            {/* User Statistics */}
            <View style={styles.statsRow}>
              <StatCard
                title="Influencers Activos"
                value={stats.users.activeInfluencers}
                subtitle={`${stats.users.totalInfluencers} total`}
                size="medium"
              />
              <StatCard
                title="Empresas Activas"
                value={stats.users.activeCompanies}
                subtitle={`${stats.users.totalCompanies} total`}
                size="medium"
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Pendientes"
                value={stats.users.pendingApprovals}
                subtitle="Esperando aprobación"
                size="medium"
              />
              <StatCard
                title="Nuevos Este Mes"
                value={stats.users.newUsersThisMonth}
                subtitle="Registros recientes"
                size="medium"
              />
            </View>

            {/* Revenue Statistics */}
            <View style={styles.statsRow}>
              <StatCard
                title="Ingresos Mensuales"
                value={`€${stats.revenue.monthlyRevenue.toLocaleString()}`}
                subtitle={`Proyección anual: €${stats.revenue.yearlyProjection.toLocaleString()}`}
                size="large"
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Promedio por Empresa"
                value={`€${stats.revenue.averageRevenuePerCompany}`}
                subtitle="Ingreso mensual medio"
                size="medium"
              />
              <StatCard
                title="Ingresos Totales"
                value={`€${stats.revenue.totalRevenue.toLocaleString()}`}
                subtitle="Acumulado histórico"
                size="medium"
              />
            </View>

            {/* Campaign & Collaboration Statistics */}
            <View style={styles.statsRow}>
              <StatCard
                title="Campañas Activas"
                value={stats.campaigns.activeCampaigns}
                subtitle={`${stats.campaigns.totalCampaigns} total`}
                size="medium"
              />
              <StatCard
                title="Colaboraciones"
                value={stats.collaborations.activeCollaborations}
                subtitle={`${stats.collaborations.successRate}% éxito`}
                size="medium"
              />
            </View>
          </>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <RecentActivityCard
            activities={recentActivity}
            isLoading={dashboardLoading}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsContainer}>
            <PremiumButton
              title="Gestionar Usuarios"
              onPress={() => navigation.navigate('UserManagement')}
              style={styles.quickActionButton}
              size="medium"
            />
            <PremiumButton
              title="Gestionar Campañas"
              onPress={() => navigation.navigate('CampaignManagement')}
              variant="outline"
              style={styles.quickActionButton}
              size="medium"
            />
          </View>
          <View style={[styles.quickActionsContainer, { marginTop: 12 }]}>
            <PremiumButton
              title="Configurar Pagos"
              onPress={() => navigation.navigate('PaymentConfig')}
              variant="outline"
              style={styles.quickActionButton}
              size="medium"
            />
            <PremiumButton
              title="Dashboard Ingresos"
              onPress={() => navigation.navigate('RevenueDashboard')}
              variant="outline"
              style={styles.quickActionButton}
              size="medium"
            />
          </View>
          <View style={[styles.quickActionsContainer, { marginTop: 12 }]}>
            <PremiumButton
              title="Procesar Pagos"
              onPress={handleProcessPayments}
              variant="outline"
              style={styles.quickActionButton}
              size="medium"
            />
            <View style={styles.quickActionButton} />
          </View>
        </View>

        {/* Pending Users Section - Quick Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Usuarios Pendientes de Aprobación</Text>
            {pendingUsers.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('UserManagement')}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isLoading && pendingUsers.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando usuarios...</Text>
            </View>
          ) : pendingUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay usuarios pendientes</Text>
              <Text style={styles.emptySubtext}>
                Todos los usuarios han sido procesados
              </Text>
            </View>
          ) : (
            // Show only first 3 pending users in dashboard
            pendingUsers.slice(0, 3).map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onApprove={handleApproveUser}
                onReject={handleRejectUser}
                isLoading={statusUpdateLoading[user.id] || false}
              />
            ))
          )}
          
          {pendingUsers.length > 3 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('UserManagement')}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>
                Ver {pendingUsers.length - 3} usuarios más...
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  logoutText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    fontFamily: 'Cinzel',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  lastUpdated: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Inter',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  showMoreButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
  },
  showMoreText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  userCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  timeAgo: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flex: 1,
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});

export default AdminPanelScreen;