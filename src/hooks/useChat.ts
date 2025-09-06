import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { Conversation, ChatMessage, UserRole } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useChat = (conversationId?: string) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations for current user
  const loadConversations = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      setError(null);
      const convs = await chatService.getConversationsByUserId(currentUser.id);
      setConversations(convs);
    } catch (err) {
      setError('Error al cargar conversaciones');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Load specific conversation
  const loadConversation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const conv = await chatService.getConversationById(id);
      setCurrentConversation(conv);
    } catch (err) {
      setError('Error al cargar conversación');
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for conversation
  const loadMessages = useCallback(async (id: string, limit: number = 50, offset: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const msgs = await chatService.getMessagesByConversationId(id, limit, offset);
      setMessages(msgs.reverse()); // Show newest at bottom
    } catch (err) {
      setError('Error al cargar mensajes');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a text message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!currentUser || !content.trim()) return null;

    try {
      setSending(true);
      setError(null);
      
      const messageId = await chatService.sendMessage(
        conversationId,
        currentUser.id,
        currentUser.role,
        getUserDisplayName(currentUser),
        'text',
        content.trim()
      );

      // Add message to local state for immediate UI update
      const newMessage: ChatMessage = {
        id: messageId,
        conversationId,
        senderId: currentUser.id,
        senderRole: currentUser.role,
        senderName: getUserDisplayName(currentUser),
        type: 'text',
        content: content.trim(),
        readBy: [currentUser.id],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      return messageId;
    } catch (err) {
      setError('Error al enviar mensaje');
      console.error('Error sending message:', err);
      return null;
    } finally {
      setSending(false);
    }
  }, [currentUser]);

  // Send agreement template
  const sendAgreementTemplate = useCallback(async (
    conversationId: string,
    templateId: string,
    variables: { [key: string]: string }
  ) => {
    if (!currentUser) return null;

    try {
      setSending(true);
      setError(null);
      
      const messageId = await chatService.sendAgreementTemplate(
        conversationId,
        currentUser.id,
        currentUser.role,
        getUserDisplayName(currentUser),
        templateId,
        variables
      );

      // Reload messages to show the template
      await loadMessages(conversationId);
      return messageId;
    } catch (err) {
      setError('Error al enviar plantilla');
      console.error('Error sending template:', err);
      return null;
    } finally {
      setSending(false);
    }
  }, [currentUser, loadMessages]);

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!currentUser?.id) return;

    try {
      await chatService.markConversationAsRead(conversationId, currentUser.id);
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: { ...conv.unreadCount, [currentUser.id]: 0 } }
            : conv
        )
      );
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  }, [currentUser?.id]);

  // Create new conversation
  const createConversation = useCallback(async (
    type: Conversation['type'],
    title: string,
    participants: Array<{ userId: string; role: UserRole; name: string }>,
    relatedEntityId?: string,
    relatedEntityType?: 'campaign' | 'collaboration_request'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const conversationId = await chatService.createConversation(
        type,
        title,
        participants,
        relatedEntityId,
        relatedEntityType
      );

      // Reload conversations
      await loadConversations();
      return conversationId;
    } catch (err) {
      setError('Error al crear conversación');
      console.error('Error creating conversation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadConversations]);

  // Get total unread count for user
  const getTotalUnreadCount = useCallback(() => {
    if (!currentUser?.id) return 0;
    
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[currentUser.id] || 0);
    }, 0);
  }, [conversations, currentUser?.id]);

  // Helper function to get user display name
  const getUserDisplayName = (user: any): string => {
    switch (user.role) {
      case 'admin':
        return user.fullName || 'Administrador';
      case 'influencer':
        return user.fullName || 'Influencer';
      case 'company':
        return user.companyName || 'Empresa';
      default:
        return 'Usuario';
    }
  };

  // Load data on mount
  useEffect(() => {
    if (currentUser?.id) {
      loadConversations();
    }
  }, [currentUser?.id, loadConversations]);

  // Load specific conversation if provided
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
      loadMessages(conversationId);
    }
  }, [conversationId, loadConversation, loadMessages]);

  return {
    // State
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    error,
    
    // Actions
    loadConversations,
    loadConversation,
    loadMessages,
    sendMessage,
    sendAgreementTemplate,
    markConversationAsRead,
    createConversation,
    
    // Computed
    totalUnreadCount: getTotalUnreadCount(),
    
    // Utils
    getUserDisplayName
  };
};