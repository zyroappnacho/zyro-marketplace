import { BaseRepository } from './BaseRepository';
import { ChatMessage, Conversation, AgreementTemplate, UserRole } from '../../types';

export class ChatRepository extends BaseRepository<any, any, any> {
  constructor() {
    super('conversations'); // Use conversations as the main table
  }

  // Generate a simple ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Conversation methods
  async createConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO conversations (
        id, type, title, related_entity_id, related_entity_type, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        conversation.type,
        conversation.title,
        conversation.relatedEntityId || null,
        conversation.relatedEntityType || null,
        conversation.isActive ? 1 : 0,
        now,
        now
      ]
    );

    // Add participants
    for (const participant of conversation.participants) {
      await this.addParticipantToConversation(id, participant.userId, participant.role, participant.name);
    }

    return id;
  }

  async addParticipantToConversation(conversationId: string, userId: string, role: UserRole, name: string): Promise<void> {
    const participantId = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT OR IGNORE INTO conversation_participants (
        id, conversation_id, user_id, role, name, joined_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [participantId, conversationId, userId, role, name, now]
    );
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    const rows = await this.executeQuery<any>(
      `SELECT DISTINCT c.*, 
        cm.content as last_message_content,
        cm.sender_name as last_message_sender,
        cm.created_at as last_message_date
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN chat_messages cm ON c.id = cm.conversation_id
      LEFT JOIN chat_messages cm2 ON c.id = cm2.conversation_id AND cm.created_at < cm2.created_at
      WHERE cp.user_id = ? AND c.is_active = 1 AND cm2.id IS NULL
      ORDER BY COALESCE(cm.created_at, c.created_at) DESC`,
      [userId]
    );

    const conversations: Conversation[] = [];
    
    for (const row of rows) {
      const participants = await this.getConversationParticipants(row.id);
      const unreadCount = await this.getUnreadCountForUser(row.id, userId);
      
      conversations.push({
        id: row.id,
        type: row.type,
        title: row.title,
        participants,
        relatedEntityId: row.related_entity_id,
        relatedEntityType: row.related_entity_type,
        lastMessage: row.last_message_content ? {
          id: '',
          conversationId: row.id,
          senderId: '',
          senderRole: 'admin' as UserRole,
          senderName: row.last_message_sender,
          type: 'text',
          content: row.last_message_content,
          readBy: [],
          createdAt: new Date(row.last_message_date),
          updatedAt: new Date(row.last_message_date)
        } : undefined,
        unreadCount: { [userId]: unreadCount },
        isActive: row.is_active === 1,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    }

    return conversations;
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const row = await this.executeQueryFirst<any>(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    if (!row) return null;

    const participants = await this.getConversationParticipants(conversationId);
    const unreadCount: { [userId: string]: number } = {};
    
    for (const participant of participants) {
      unreadCount[participant.userId] = await this.getUnreadCountForUser(conversationId, participant.userId);
    }

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      participants,
      relatedEntityId: row.related_entity_id,
      relatedEntityType: row.related_entity_type,
      unreadCount,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async getConversationParticipants(conversationId: string): Promise<Conversation['participants']> {
    const rows = await this.executeQuery<any>(
      'SELECT * FROM conversation_participants WHERE conversation_id = ?',
      [conversationId]
    );

    return rows.map(row => ({
      userId: row.user_id,
      role: row.role,
      name: row.name,
      joinedAt: new Date(row.joined_at)
    }));
  }

  // Message methods
  async createMessage(message: Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt' | 'readBy'>): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO chat_messages (
        id, conversation_id, sender_id, sender_role, sender_name, type, content, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        message.conversationId,
        message.senderId,
        message.senderRole,
        message.senderName,
        message.type,
        message.content,
        message.metadata ? JSON.stringify(message.metadata) : null,
        now,
        now
      ]
    );

    // Mark as read by sender
    await this.markMessageAsRead(id, message.senderId);

    return id;
  }

  async getMessagesByConversationId(conversationId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    const rows = await this.executeQuery<any>(
      `SELECT cm.*, 
        GROUP_CONCAT(mrs.user_id) as read_by_users
      FROM chat_messages cm
      LEFT JOIN message_read_status mrs ON cm.id = mrs.message_id
      WHERE cm.conversation_id = ?
      GROUP BY cm.id
      ORDER BY cm.created_at DESC
      LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );

    return rows.map(row => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderRole: row.sender_role,
      senderName: row.sender_name,
      type: row.type,
      content: row.content,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      readBy: row.read_by_users ? row.read_by_users.split(',') : [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT OR IGNORE INTO message_read_status (id, message_id, user_id, read_at) VALUES (?, ?, ?, ?)`,
      [id, messageId, userId, now]
    );
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const messages = await this.executeQuery<any>(
      'SELECT id FROM chat_messages WHERE conversation_id = ? AND sender_id != ?',
      [conversationId, userId]
    );

    for (const message of messages) {
      await this.markMessageAsRead(message.id, userId);
    }
  }

  async getUnreadCountForUser(conversationId: string, userId: string): Promise<number> {
    const result = await this.executeQueryFirst<any>(
      `SELECT COUNT(*) as count
      FROM chat_messages cm
      LEFT JOIN message_read_status mrs ON cm.id = mrs.message_id AND mrs.user_id = ?
      WHERE cm.conversation_id = ? AND cm.sender_id != ? AND mrs.id IS NULL`,
      [userId, conversationId, userId]
    );

    return result?.count || 0;
  }

  // Agreement template methods
  async createAgreementTemplate(template: Omit<AgreementTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO agreement_templates (
        id, title, content, variables, category, is_active, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        template.title,
        template.content,
        JSON.stringify(template.variables),
        template.category,
        template.isActive ? 1 : 0,
        template.createdBy,
        now,
        now
      ]
    );

    return id;
  }

  async getAgreementTemplates(category?: string, isActive: boolean = true): Promise<AgreementTemplate[]> {
    let query = 'SELECT * FROM agreement_templates WHERE is_active = ?';
    const params: any[] = [isActive ? 1 : 0];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const rows = await this.executeQuery<any>(query, params);

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      variables: JSON.parse(row.variables || '[]'),
      category: row.category,
      isActive: row.is_active === 1,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async getAgreementTemplateById(id: string): Promise<AgreementTemplate | null> {
    const row = await this.executeQueryFirst<any>(
      'SELECT * FROM agreement_templates WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      variables: JSON.parse(row.variables || '[]'),
      category: row.category,
      isActive: row.is_active === 1,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async updateAgreementTemplate(id: string, updates: Partial<AgreementTemplate>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }

    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }

    if (updates.variables !== undefined) {
      fields.push('variables = ?');
      values.push(JSON.stringify(updates.variables));
    }

    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }

    if (updates.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.isActive ? 1 : 0);
    }

    if (fields.length === 0) return;

    values.push(id);

    await this.db.runAsync(
      `UPDATE agreement_templates SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  // Utility methods
  async findOrCreateConversationForCollaboration(collaborationRequestId: string, adminId: string, influencerId: string, companyId: string): Promise<string> {
    // Check if conversation already exists
    const existing = await this.executeQueryFirst<any>(
      'SELECT id FROM conversations WHERE related_entity_id = ? AND related_entity_type = ?',
      [collaborationRequestId, 'collaboration_request']
    );

    if (existing) {
      return existing.id;
    }

    // Get participant names
    const [admin, influencer, company] = await Promise.all([
      this.executeQueryFirst<any>('SELECT a.full_name FROM admins a WHERE a.id = ?', [adminId]),
      this.executeQueryFirst<any>('SELECT i.full_name FROM influencers i WHERE i.id = ?', [influencerId]),
      this.executeQueryFirst<any>('SELECT c.company_name FROM companies c WHERE c.id = ?', [companyId])
    ]);

    // Create new conversation
    const conversationId = await this.createConversation({
      type: 'collaboration',
      title: `Colaboración - ${company?.company_name || 'Empresa'}`,
      participants: [
        { userId: adminId, role: 'admin', name: admin?.full_name || 'Administrador', joinedAt: new Date() },
        { userId: influencerId, role: 'influencer', name: influencer?.full_name || 'Influencer', joinedAt: new Date() },
        { userId: companyId, role: 'company', name: company?.company_name || 'Empresa', joinedAt: new Date() }
      ],
      relatedEntityId: collaborationRequestId,
      relatedEntityType: 'collaboration_request',
      unreadCount: {},
      isActive: true
    });

    return conversationId;
  }
}