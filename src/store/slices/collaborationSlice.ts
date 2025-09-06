import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CollaborationRequest, CollaborationStatus } from '../../types';
import { CollaborationRequestRepository } from '../../database/repositories/CollaborationRequestRepository';
import { notificationService } from '../../services/notificationService';

// Async thunks for collaboration operations
export const createCollaborationRequest = createAsyncThunk(
  'collaboration/createRequest',
  async (requestData: {
    campaignId: string;
    influencerId: string;
    proposedContent: string;
    reservationDetails?: {
      date: Date;
      time: string;
      companions: number;
      specialRequests?: string;
    };
    deliveryDetails?: {
      address: string;
      phone: string;
      preferredTime?: string;
    };
  }) => {
    const repository = new CollaborationRequestRepository();
    const request = await repository.createRequest({
      ...requestData,
      status: 'pending',
      requestDate: new Date(),
      deliveryDetails: requestData.deliveryDetails ? {
        ...requestData.deliveryDetails,
        preferredTime: requestData.deliveryDetails.preferredTime || '',
      } : undefined,
    });
    
    // Send notification to admin
    await notificationService.sendNotification({
      type: 'collaboration_request',
      recipient: 'admin',
      title: 'Nueva Solicitud de Colaboración',
      body: `Nueva solicitud para la campaña ${requestData.campaignId}`,
      data: { collaborationRequestId: request.id },
    });
    
    return request;
  }
);

export const updateCollaborationStatus = createAsyncThunk(
  'collaboration/updateStatus',
  async ({ requestId, status, adminNotes }: {
    requestId: string;
    status: CollaborationStatus;
    adminNotes?: string;
  }) => {
    const repository = new CollaborationRequestRepository();
    const updatedRequest = await repository.updateStatus(requestId, status, adminNotes);
    
    // Send notification to influencer and company
    const notificationTitle = getStatusNotificationTitle(status);
    const notificationBody = getStatusNotificationBody(status, adminNotes);
    
    await notificationService.sendNotification({
      type: 'approval_status',
      recipient: updatedRequest.influencerId,
      title: notificationTitle,
      body: notificationBody,
      data: { collaborationRequestId: requestId, status },
    });
    
    return updatedRequest;
  }
);

export const submitContentDelivery = createAsyncThunk(
  'collaboration/submitContent',
  async ({ requestId, contentDelivered }: {
    requestId: string;
    contentDelivered: {
      instagramStories: string[];
      tiktokVideos: string[];
    };
  }) => {
    const repository = new CollaborationRequestRepository();
    const updatedRequest = await repository.updateContentDelivery(requestId, {
      ...contentDelivered,
      deliveredAt: new Date(),
    });
    
    // Automatically mark as completed if content is delivered
    if (contentDelivered.instagramStories.length > 0 || contentDelivered.tiktokVideos.length > 0) {
      await repository.updateStatus(requestId, 'completed');
      
      // Send completion notification
      await notificationService.sendNotification({
        type: 'campaign_update',
        recipient: 'admin',
        title: 'Contenido Entregado',
        body: 'Un influencer ha completado su colaboración y entregado el contenido.',
        data: { collaborationRequestId: requestId },
      });
    }
    
    return updatedRequest;
  }
);

export const getCollaborationsByInfluencer = createAsyncThunk(
  'collaboration/getByInfluencer',
  async (influencerId: string) => {
    const repository = new CollaborationRequestRepository();
    return await repository.findByInfluencer(influencerId);
  }
);

export const getCollaborationsByCampaign = createAsyncThunk(
  'collaboration/getByCampaign',
  async (campaignId: string) => {
    const repository = new CollaborationRequestRepository();
    return await repository.findByCampaign(campaignId);
  }
);

export const getPendingCollaborations = createAsyncThunk(
  'collaboration/getPending',
  async () => {
    const repository = new CollaborationRequestRepository();
    return await repository.findByStatus('pending');
  }
);

// Helper functions for notifications
const getStatusNotificationTitle = (status: CollaborationStatus): string => {
  switch (status) {
    case 'approved':
      return '¡Colaboración Aprobada!';
    case 'rejected':
      return 'Colaboración Rechazada';
    case 'completed':
      return 'Colaboración Completada';
    case 'cancelled':
      return 'Colaboración Cancelada';
    default:
      return 'Actualización de Colaboración';
  }
};

const getStatusNotificationBody = (status: CollaborationStatus, adminNotes?: string): string => {
  const baseMessages = {
    approved: 'Tu solicitud de colaboración ha sido aprobada. ¡Prepárate para la experiencia!',
    rejected: 'Tu solicitud de colaboración ha sido rechazada.',
    completed: 'Tu colaboración ha sido marcada como completada. ¡Gracias por tu participación!',
    cancelled: 'Tu colaboración ha sido cancelada.',
  };
  
  const baseMessage = baseMessages[status as keyof typeof baseMessages] || 'Tu colaboración ha sido actualizada.';
  return adminNotes ? `${baseMessage} Nota: ${adminNotes}` : baseMessage;
};

// Collaboration slice
interface CollaborationState {
  requests: CollaborationRequest[];
  currentRequest: CollaborationRequest | null;
  pendingRequests: CollaborationRequest[];
  loading: boolean;
  error: string | null;
  submittingRequest: boolean;
  updatingStatus: boolean;
}

