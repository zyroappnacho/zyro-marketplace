import { DatabaseService } from '../database/DatabaseService';
import { databaseManager } from '../database/database';
import { CollaborationRequestRepository } from '../database/repositories/CollaborationRequestRepository';
import { chatService } from './chatService';
import { notificationService } from './notificationService';
import { CollaborationStatus } from '../types';

class CollaborationCompletionService {
  private collaborationRepository: CollaborationRequestRepository;

  constructor() {
    this.collaborationRepository = new CollaborationRequestRepository();
  }

  /**
   * Mark a collaboration as completed by the influencer
   */
  async markCollaborationAsCompleted(
    collaborationRequestId: string,
    influencerId: string,
    contentUrls: {
      instagramStories?: string[];
      tiktokVideos?: string[];
    }
  ): Promise<void> {
    try {
      // Get collaboration details
      const collaboration = await this.collaborationRepository.getById(collaborationRequestId);
      if (!collaboration) {
        throw new Error('Colaboración no encontrada');
      }

      if (collaboration.influencerId !== influencerId) {
        throw new Error('No tienes permisos para completar esta colaboración');
      }

      if (collaboration.status !== 'approved') {
        throw new Error('Solo se pueden completar colaboraciones aprobadas');
      }

      // Update collaboration status to completed
      await this.collaborationRepository.update(collaborationRequestId, {
        status: 'completed' as CollaborationStatus,
        contentDelivered: {
          instagramStories: contentUrls.instagramStories || [],
          tiktokVideos: contentUrls.tiktokVideos || [],
          deliveredAt: new Date()
        }
      });

      // Get influencer name for notifications
      const db = databaseManager.getDatabase();
      const influencer = await db.getFirstAsync(
        'SELECT full_name FROM influencers WHERE id = ?',
        [influencerId]
      );

      const influencerName = influencer?.full_name || 'Influencer';

      // Send notification to chat
      await chatService.sendCollaborationCompletionRequest(
        collaborationRequestId,
        influencerId,
        influencerName
      );

      // Get admin and company IDs for notifications
      const campaign = await db.getFirstAsync(
        'SELECT c.company_id, c.created_by FROM campaigns c INNER JOIN collaboration_requests cr ON c.id = cr.campaign_id WHERE cr.id = ?',
        [collaborationRequestId]
      );

      if (campaign) {
        // Notify admin
        await notificationService.sendNotification({
          type: 'collaboration_request',
          recipient: campaign.created_by,
          title: 'Colaboración Completada',
          body: `${influencerName} ha completado la colaboración y subido el contenido`,
          data: { collaborationRequestId, influencerId }
        });

        // Notify company
        await notificationService.sendNotification({
          type: 'collaboration_request',
          recipient: campaign.company_id,
          title: 'Colaboración Completada',
          body: `${influencerName} ha completado la colaboración`,
          data: { collaborationRequestId, influencerId }
        });
      }

    } catch (error) {
      console.error('Error marking collaboration as completed:', error);
      throw error;
    }
  }

