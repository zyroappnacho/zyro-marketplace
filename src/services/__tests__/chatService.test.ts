import { chatService } from '../chatService';
import { DatabaseService } from '../../database/DatabaseService';
import { ChatRepository } from '../../database/repositories/ChatRepository';

// Mock the dependencies
jest.mock('../../database/DatabaseService');
jest.mock('../../database/repositories/ChatRepository');
jest.mock('../notificationService');

describe('ChatService', () => {
  let mockChatRepository: jest.Mocked<ChatRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChatRepository = new ChatRepository() as jest.Mocked<ChatRepository>;
    (chatService as any).chatRepository = mockChatRepository;
  });

  describe('createConversation', () => {
    it('should create a conversation successfully', async () => {
      const mockConversationId = 'conv-123';
      mockChatRepository.createConversation.mockResolvedValue(mockConversationId);

      const participants = [
        { userId: 'user1', role: 'admin' as const, name: 'Admin' },
        { userId: 'user2', role: 'influencer' as const, name: 'Influencer' }
      ];

      const result = await chatService.createConversation(
        'collaboration',
        'Test Conversation',
        participants
      );

      expect(result).toBe(mockConversationId);
      expect(mockChatRepository.createConversation).toHaveBeenCalledWith({
        type: 'collaboration',
        title: 'Test Conversation',
        participants: expect.arrayContaining([
          expect.objectContaining({
            userId: 'user1',
            role: 'admin',
            name: 'Admin'
          })
        ]),
        relatedEntityId: undefined,
        relatedEntityType: undefined,
        unreadCount: {},
        isActive: true
      });
    });
  });

  describe('sendMessage', () => {
    it('should send a text message successfully', async () => {
      const mockMessageId = 'msg-123';
      mockChatRepository.createMessage.mockResolvedValue(mockMessageId);
      
      const mockConversation = {
        id: 'conv-123',
        participants: [
          { userId: 'user1', role: 'admin' as const, name: 'Admin', joinedAt: new Date() },
          { userId: 'user2', role: 'influencer' as const, name: 'Influencer', joinedAt: new Date() }
        ]
      };
      
      jest.spyOn(chatService, 'getConversationById').mockResolvedValue(mockConversation as any);

      const result = await chatService.sendMessage(
        'conv-123',
        'user1',
        'admin',
        'Admin',
        'text',
        'Hello world'
      );

      expect(result).toBe(mockMessageId);
      expect(mockChatRepository.createMessage).toHaveBeenCalledWith({
        conversationId: 'conv-123',
        senderId: 'user1',
        senderRole: 'admin',
        senderName: 'Admin',
        type: 'text',
        content: 'Hello world',
        metadata: undefined
      });
    });
  });

  describe('createAgreementTemplate', () => {
    it('should create an agreement template successfully', async () => {
      const mockTemplateId = 'template-123';
      mockChatRepository.createAgreementTemplate.mockResolvedValue(mockTemplateId);

      const result = await chatService.createAgreementTemplate(
        'Test Template',
        'Template content with {{variable}}',
        ['variable'],
        'collaboration',
        'admin-123'
      );

      expect(result).toBe(mockTemplateId);
      expect(mockChatRepository.createAgreementTemplate).toHaveBeenCalledWith({
        title: 'Test Template',
        content: 'Template content with {{variable}}',
        variables: ['variable'],
        category: 'collaboration',
        isActive: true,
        createdBy: 'admin-123'
      });
    });
  });

  describe('sendAgreementTemplate', () => {
    it('should send an agreement template with variable replacement', async () => {
      const mockTemplate = {
        id: 'template-123',
        title: 'Test Template',
        content: 'Hello {{name}}, welcome to {{company}}!',
        variables: ['name', 'company'],
        category: 'collaboration' as const,
        isActive: true,
        createdBy: 'admin-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockMessageId = 'msg-123';
      
      jest.spyOn(chatService, 'getAgreementTemplateById').mockResolvedValue(mockTemplate);
      jest.spyOn(chatService, 'sendMessage').mockResolvedValue(mockMessageId);

      const result = await chatService.sendAgreementTemplate(
        'conv-123',
        'admin-123',
        'admin',
        'Admin',
        'template-123',
        { name: 'John', company: 'Acme Corp' }
      );

      expect(result).toBe(mockMessageId);
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'conv-123',
        'admin-123',
        'admin',
        'Admin',
        'agreement_template',
        'Hello John, welcome to Acme Corp!',
        {
          templateId: 'template-123',
          originalTemplate: 'Hello {{name}}, welcome to {{company}}!',
          variables: { name: 'John', company: 'Acme Corp' }
        }
      );
    });

    it('should throw error if template not found', async () => {
      jest.spyOn(chatService, 'getAgreementTemplateById').mockResolvedValue(null);

      await expect(
        chatService.sendAgreementTemplate(
          'conv-123',
          'admin-123',
          'admin',
          'Admin',
          'nonexistent-template',
          {}
        )
      ).rejects.toThrow('Plantilla de acuerdo no encontrada');
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark all messages in conversation as read', async () => {
      mockChatRepository.markConversationAsRead.mockResolvedValue();

      await chatService.markConversationAsRead('conv-123', 'user-123');

      expect(mockChatRepository.markConversationAsRead).toHaveBeenCalledWith(
        'conv-123',
        'user-123'
      );
    });
  });

  describe('getConversationsByUserId', () => {
    it('should return conversations for user', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          type: 'collaboration' as const,
          title: 'Conversation 1',
          participants: [],
          unreadCount: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockChatRepository.getConversationsByUserId.mockResolvedValue(mockConversations);

      const result = await chatService.getConversationsByUserId('user-123');

      expect(result).toEqual(mockConversations);
      expect(mockChatRepository.getConversationsByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getMessagesByConversationId', () => {
    it('should return messages for conversation', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-123',
          senderId: 'user-1',
          senderRole: 'admin' as const,
          senderName: 'Admin',
          type: 'text' as const,
          content: 'Hello',
          readBy: ['user-1'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockChatRepository.getMessagesByConversationId.mockResolvedValue(mockMessages);

      const result = await chatService.getMessagesByConversationId('conv-123', 50, 0);

      expect(result).toEqual(mockMessages);
      expect(mockChatRepository.getMessagesByConversationId).toHaveBeenCalledWith(
        'conv-123',
        50,
        0
      );
    });
  });
});