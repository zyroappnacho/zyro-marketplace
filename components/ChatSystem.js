import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock chat data
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    participantName: 'Restaurante Elegance',
    participantRole: 'company',
    lastMessage: 'Perfecto, confirmamos tu reserva para mañana a las 20:00',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    unreadCount: 0,
    collaborationTitle: 'Degustación Premium'
  },
  {
    id: 2,
    participantName: 'Ana García',
    participantRole: 'influencer',
    lastMessage: '¡Genial! ¿Necesito llevar algo especial?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 2,
    collaborationTitle: 'Sesión de Fotos'
  }
];

const MOCK_MESSAGES = {
  1: [
    {
      id: 1,
      senderId: 'company_1',
      senderName: 'Restaurante Elegance',
      message: 'Hola Ana, hemos recibido tu solicitud para la degustación premium.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isOwn: false
    },
    {
      id: 2,
      senderId: 'user_1',
      senderName: 'Ana García',
      message: '¡Hola! Muchas gracias por aceptar mi solicitud. Estoy muy emocionada.',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      isOwn: true
    },
    {
      id: 3,
      senderId: 'company_1',
      senderName: 'Restaurante Elegance',
      message: 'Perfecto, confirmamos tu reserva para mañana a las 20:00. ¿Vendrás con 2 acompañantes como indicaste?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isOwn: false
    }
  ]
};

export function ChatList({ currentUser, onConversationSelect }) {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(diff / (1000 * 60))}m`;
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => onConversationSelect(item)}
    >
      <View style={styles.conversationAvatar}>
        <Text style={styles.conversationAvatarText}>
          {item.participantRole === 'company' ? '🏢' : '👤'}
        </Text>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{item.participantName}</Text>
          <Text style={styles.conversationTime}>{formatTime(item.timestamp)}</Text>
        </View>
        
        <Text style={styles.conversationCollaboration}>{item.collaborationTitle}</Text>
        
        <Text style={styles.conversationLastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversation}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export function ChatScreen({ conversation, currentUser, onBack }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES[conversation.id] || []);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response (in real app, this would come from WebSocket/API)
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        senderId: conversation.id,
        senderName: conversation.participantName,
        message: getAutoResponse(newMessage),
        timestamp: new Date(),
        isOwn: false
      };
      setMessages(prev => [...prev, response]);
    }, 1000 + Math.random() * 2000);
  };

  const getAutoResponse = (message) => {
    const responses = [
      'Perfecto, gracias por la información.',
      'Entendido, te confirmo los detalles.',
      'Excelente, quedamos así entonces.',
      'De acuerdo, nos vemos pronto.',
      'Gracias por tu mensaje, te respondo enseguida.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatMessageTime = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isOwn ? styles.ownMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isOwn ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {item.message}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isOwn ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {formatMessageTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{conversation.participantName}</Text>
          <Text style={styles.chatHeaderSubtitle}>{conversation.collaborationTitle}</Text>
        </View>

        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {
            Alert.alert(
              'Información del Chat',
              `Conversación sobre: ${conversation.collaborationTitle}\n\nParticipante: ${conversation.participantName}\nTipo: ${conversation.participantRole === 'company' ? 'Empresa' : 'Influencer'}`,
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity
          style={[styles.sendButton, newMessage.trim() === '' && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={newMessage.trim() === ''}
        >
          <LinearGradient
            colors={newMessage.trim() === '' ? ['#666', '#555'] : ['#C9A961', '#D4AF37']}
            style={styles.sendButtonGradient}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#111',
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C9A961',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationAvatarText: {
    fontSize: 20,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  conversationCollaboration: {
    fontSize: 12,
    color: '#C9A961',
    marginBottom: 4,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  unreadBadge: {
    backgroundColor: '#C9A961',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C9A961',
    backgroundColor: '#111',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: '#C9A961',
    fontSize: 16,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: '#C9A961',
  },
  infoButton: {
    padding: 8,
  },
  infoButtonText: {
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownMessageBubble: {
    backgroundColor: '#C9A961',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#333',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  ownMessageText: {
    color: '#000',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#111',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
});