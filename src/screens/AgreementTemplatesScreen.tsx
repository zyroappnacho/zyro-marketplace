import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { chatService } from '../services/chatService';
import { AgreementTemplate } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PremiumButton } from '../components/PremiumButton';

interface TemplateItemProps {
  template: AgreementTemplate;
  onEdit: (template: AgreementTemplate) => void;
  onToggleActive: (template: AgreementTemplate) => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onEdit, onToggleActive }) => {
  return (
    <View style={[styles.templateItem, !template.isActive && styles.templateItemInactive]}>
      <View style={styles.templateHeader}>
        <View style={styles.templateInfo}>
          <Text style={[styles.templateTitle, !template.isActive && styles.templateTitleInactive]}>
            {template.title}
          </Text>
          <Text style={styles.templateCategory}>
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
          </Text>
        </View>
        
        <View style={styles.templateActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onToggleActive(template)}
          >
            <Ionicons 
              name={template.isActive ? 'eye' : 'eye-off'} 
              size={20} 
              color={template.isActive ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(template)}
          >
            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.templatePreview} numberOfLines={3}>
        {template.content}
      </Text>
      
      {template.variables.length > 0 && (
        <View style={styles.variablesContainer}>
          <Text style={styles.variablesLabel}>Variables:</Text>
          <Text style={styles.variablesList}>
            {template.variables.map(v => `{{${v}}}`).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
};

export const AgreementTemplatesScreen: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [templates, setTemplates] = useState<AgreementTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AgreementTemplate | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<AgreementTemplate['category']>('collaboration');
  const [formVariables, setFormVariables] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const temps = await chatService.getAgreementTemplates(undefined, false); // Load all templates
      setTemplates(temps);
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'No se pudieron cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('collaboration');
    setFormVariables('');
    setShowModal(true);
  };

  const handleEditTemplate = (template: AgreementTemplate) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormContent(template.content);
    setFormCategory(template.category);
    setFormVariables(template.variables.join(', '));
    setShowModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!formTitle.trim() || !formContent.trim() || !currentUser?.id) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const variables = formVariables
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      if (editingTemplate) {
        // Update existing template
        await chatService.updateAgreementTemplate(editingTemplate.id, {
          title: formTitle.trim(),
          content: formContent.trim(),
          category: formCategory,
          variables
        });
      } else {
        // Create new template
        await chatService.createAgreementTemplate(
          formTitle.trim(),
          formContent.trim(),
          variables,
          formCategory,
          currentUser.id
        );
      }

      setShowModal(false);
      loadTemplates();
      Alert.alert('Éxito', editingTemplate ? 'Plantilla actualizada' : 'Plantilla creada');
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert('Error', 'No se pudo guardar la plantilla');
    }
  };

  const handleToggleActive = async (template: AgreementTemplate) => {
    try {
      await chatService.updateAgreementTemplate(template.id, {
        isActive: !template.isActive
      });
      loadTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      Alert.alert('Error', 'No se pudo actualizar la plantilla');
    }
  };

  const renderTemplate = ({ item }: { item: AgreementTemplate }) => (
    <TemplateItem
      template={item}
      onEdit={handleEditTemplate}
      onToggleActive={handleToggleActive}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No hay plantillas</Text>
      <Text style={styles.emptyStateText}>
        Crea plantillas de acuerdo para usar en las conversaciones con influencers y empresas.
      </Text>
      <PremiumButton
        title="Crear Primera Plantilla"
        onPress={handleCreateTemplate}
        style={styles.emptyStateButton}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando plantillas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plantillas de Acuerdo</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateTemplate}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.id}
        style={styles.templatesList}
        contentContainerStyle={templates.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Template Editor Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </Text>
            <TouchableOpacity onPress={handleSaveTemplate}>
              <Text style={styles.modalSaveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título *</Text>
              <TextInput
                style={styles.formInput}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="Ej: Acuerdo de Colaboración Restaurante"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoría *</Text>
              <View style={styles.categoryButtons}>
                {(['collaboration', 'general', 'cancellation'] as const).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formCategory === category && styles.categoryButtonActive
                    ]}
                    onPress={() => setFormCategory(category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formCategory === category && styles.categoryButtonTextActive
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Variables</Text>
              <TextInput
                style={styles.formInput}
                value={formVariables}
                onChangeText={setFormVariables}
                placeholder="Ej: nombre_influencer, nombre_empresa, fecha"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Text style={styles.formHelp}>
                Separa las variables con comas. Se usarán como {'{{variable}}'} en el contenido.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contenido *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={formContent}
                onChangeText={setFormContent}
                placeholder="Escribe el contenido de la plantilla aquí..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
              <Text style={styles.formHelp}>
                Usa {'{{variable}}'} para insertar variables dinámicas en el texto.
              </Text>
            </View>
          </ScrollView>
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
  addButton: {
    padding: 8,
  },
  templatesList: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  templateItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  templateItemInactive: {
    opacity: 0.6,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  templateTitleInactive: {
    color: theme.colors.textSecondary,
  },
  templateCategory: {
    fontSize: 12,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  templateActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  templatePreview: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  variablesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variablesLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginRight: 8,
  },
  variablesList: {
    fontSize: 12,
    color: theme.colors.primary,
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
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalCancelButton: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  modalSaveButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  formHelp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  categoryButtonTextActive: {
    color: theme.colors.white,
  },
});