  /**
   * Confirm collaboration completion by admin (final approval)
   */
  async confirmCollaborationCompletion(
    collaborationRequestId: string,
    adminId: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      // Get collaboration details
      const collaboration = await this.collaborationRepository.getById(collaborationRequestId);
      if (!collaboration) {
        throw new Error('Colaboración no encontrada');
      }

      if (collaboration.status !== 'completed') {
        throw new Error('La colaboración debe estar marcada como completada por el influencer');
      }

      // Update admin notes if provided
      if (adminNotes) {
        await this.collaborationRepository.update(collaborationRequestId, {
          adminNotes
        });
      }

      // Send confirmation message to chat
      const db = databaseManager.getDatabase();
      const admin = await db.getFirstAsync(
        'SELECT full_name FROM admins WHERE id = ?',
        [adminId]
      );

      const adminName = admin?.full_name || 'Administrador';

      await chatService.sendCollaborationStatusUpdate(
        collaborationRequestId,
        adminId,
        adminName,
        'Completada y Confirmada',
        adminNotes || 'La colaboración ha sido confirmada como completada exitosamente.'
      );

      // Get participants for notifications
      const campaign = await db.getFirstAsync(
        'SELECT c.company_id FROM campaigns c INNER JOIN collaboration_requests cr ON c.id = cr.campaign_id WHERE cr.id = ?',
        [collaborationRequestId]
      );

      const influencer = await db.getFirstAsync(
        'SELECT full_name FROM influencers WHERE id = ?',
        [collaboration.influencerId]
      );

      if (campaign && influencer) {
        // Notify influencer
        await notificationService.sendNotification({
          type: 'approval_status',
          recipient: collaboration.influencerId,
          title: 'Colaboración Confirmada',
          body: 'El administrador ha confirmado que tu colaboración fue completada exitosamente',
          data: { collaborationRequestId, adminId }
        });

        // Notify company
        await notificationService.sendNotification({
          type: 'approval_status',
          recipient: campaign.company_id,
          title: 'Colaboración Confirmada',
          body: `La colaboración con ${influencer.full_name} ha sido confirmada como completada`,
          data: { collaborationRequestId, influencerId: collaboration.influencerId }
        });
      }

    } catch (error) {
      console.error('Error confirming collaboration completion:', error);
      throw error;
    }
  }

  /**
   * Get collaboration completion status
   */
  async getCollaborationCompletionStatus(collaborationRequestId: string): Promise<{
    status: CollaborationStatus;
    contentDelivered?: {
      instagramStories: string[];
      tiktokVideos: string[];
      deliveredAt: Date;
    };
    adminNotes?: string;
    canMarkAsCompleted: boolean;
    canConfirmCompletion: boolean;
  }> {
    try {
      const collaboration = await this.collaborationRepository.getById(collaborationRequestId);
      if (!collaboration) {
        throw new Error('Colaboración no encontrada');
      }

      return {
        status: collaboration.status,
        contentDelivered: collaboration.contentDelivered,
        adminNotes: collaboration.adminNotes,
        canMarkAsCompleted: collaboration.status === 'approved',
        canConfirmCompletion: collaboration.status === 'completed'
      };

    } catch (error) {
      console.error('Error getting collaboration completion status:', error);
      throw error;
    }
  }

  /**
   * Get all completed collaborations pending admin confirmation
   */
  async getCompletedCollaborationsPendingConfirmation(): Promise<any[]> {
    try {
      const db = databaseManager.getDatabase();
      const rows = await db.getAllAsync(`
        SELECT 
          cr.*,
          c.title as campaign_title,
          c.business_name,
          i.full_name as influencer_name,
          comp.company_name
        FROM collaboration_requests cr
        INNER JOIN campaigns c ON cr.campaign_id = c.id
        INNER JOIN influencers i ON cr.influencer_id = i.id
        INNER JOIN companies comp ON c.company_id = comp.id
        WHERE cr.status = 'completed'
        ORDER BY cr.updated_at DESC
      `);

      return rows.map(row => ({
        id: row.id,
        campaignTitle: row.campaign_title,
        businessName: row.business_name,
        influencerName: row.influencer_name,
        companyName: row.company_name,
        requestDate: new Date(row.request_date),
        updatedAt: new Date(row.updated_at),
        contentDelivered: row.content_delivered ? JSON.parse(row.content_delivered) : null,
        adminNotes: row.admin_notes
      }));

    } catch (error) {
      console.error('Error getting completed collaborations:', error);
      throw error;
    }
  }

  /**
   * Send reminder to influencer about pending content delivery
   */
  async sendContentDeliveryReminder(
    collaborationRequestId: string,
    adminId: string
  ): Promise<void> {
    try {
      const collaboration = await this.collaborationRepository.getById(collaborationRequestId);
      if (!collaboration) {
        throw new Error('Colaboración no encontrada');
      }

      if (collaboration.status !== 'approved') {
        throw new Error('Solo se pueden enviar recordatorios para colaboraciones aprobadas');
      }

      const db = databaseManager.getDatabase();
      const admin = await db.getFirstAsync(
        'SELECT full_name FROM admins WHERE id = ?',
        [adminId]
      );

      const adminName = admin?.full_name || 'Administrador';

      // Send reminder message to chat
      await chatService.sendCollaborationStatusUpdate(
        collaborationRequestId,
        adminId,
        adminName,
        'Recordatorio de Contenido',
        'Recordatorio: Por favor sube el contenido comprometido para esta colaboración (2 historias de Instagram o 1 TikTok) dentro del plazo establecido.'
      );

      // Send push notification
      await notificationService.sendNotification({
        type: 'campaign_update',
        recipient: collaboration.influencerId,
        title: 'Recordatorio de Contenido',
        body: 'No olvides subir el contenido comprometido para tu colaboración',
        data: { collaborationRequestId }
      });

    } catch (error) {
      console.error('Error sending content delivery reminder:', error);
      throw error;
    }
  }
}

export const collaborationCompletionService = new CollaborationCompletionService();