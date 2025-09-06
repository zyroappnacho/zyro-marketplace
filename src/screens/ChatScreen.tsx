import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { chatService } from '../services/chatService';
import { ChatMessage, Conversation, AgreementTemplate, UserRole } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type ChatScreenRouteProp = RouteProp<{
  Chat: {
    conversationId: string;
  };
}, 'Chat'>;

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  currentUserId: string;
  onMarkAsRead: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, currentUserId, onMarkAsRead }) => {
  useEffect(() => {
    if (!isOwnMessage && !message.readBy.includes(currentUserId)) {
      onMarkAsRead(message.id);
    }
  }, [message.id, isOwnMessage, currentUserId, onMarkAsRead]);

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>{message.content}</Text>;
      case 'agreement_template':
        return (
          <View>
            <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText, styles.templateHeader]}>
              📋 Plantilla de Acuerdo
            </Text>
            <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText, styles.templateContent]}>
              {message.content}
            </Text>
          </View>
        );
      case 'image':
        return (
          <View>
            <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
              🖼️ Imagen enviada
            </Text>
          </View>
        );
      default:
        return <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>{message.content}</Text>;
    }
  };

  return (
    <View style={[styles.messageBubble, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
      {!isOwnMessage && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      {renderMessageContent()}
      <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
        {message.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

export const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { conversationId } = route.params;
  
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<AgreementTemplate[]>([]);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadConversation();
    loadMessages();
    if (currentUser?.role === 'admin') {
      loadTemplates();
    }
  }, [conversationId]);

  useEffect(() => {
    // Mark conversation as read when screen is focused
    if (currentUser?.id) {
      chatService.markConversationAsRead(conversationId, currentUser.id);
    }
  }, [conversationId, currentUser?.id]);

  const loadConversation = async () => {
    try {
      const conv = await chatService.getConversationById(conversationId);
      setConversation(conv);
      
      if (conv) {
        navigation.setOptions({ title: conv.title });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'No se pudo cargar la conversación');
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const msgs = await chatService.getMessagesByConversationId(conversationId, 50, 0);
      setMessages(msgs.reverse()); // Reverse to show newest at bottom
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const temps = await chatService.getAgreementTemplates();
      setTemplates(temps);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || sending) return;

    try {
      setSending(true);
      const messageId = await chatService.sendMessage(
        conversationId,
        currentUser.id,
        currentUser.role,
        getUserDisplayName(currentUser),
        'text',
        newMessage.trim()
      );

      // Add message to local state immediately for better UX
      const newMsg: ChatMessage = {
        id: messageId,
        conversationId,
        senderId: currentUser.id,
        senderRole: currentUser.role,
        senderName: getUserDisplayName(currentUser),
        type: 'text',
        content: newMessage.trim(),
        readBy: [currentUser.id],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const sendTemplate = async (template: AgreementTemplate) => {
    if (!currentUser || sending) return;

    try {
      setSending(true);
      
      // For now, we'll send the template without variable replacement
      // In a full implementation, you'd show a form to fill variables
      const variables: { [key: string]: string } = {};
      template.variables.forEach(variable => {
        variables[variable] = `[${variable}]`; // Placeholder
      });

      await chatService.sendAgreementTemplate(
        conversationId,
        currentUser.id,
        currentUser.role,
        getUserDisplayName(currentUser),
        template.id,
        variables
      );

      setShowTemplates(false);
      loadMessages(); // Reload messages to show the new template message
    } catch (error) {
      console.error('Error sending template:', error);
      Alert.alert('Error', 'No se pudo enviar la plantilla');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    if (!currentUser) return;
    
    try {
      await chatService.markMessageAsRead(messageId, currentUser.id);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

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

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === currentUser?.id;
    return (
      <MessageBubble
        message={item}
        isOwnMessage={isOwnMessage}
        currentUserId={currentUser?.id || ''}
        onMarkAsRead={handleMarkAsRead}
      />
    );
  };

  const renderTemplate = ({ item }: { item: AgreementTemplate }) => (
    <TouchableOpacity
      style={styles.templateItem}
      onPress={() => sendTemplate(item)}
    >
      <Text style={styles.templateTitle}>{item.title}</Text>
      <Text style={styles.templateCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando conversación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={1000}
          />
          
          {currentUser?.role === 'admin' && (
            <TouchableOpacity
              style={styles.templateButton}
              onPress={() => setShowTemplates(true)}
            >
              <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Ionicons name="send" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Plantillas de Acuerdo</Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={templates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id}
            style={styles.templatesList}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
  },
  senderName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 20,
  },
  ownMessageText: {
    color: theme.colors.white,
  },
  templateHeader: {
    fontWeight: '600',
    marginBottom: 8,
  },
  templateContent: {
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  templateButton: {
    padding: 12,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  templatesList: {
    flex: 1,
  },
  templateItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
});