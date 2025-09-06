import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { chatService } from '../services/chatService';
import { Conversation } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: (conversationId: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, currentUserId, onPress }) => {
  const unreadCount = conversation.unreadCount[currentUserId] || 0;
  const hasUnread = unreadCount > 0;

  const getConversationIcon = () => {
    switch (conversation.type) {
      case 'collaboration':
        return 'business';
      case 'support':
        return 'help-circle';
      default:
        return 'chatbubbles';
    }
  };

  const formatLastMessageTime = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const getParticipantNames = () => {
    return conversation.participants
      .filter(p => p.userId !== currentUserId)
      .map(p => p.name)
      .join(', ');
  };

  return (
    <TouchableOpacity
      style={[styles.conversationItem, hasUnread && styles.conversationItemUnread]}
      onPress={() => onPress(conversation.id)}
    >
      <View style={styles.conversationIcon}>
        <Ionicons 
          name={getConversationIcon()} 
          size={24} 
          color={hasUnread ? theme.colors.primary : theme.colors.textSecondary} 
        />
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationTitle, hasUnread && styles.conversationTitleUnread]}>
            {conversation.title}
          </Text>
          {conversation.lastMessage && (
            <Text style={styles.conversationTime}>
              {formatLastMessageTime(conversation.lastMessage.createdAt)}
            </Text>
          )}
        </View>
        
        <Text style={styles.conversationParticipants}>
          {getParticipantNames()}
        </Text>
        
        {conversation.lastMessage && (
          <Text style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} numberOfLines={2}>
            {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
          </Text>
        )}
      </View>
      
      {hasUnread && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [currentUser?.id])
  );

  const loadConversations = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const convs = await chatService.getConversationsByUserId(currentUser.id);
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'No se pudieron cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate('Chat' as never, { conversationId } as never);
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      currentUserId={currentUser?.id || ''}
      onPress={handleConversationPress}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No hay conversaciones</Text>
      <Text style={styles.emptyStateText}>
        Las conversaciones aparecerán aquí cuando tengas colaboraciones activas o el administrador inicie una conversación contigo.
      </Text>
    </View>
  );

  if (loading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando conversaciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
        {currentUser?.role === 'admin' && (
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              // Navigate to new chat screen (to be implemented)
              Alert.alert('Próximamente', 'Función de nueva conversación en desarrollo');
            }}
          >
            <Ionicons name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  newChatButton: {
    padding: 8,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  conversationItemUnread: {
    backgroundColor: 'rgba(201, 169, 97, 0.05)',
  },
  conversationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  conversationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
  conversationTitleUnread: {
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  conversationParticipants: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  lastMessageUnread: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});