const initialState: CollaborationState = {
  requests: [],
  currentRequest: null,
  pendingRequests: [],
  loading: false,
  error: null,
  submittingRequest: false,
  updatingStatus: false,
};

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRequest: (state, action: PayloadAction<CollaborationRequest | null>) => {
      state.currentRequest = action.payload;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    // Local state updates for real-time UI updates
    updateRequestStatusLocally: (state, action: PayloadAction<{
      requestId: string;
      status: CollaborationStatus;
      adminNotes?: string;
    }>) => {
      const { requestId, status, adminNotes } = action.payload;
      
      // Update in requests array
      const requestIndex = state.requests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        state.requests[requestIndex].status = status;
        if (adminNotes) {
          state.requests[requestIndex].adminNotes = adminNotes;
        }
      }
      
      // Update current request if it matches
      if (state.currentRequest?.id === requestId) {
        state.currentRequest.status = status;
        if (adminNotes) {
          state.currentRequest.adminNotes = adminNotes;
        }
      }
      
      // Remove from pending if status changed
      if (status !== 'pending') {
        state.pendingRequests = state.pendingRequests.filter(req => req.id !== requestId);
      }
    },
  },
  extraReducers: (builder) => {
    // Create collaboration request
    builder
      .addCase(createCollaborationRequest.pending, (state) => {
        state.submittingRequest = true;
        state.error = null;
      })
      .addCase(createCollaborationRequest.fulfilled, (state, action) => {
        state.submittingRequest = false;
        state.requests.push(action.payload);
        state.currentRequest = action.payload;
      })
      .addCase(createCollaborationRequest.rejected, (state, action) => {
        state.submittingRequest = false;
        state.error = action.error.message || 'Error al crear la solicitud de colaboración';
      });

    // Update collaboration status
    builder
      .addCase(updateCollaborationStatus.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(updateCollaborationStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const updatedRequest = action.payload;
        
        // Update in requests array
        const index = state.requests.findIndex(req => req.id === updatedRequest.id);
        if (index !== -1) {
          state.requests[index] = updatedRequest;
        }
        
        // Update current request if it matches
        if (state.currentRequest?.id === updatedRequest.id) {
          state.currentRequest = updatedRequest;
        }
        
        // Update pending requests
        if (updatedRequest.status === 'pending') {
          const pendingIndex = state.pendingRequests.findIndex(req => req.id === updatedRequest.id);
          if (pendingIndex === -1) {
            state.pendingRequests.push(updatedRequest);
          } else {
            state.pendingRequests[pendingIndex] = updatedRequest;
          }
        } else {
          state.pendingRequests = state.pendingRequests.filter(req => req.id !== updatedRequest.id);
        }
      })
      .addCase(updateCollaborationStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.error.message || 'Error al actualizar el estado de la colaboración';
      });

    // Submit content delivery
    builder
      .addCase(submitContentDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitContentDelivery.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRequest = action.payload;
        
        // Update in requests array
        const index = state.requests.findIndex(req => req.id === updatedRequest.id);
        if (index !== -1) {
          state.requests[index] = updatedRequest;
        }
        
        // Update current request if it matches
        if (state.currentRequest?.id === updatedRequest.id) {
          state.currentRequest = updatedRequest;
        }
      })
      .addCase(submitContentDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al entregar el contenido';
      });

    // Get collaborations by influencer
    builder
      .addCase(getCollaborationsByInfluencer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCollaborationsByInfluencer.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(getCollaborationsByInfluencer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las colaboraciones';
      });

    // Get collaborations by campaign
    builder
      .addCase(getCollaborationsByCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCollaborationsByCampaign.fulfilled, (state, action) => {
        state.loading = false;
        // This could be used for campaign-specific views
      })
      .addCase(getCollaborationsByCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las colaboraciones de la campaña';
      });

    // Get pending collaborations
    builder
      .addCase(getPendingCollaborations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingCollaborations.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(getPendingCollaborations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las solicitudes pendientes';
      });
  },
});

export const {
  clearError,
  setCurrentRequest,
  clearCurrentRequest,
  updateRequestStatusLocally,
} = collaborationSlice.actions;

export default collaborationSlice.reducer;

// Selectors
export const selectCollaborationRequests = (state: { collaboration: CollaborationState }) => 
  state.collaboration.requests;

export const selectCurrentRequest = (state: { collaboration: CollaborationState }) => 
  state.collaboration.currentRequest;

export const selectPendingRequests = (state: { collaboration: CollaborationState }) => 
  state.collaboration.pendingRequests;

export const selectCollaborationLoading = (state: { collaboration: CollaborationState }) => 
  state.collaboration.loading;

export const selectCollaborationError = (state: { collaboration: CollaborationState }) => 
  state.collaboration.error;

export const selectSubmittingRequest = (state: { collaboration: CollaborationState }) => 
  state.collaboration.submittingRequest;

export const selectUpdatingStatus = (state: { collaboration: CollaborationState }) => 
  state.collaboration.updatingStatus;

// Helper selectors for filtered data
export const selectCollaborationsByStatus = (status: CollaborationStatus) => 
  (state: { collaboration: CollaborationState }) => 
    state.collaboration.requests.filter(req => req.status === status);

export const selectUpcomingCollaborations = (state: { collaboration: CollaborationState }) => 
  state.collaboration.requests.filter(req => 
    req.status === 'approved' && 
    req.reservationDetails && 
    new Date(req.reservationDetails.date) > new Date()
  );

export const selectPastCollaborations = (state: { collaboration: CollaborationState }) => 
  state.collaboration.requests.filter(req => 
    req.status === 'completed' || 
    (req.reservationDetails && new Date(req.reservationDetails.date) < new Date())
  );

export const selectCancelledCollaborations = (state: { collaboration: CollaborationState }) => 
  state.collaboration.requests.filter(req => 
    req.status === 'cancelled' || req.status === 'rejected'
  );