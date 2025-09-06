import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchPendingUsers,
  fetchUsersByStatus,
  updateUserStatus,
  clearError,
} from '../store/slices/userManagementSlice';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { theme } from '../styles/theme';
import { BaseUser, UserStatus } from '../types';
import { notificationService } from '../services/notificationService';

interface UserManagementScreenProps {
  navigation: any;
}

interface UserDetailModalProps {
  user: BaseUser | null;
  visible: boolean;
  onClose: () => void;
  onApprove: (userId: string, comments?: string) => void;
  onReject: (userId: string, comments?: string) => void;
  isLoading: boolean;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  visible,
  onClose,
  onApprove,
  onReject,
  isLoading,
}) => {
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleAction = () => {
    if (!user || !actionType) return;

    if (actionType === 'approve') {
      onApprove(user.id, comments);
    } else {
      onReject(user.id, comments);
    }
    
    setComments('');
    setActionType(null);
    onClose();
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

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Detalles del Usuario</Text>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.userDetailCard}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user.email}</Text>
          </View>

          <View style={styles.userDetailCard}>
            <Text style={styles.detailLabel}>Tipo de Usuario</Text>
            <Text style={styles.detailValue}>{getRoleDisplayName(user.role)}</Text>
          </View>

          <View style={styles.userDetailCard}>
            <Text style={styles.detailLabel}>Estado Actual</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(user.status) }]}>
              {getStatusDisplayName(user.status)}
            </Text>
          </View>

          <View style={styles.userDetailCard}>
            <Text style={styles.detailLabel}>Fecha de Registro</Text>
            <Text style={styles.detailValue}>
              {user.createdAt.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsLabel}>
              Comentarios {actionType ? `(${actionType === 'approve' ? 'Aprobación' : 'Rechazo'})` : '(Opcional)'}
            </Text>
            <TextInput
              style={styles.commentsInput}
              multiline
              numberOfLines={4}
              placeholder="Agregar comentarios sobre la decisión..."
              placeholderTextColor={theme.colors.textSecondary}
              value={comments}
              onChangeText={setComments}
            />
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          {actionType ? (
            <View style={styles.confirmationActions}>
              <PremiumButton
                title="Cancelar"
                onPress={() => {
                  setActionType(null);
                  setComments('');
                }}
                variant="outline"
                style={styles.cancelButton}
              />
              <PremiumButton
                title={`Confirmar ${actionType === 'approve' ? 'Aprobación' : 'Rechazo'}`}
                onPress={handleAction}
                loading={isLoading}
                style={[
                  styles.confirmButton,
                  actionType === 'reject' && styles.rejectConfirmButton
                ]}
              />
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <PremiumButton
                title="Aprobar"
                onPress={() => setActionType('approve')}
                style={styles.approveButton}
              />
              <PremiumButton
                title="Rechazar"
                onPress={() => setActionType('reject')}
                variant="outline"
                style={styles.rejectButton}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStatusColor = (status: UserStatus): string => {
  switch (status) {
    case 'approved':
      return theme.colors.success;
    case 'rejected':
      return theme.colors.error;
    case 'suspended':
      return theme.colors.warning;
    case 'pending':
      return theme.colors.info;
    default:
      return theme.colors.textSecondary;
  }
};

const getStatusDisplayName = (status: UserStatus): string => {
  switch (status) {
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    case 'suspended':
      return 'Suspendido';
    case 'pending':
      return 'Pendiente';
    default:
      return status;
  }
};

interface UserListItemProps {
  user: BaseUser;
  onPress: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onPress }) => {
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
    <TouchableOpacity style={styles.userListItem} onPress={onPress}>
      <View style={styles.userItemHeader}>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.userItemMeta}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
            <Text style={styles.roleText}>
              {user.role === 'influencer' ? 'Influencer' : 'Empresa'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
            <Text style={styles.statusText}>{getStatusDisplayName(user.status)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.userTimeAgo}>{getTimeAgo(user.createdAt)}</Text>
    </TouchableOpacity>
  );
};

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const {
    pendingUsers,
    approvedUsers,
    rejectedUsers,
    suspendedUsers,
    isLoading,
    error,
    statusUpdateLoading,
  } = useAppSelector(state => state.userManagement);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BaseUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'suspended'>('pending');

  useEffect(() => {
    // Load users when component mounts
    dispatch(fetchPendingUsers());
    dispatch(fetchUsersByStatus('approved'));
    dispatch(fetchUsersByStatus('rejected'));
    dispatch(fetchUsersByStatus('suspended'));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchPendingUsers()),
      dispatch(fetchUsersByStatus('approved')),
      dispatch(fetchUsersByStatus('rejected')),
      dispatch(fetchUsersByStatus('suspended')),
    ]);
    setRefreshing(false);
  };

  const handleUserPress = (user: BaseUser) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleApproveUser = async (userId: string, comments?: string) => {
    try {
      await dispatch(updateUserStatus({
        userId,
        newStatus: 'approved',
        adminNotes: comments,
        notificationMessage: '¡Felicidades! Tu cuenta ha sido aprobada. Ya puedes acceder a todas las funcionalidades de Zyro.',
      }));

      // Send notifications
      await notificationService.sendUserStatusNotification(userId, 'approved');
      
      Alert.alert('Éxito', 'Usuario aprobado correctamente');
    } catch (error) {
      console.error('Error approving user:', error);
      Alert.alert('Error', 'No se pudo aprobar el usuario');
    }
  };

  const handleRejectUser = async (userId: string, comments?: string) => {
    try {
      await dispatch(updateUserStatus({
        userId,
        newStatus: 'rejected',
        adminNotes: comments,
        notificationMessage: 'Tu solicitud de registro ha sido rechazada. Por favor, contacta con soporte para más información.',
      }));

      // Send notifications
      await notificationService.sendUserStatusNotification(userId, 'rejected');
      
      Alert.alert('Usuario Rechazado', 'El usuario ha sido rechazado');
    } catch (error) {
      console.error('Error rejecting user:', error);
      Alert.alert('Error', 'No se pudo rechazar el usuario');
    }
  };

  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'pending':
        return pendingUsers;
      case 'approved':
        return approvedUsers;
      case 'rejected':
        return rejectedUsers;
      case 'suspended':
        return suspendedUsers;
      default:
        return [];
    }
  };

  const getTabCount = (tab: typeof activeTab) => {
    switch (tab) {
      case 'pending':
        return pendingUsers.length;
      case 'approved':
        return approvedUsers.length;
      case 'rejected':
        return rejectedUsers.length;
      case 'suspended':
        return suspendedUsers.length;
      default:
        return 0;
    }
  };

  const currentUsers = getCurrentUsers();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <ZyroLogo size="small" />
      </View>

      <Text style={styles.title}>Gestión de Usuarios</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pendientes ({getTabCount('pending')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
            Aprobados ({getTabCount('approved')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rejected' && styles.activeTab]}
          onPress={() => setActiveTab('rejected')}
        >
          <Text style={[styles.tabText, activeTab === 'rejected' && styles.activeTabText]}>
            Rechazados ({getTabCount('rejected')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suspended' && styles.activeTab]}
          onPress={() => setActiveTab('suspended')}
        >
          <Text style={[styles.tabText, activeTab === 'suspended' && styles.activeTabText]}>
            Suspendidos ({getTabCount('suspended')})
          </Text>
        </TouchableOpacity>
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
        {isLoading && currentUsers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando usuarios...</Text>
          </View>
        ) : currentUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay usuarios en esta categoría</Text>
          </View>
        ) : (
          currentUsers.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              onPress={() => handleUserPress(user)}
            />
          ))
        )}
      </ScrollView>

      <UserDetailModal
        user={selectedUser}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
        onApprove={handleApproveUser}
        onReject={handleRejectUser}
        isLoading={selectedUser ? statusUpdateLoading[selectedUser.id] || false : false}
      />
    </View>
  );
};

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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Cinzel',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  userListItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    fontFamily: 'Inter',
    flex: 1,
    marginRight: 12,
  },
  userItemMeta: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  roleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  userTimeAgo: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
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
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 24,
    top: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: 'Inter',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: 'Cinzel',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  userDetailCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'Inter',
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Inter',
    fontWeight: '500',
    marginBottom: 8,
  },
  commentsInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontFamily: 'Inter',
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalActions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButtons: {
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
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
  rejectConfirmButton: {
    backgroundColor: theme.colors.error,
  },
});

export default UserManagementScreen;