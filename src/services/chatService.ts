import { ChatRepository } from '../database/repositories/ChatRepository';
import { DatabaseService } from '../database/DatabaseService';
import { databaseManager } from '../database/database';
import { ChatMessage, Conversation, AgreementTemplate, UserRole, MessageType } from '../types';
import { notificationService } from './notificationService';

class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  // Conversation methods
  async createConversation(
    type: Conversation['type'],
    title: string,
    participants: Array<{ userId: string; role: UserRole; name: string }>,
    relatedEntityId?: string,
    relatedEntityType?: 'campaign' | 'collaboration_request'
  ): Promise<string> {
    const conversationId = await this.chatRepository.createConversation({
      type,
      title,
      participants: participants.map(p => ({ ...p, joinedAt: new Date() })),
      relatedEntityId,
      relatedEntityType,
      unreadCount: {},
      isActive: true
    });

    // Send notification to all participants except the creator
    const creatorId = participants[0]?.userId;
    for (const participant of participants) {
      if (participant.userId !== creatorId) {
        await notificationService.sendNotification({
          type: 'campaign_update',
          recipient: participant.userId,
          title: 'Nueva conversación',
          body: `Se ha creado una nueva conversación: ${title}`,
          data: { conversationId, type }
        });
      }
    }

    return conversationId;
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return await this.chatRepository.getConversationsByUserId(userId);
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    return await this.chatRepository.getConversationById(conversationId);
  }

  async addParticipantToConversation(conversationId: string, userId: string, role: UserRole, name: string): Promise<void> {
    await this.chatRepository.addParticipantToConversation(conversationId, userId, role, name);

    // Notify existing participants
    const conversation = await this.getConversationById(conversationId);
    if (conversation) {
      for (const participant of conversation.participants) {
        if (participant.userId !== userId) {
          await notificationService.sendNotification({
            type: 'campaign_update',
            recipient: participant.userId,
            title: 'Nuevo participante',
            body: `${name} se ha unido a la conversación "${conversation.title}"`,
            data: { conversationId, newParticipantId: userId }
          });
        }
      }
    }
  }

  // Message methods
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderRole: UserRole,
    senderName: string,
    type: MessageType,
    content: string,
    metadata?: any
  ): Promise<string> {
    const messageId = await this.chatRepository.createMessage({
      conversationId,
      senderId,
      senderRole,
      senderName,
      type,
      content,
      metadata
    });

    // Get conversation participants to send notifications
    const conversation = await this.getConversationById(conversationId);
    if (conversation) {
      for (const participant of conversation.participants) {
        if (participant.userId !== senderId) {
          await notificationService.sendNotification({
            type: 'campaign_update',
            recipient: participant.userId,
            title: `Nuevo mensaje de ${senderName}`,
            body: type === 'text' ? content : `${senderName} envió ${type === 'image' ? 'una imagen' : 'una plantilla de acuerdo'}`,
            data: { conversationId, messageId, senderName }
          });
        }
      }
    }

    return messageId;
  }

  async getMessagesByConversationId(conversationId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    return await this.chatRepository.getMessagesByConversationId(conversationId, limit, offset);
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await this.chatRepository.markMessageAsRead(messageId, userId);
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await this.chatRepository.markConversationAsRead(conversationId, userId);
  }

  async getUnreadCountForUser(conversationId: string, userId: string): Promise<number> {
    return await this.chatRepository.getUnreadCountForUser(conversationId, userId);
  }

  // Agreement template methods
  async createAgreementTemplate(
    title: string,
    content: string,
    variables: string[],
    category: AgreementTemplate['category'],
    createdBy: string
  ): Promise<string> {
    return await this.chatRepository.createAgreementTemplate({
      title,
      content,
      variables,
      category,
      isActive: true,
      createdBy
    });
  }

  async getAgreementTemplates(category?: string, isActive: boolean = true): Promise<AgreementTemplate[]> {
    return await this.chatRepository.getAgreementTemplates(category, isActive);
  }

  async getAgreementTemplateById(id: string): Promise<AgreementTemplate | null> {
    return await this.chatRepository.getAgreementTemplateById(id);
  }

  async updateAgreementTemplate(id: string, updates: Partial<AgreementTemplate>): Promise<void> {
    await this.chatRepository.updateAgreementTemplate(id, updates);
  }

  async sendAgreementTemplate(
    conversationId: string,
    senderId: string,
    senderRole: UserRole,
    senderName: string,
    templateId: string,
    variables: { [key: string]: string }
  ): Promise<string> {
    const template = await this.getAgreementTemplateById(templateId);
    if (!template) {
      throw new Error('Plantilla de acuerdo no encontrada');
    }

    // Replace variables in template content
    let processedContent = template.content;
    for (const [key, value] of Object.entries(variables)) {
      processedContent = processedContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return await this.sendMessage(
      conversationId,
      senderId,
      senderRole,
      senderName,
      'agreement_template',
      processedContent,
      {
        templateId,
        originalTemplate: template.content,
        variables
      }
    );
  }

  // Utility methods for collaboration-specific conversations
  async createCollaborationConversation(
    collaborationRequestId: string,
    adminId: string,
    influencerId: string,
    companyId: string
  ): Promise<string> {
    return await this.chatRepository.findOrCreateConversationForCollaboration(
      collaborationRequestId,
      adminId,
      influencerId,
      companyId
    );
  }

  async sendCollaborationStatusUpdate(
    collaborationRequestId: string,
    adminId: string,
    adminName: string,
    status: string,
    notes?: string
  ): Promise<void> {
    // Find the conversation for this collaboration
    const db = databaseManager.getDatabase();
    const conversation = await db.getFirstAsync(
      'SELECT id FROM conversations WHERE related_entity_id = ? AND related_entity_type = ?',
      [collaborationRequestId, 'collaboration_request']
    );

    if (conversation) {
      let message = `Estado de colaboración actualizado: ${status}`;
      if (notes) {
        message += `\n\nNotas del administrador: ${notes}`;
      }

      await this.sendMessage(
        (conversation as any).id,
        adminId,
        'admin',
        adminName,
        'text',
        message
      );
    }
  }

  async sendCollaborationCompletionRequest(
    collaborationRequestId: string,
    influencerId: string,
    influencerName: string
  ): Promise<void> {
    const db = databaseManager.getDatabase();
    const conversation = await db.getFirstAsync(
      'SELECT id FROM conversations WHERE related_entity_id = ? AND related_entity_type = ?',
      [collaborationRequestId, 'collaboration_request']
    );

    if (conversation) {
      await this.sendMessage(
        (conversation as any).id,
        influencerId,
        'influencer',
        influencerName,
        'text',
        'He completado la colaboración y subido el contenido requerido. Por favor, marquen como completada.'
      );
    }
  }

  // Real-time functionality (to be implemented with WebSocket or similar)
  async subscribeToConversation(conversationId: string, userId: string, callback: (message: ChatMessage) => void): Promise<void> {
    // This would be implemented with WebSocket or Server-Sent Events
    // For now, we'll just store the callback for future use
    console.log(`User ${userId} subscribed to conversation ${conversationId}`);
  }

  async unsubscribeFromConversation(conversationId: string, userId: string): Promise<void> {
    // This would be implemented with WebSocket or Server-Sent Events
    console.log(`User ${userId} unsubscribed from conversation ${conversationId}`);
  }
}

export const chatService = new ChatService();