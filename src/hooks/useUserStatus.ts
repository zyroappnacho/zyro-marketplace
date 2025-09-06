import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  checkUserStatus,
  updateUserStatus as updateAuthUserStatus,
} from '../store/slices/authSlice';
import {
  fetchPendingUsers,
  updateUserStatus,
  sendStatusNotification,
  addLocalNotification,
} from '../store/slices/userManagementSlice';
import { notificationService } from '../services/notificationService';
import { UserStatus, BaseUser } from '../types';

export interface UseUserStatusReturn {
  // Current user status
  currentUser: BaseUser | null;
  isAuthenticated: boolean;
  userStatus: UserStatus | null;
  
  // Loading states
  isLoading: boolean;
  isStatusUpdateLoading: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  refreshUserStatus: () => Promise<void>;
  approveUser: (userId: string, customMessage?: string) => Promise<void>;
  rejectUser: (userId: string, customMessage?: string) => Promise<void>;
  suspendUser: (userId: string, customMessage?: string) => Promise<void>;
  reactivateUser: (userId: string, customMessage?: string) => Promise<void>;
  
  // Notifications
  sendWaitingNotification: (userId: string, userEmail: string) => Promise<void>;
  
  // Admin functions
  loadPendingUsers: () => Promise<void>;
  pendingUsers: BaseUser[];
  
  // Status checks
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isSuspended: boolean;
  isAdmin: boolean;
}

export const useUserStatus = (): UseUserStatusReturn => {
  const dispatch = useAppDispatch();
  
  // Auth state
  const { user, isAuthenticated, isLoading: authLoading, error: authError } = useAppSelector(
    state => state.auth
  );
  
  // User management state
  const {
    pendingUsers,
    isLoading: userManagementLoading,
    error: userManagementError,
    statusUpdateLoading,
  } = useAppSelector(state => state.userManagement);

  // Derived state
  const userStatus = user?.status || null;
  const isLoading = authLoading || userManagementLoading;
  const error = authError || userManagementError;
  
  const isPending = userStatus === 'pending';
  const isApproved = userStatus === 'approved';
  const isRejected = userStatus === 'rejected';
  const isSuspended = userStatus === 'suspended';
  const isAdmin = user?.role === 'admin';

  // Check if any user status update is loading
  const isStatusUpdateLoading = Object.values(statusUpdateLoading).some(loading => loading);

  // Refresh current user status
  const refreshUserStatus = useCallback(async () => {
    if (user?.id) {
      await dispatch(checkUserStatus(user.id));
    }
  }, [dispatch, user?.id]);

  // Load pending users (admin function)
  const loadPendingUsers = useCallback(async () => {
    if (isAdmin) {
      await dispatch(fetchPendingUsers());
    }
  }, [dispatch, isAdmin]);

  // Approve user
  const approveUser = useCallback(async (userId: string, customMessage?: string) => {
    try {
      const result = await dispatch(updateUserStatus({
        userId,
        newStatus: 'approved',
        notificationMessage: customMessage,
      }));

      if (updateUserStatus.fulfilled.match(result)) {
        // Send push notification
        await notificationService.sendUserStatusNotification(
          userId,
          'approved',
          customMessage
        );

        // Find user email for email notification
        const user = pendingUsers.find(u => u.id === userId);
        if (user) {
          await notificationService.sendEmailNotification(
            user.email,
            'approved',
            customMessage
          );
        }
      }
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }, [dispatch, pendingUsers]);

  // Reject user
  const rejectUser = useCallback(async (userId: string, customMessage?: string) => {
    try {
      const result = await dispatch(updateUserStatus({
        userId,
        newStatus: 'rejected',
        notificationMessage: customMessage,
      }));

      if (updateUserStatus.fulfilled.match(result)) {
        // Send push notification
        await notificationService.sendUserStatusNotification(
          userId,
          'rejected',
          customMessage
        );

        // Find user email for email notification
        const user = pendingUsers.find(u => u.id === userId);
        if (user) {
          await notificationService.sendEmailNotification(
            user.email,
            'rejected',
            customMessage
          );
        }
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  }, [dispatch, pendingUsers]);

  // Suspend user
  const suspendUser = useCallback(async (userId: string, customMessage?: string) => {
    try {
      const result = await dispatch(updateUserStatus({
        userId,
        newStatus: 'suspended',
        notificationMessage: customMessage,
      }));

      if (updateUserStatus.fulfilled.match(result)) {
        // Send push notification
        await notificationService.sendUserStatusNotification(
          userId,
          'suspended',
          customMessage
        );

        // Find user email for email notification
        const user = [...pendingUsers].find(u => u.id === userId);
        if (user) {
          await notificationService.sendEmailNotification(
            user.email,
            'suspended',
            customMessage
          );
        }
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }, [dispatch, pendingUsers]);

  // Reactivate user
  const reactivateUser = useCallback(async (userId: string, customMessage?: string) => {
    try {
      const result = await dispatch(updateUserStatus({
        userId,
        newStatus: 'approved',
        notificationMessage: customMessage || 'Tu cuenta ha sido reactivada. Ya puedes acceder a Zyro.',
      }));

      if (updateUserStatus.fulfilled.match(result)) {
        // Send push notification
        await notificationService.sendUserStatusNotification(
          userId,
          'approved',
          customMessage || 'Tu cuenta ha sido reactivada. Ya puedes acceder a Zyro.'
        );
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  }, [dispatch]);

  // Send waiting notification for influencers
  const sendWaitingNotification = useCallback(async (userId: string, userEmail: string) => {
    try {
      const notification = await notificationService.sendInfluencerWaitingNotification(
        userId,
        userEmail
      );
      
      // Add to local notifications
      dispatch(addLocalNotification(notification));
    } catch (error) {
      console.error('Error sending waiting notification:', error);
      throw error;
    }
  }, [dispatch]);

  // Auto-refresh user status periodically
  useEffect(() => {
    if (isAuthenticated && user && !isAdmin) {
      const interval = setInterval(() => {
        refreshUserStatus();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, isAdmin, refreshUserStatus]);

  // Load pending users when admin logs in
  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      loadPendingUsers();
    }
  }, [isAdmin, isAuthenticated, loadPendingUsers]);

  return {
    // Current user status
    currentUser: user,
    isAuthenticated,
    userStatus,
    
    // Loading states
    isLoading,
    isStatusUpdateLoading,
    
    // Error handling
    error,
    
    // Actions
    refreshUserStatus,
    approveUser,
    rejectUser,
    suspendUser,
    reactivateUser,
    
    // Notifications
    sendWaitingNotification,
    
    // Admin functions
    loadPendingUsers,
    pendingUsers,
    
    // Status checks
    isPending,
    isApproved,
    isRejected,
    isSuspended,
    isAdmin,
  };
};