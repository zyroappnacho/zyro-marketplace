import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  updateCollaborationStatus,
  updateRequestStatusLocally,
  getCollaborationsByInfluencer,
  getPendingCollaborations,
  selectCollaborationRequests,
  selectPendingRequests,
  selectUpdatingStatus,
} from '../store/slices/collaborationSlice';
import { CollaborationStatus } from '../types';
import { notificationService } from '../services/notificationService';

export const useCollaborationStatus = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const collaborationRequests = useAppSelector(selectCollaborationRequests);
  const pendingRequests = useAppSelector(selectPendingRequests);
  const updatingStatus = useAppSelector(selectUpdatingStatus);

  // Load collaborations based on user role
  const loadCollaborations = useCallback(async () => {
    if (!user) return;

    try {
      if (user.role === 'influencer') {
        await dispatch(getCollaborationsByInfluencer(user.id));
      } else if (user.role === 'admin') {
        await dispatch(getPendingCollaborations());
      }
    } catch (error) {
      console.error('Error loading collaborations:', error);
    }
  }, [dispatch, user]);

  // Update collaboration status (admin only)
  const updateStatus = useCallback(async (
    requestId: string,
    status: CollaborationStatus,
    adminNotes?: string
  ) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only administrators can update collaboration status');
    }

    try {
      const result = await dispatch(updateCollaborationStatus({
        requestId,
        status,
        adminNotes,
      }));

      if (updateCollaborationStatus.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error('Failed to update collaboration status');
      }
    } catch (error) {
      console.error('Error updating collaboration status:', error);
      throw error;
    }
  }, [dispatch, user]);

  // Handle real-time status updates (for WebSocket or push notifications)
  const handleStatusUpdate = useCallback((data: {
    requestId: string;
    status: CollaborationStatus;
    adminNotes?: string;
  }) => {
    dispatch(updateRequestStatusLocally(data));
  }, [dispatch]);

  // Set up notification listeners
  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.onNotification((notification) => {
      if (notification.type === 'approval_status' && notification.data) {
        const { collaborationRequestId, status } = notification.data;
        if (collaborationRequestId && status) {
          handleStatusUpdate({
            requestId: collaborationRequestId,
            status: status as CollaborationStatus,
          });
        }
      }
    });

    return unsubscribe;
  }, [user, handleStatusUpdate]);

  // Auto-refresh collaborations periodically
  useEffect(() => {
    if (!user) return;

    loadCollaborations();

    // Refresh every 5 minutes
    const interval = setInterval(loadCollaborations, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadCollaborations, user]);

  // Validation helpers
  const canUpdateStatus = useCallback((currentStatus: CollaborationStatus, newStatus: CollaborationStatus): boolean => {
    const validTransitions: Record<CollaborationStatus, CollaborationStatus[]> = {
      pending: ['approved', 'rejected'],
      approved: ['completed', 'cancelled'],
      rejected: [], // Cannot change from rejected
      completed: [], // Cannot change from completed
      cancelled: [], // Cannot change from cancelled
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }, []);

  const getStatusColor = useCallback((status: CollaborationStatus): string => {
    const statusColors = {
      pending: '#FFA500', // Orange
      approved: '#32CD32', // Green
      rejected: '#FF6B6B', // Red
      completed: '#4ECDC4', // Teal
      cancelled: '#95A5A6', // Gray
    };

    return statusColors[status] || '#95A5A6';
  }, []);

  const getStatusText = useCallback((status: CollaborationStatus): string => {
    const statusTexts = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };

    return statusTexts[status] || 'Desconocido';
  }, []);

  // Content validation helpers
  const validateContentDelivery = useCallback((
    instagramStories: string[],
    tiktokVideos: string[],
    requirements: { instagramStories: number; tiktokVideos: number }
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (requirements.instagramStories > 0 && instagramStories.length < requirements.instagramStories) {
      errors.push(`Se requieren ${requirements.instagramStories} historias de Instagram`);
    }

    if (requirements.tiktokVideos > 0 && tiktokVideos.length < requirements.tiktokVideos) {
      errors.push(`Se requieren ${requirements.tiktokVideos} videos de TikTok`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // Check if content delivery deadline has passed
  const isContentOverdue = useCallback((
    collaborationDate: Date,
    deadlineHours: number
  ): boolean => {
    const deadline = new Date(collaborationDate);
    deadline.setHours(deadline.getHours() + deadlineHours);
    return new Date() > deadline;
  }, []);

  return {
    // Data
    collaborationRequests,
    pendingRequests,
    
    // Loading states
    updatingStatus,
    
    // Actions
    loadCollaborations,
    updateStatus,
    handleStatusUpdate,
    
    // Helpers
    canUpdateStatus,
    getStatusColor,
    getStatusText,
    validateContentDelivery,
    isContentOverdue,
  };
};

export default useCollaborationStatus;