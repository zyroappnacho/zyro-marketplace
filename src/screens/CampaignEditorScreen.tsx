import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  createCampaign,
  updateCampaign,
  clearError,
  CampaignFormData,
  Campaign,
} from '../store/slices/campaignSlice';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { theme } from '../styles/theme';

interface CampaignEditorScreenProps {
  navigation: any;
  route: {
    params?: {
      campaign?: Campaign;
      mode: 'create' | 'edit';
    };
  };
}

interface CategorySelectorProps {
  selectedCategory: Campaign['category'] | '';
  onSelect: (category: Campaign['category']) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelect }) => {
  const categories: { key: Campaign['category']; label: string; emoji: string }[] = [
    { key: 'restaurantes', label: 'Restaurantes', emoji: '🍽️' },
    { key: 'movilidad', label: 'Movilidad', emoji: '🚗' },
    { key: 'ropa', label: 'Ropa', emoji: '👕' },
    { key: 'eventos', label: 'Eventos', emoji: '🎉' },
    { key: 'delivery', label: 'Delivery', emoji: '🛵' },
    { key: 'salud-belleza', label: 'Salud y Belleza', emoji: '💄' },
    { key: 'alojamiento', label: 'Alojamiento', emoji: '🏨' },
    { key: 'discotecas', label: 'Discotecas', emoji: '🎵' },
  ];

  return (
    <View style={styles.categoryContainer}>
      <Text style={styles.sectionLabel}>Categoría *</Text>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryItem,
              selectedCategory === category.key && styles.selectedCategoryItem
            ]}
            onPress={() => onSelect(category.key)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[
              styles.categoryLabel,
              selectedCategory === category.key && styles.selectedCategoryLabel
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface ImageGalleryProps {
  images: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onAddImage, onRemoveImage }) => {
  return (
    <View style={styles.imageGalleryContainer}>
      <Text style={styles.sectionLabel}>Galería de Imágenes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.galleryImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => onRemoveImage(index)}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addImageButton} onPress={onAddImage}>
          <Text style={styles.addImageText}>+</Text>
          <Text style={styles.addImageLabel}>Agregar Imagen</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export const CampaignEditorScreen: React.FC<CampaignEditorScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isCreating, isUpdating, error } = useAppSelector(state => state.campaigns);
  
  const isEditMode = route.params?.mode === 'edit';
  const existingCampaign = route.params?.campaign;

  // Form state
  const [formData, setFormData] = useState<CampaignFormData>({
    title: existingCampaign?.title || '',
    description: existingCampaign?.description || '',
    businessName: existingCampaign?.businessName || '',
    category: existingCampaign?.category || 'restaurantes',
    city: existingCampaign?.city || '',
    address: existingCampaign?.address || '',
    coordinates: existingCampaign?.coordinates,
    images: existingCampaign?.images || [],
    requirements: {
      minInstagramFollowers: existingCampaign?.requirements.minInstagramFollowers || undefined,
      minTiktokFollowers: existingCampaign?.requirements.minTiktokFollowers || undefined,
      maxCompanions: existingCampaign?.requirements.maxCompanions || 1,
    },
    whatIncludes: existingCampaign?.whatIncludes || [''],
    contentRequirements: {
      instagramStories: existingCampaign?.contentRequirements.instagramStories || 2,
      tiktokVideos: existingCampaign?.contentRequirements.tiktokVideos || 0,
      deadline: existingCampaign?.contentRequirements.deadline || 72,
    },
    companyId: existingCampaign?.companyId,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'El nombre del negocio es obligatorio';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    if (formData.requirements.maxCompanions < 0) {
      newErrors.maxCompanions = 'El número de acompañantes no puede ser negativo';
    }

    if (formData.whatIncludes.filter(item => item.trim()).length === 0) {
      newErrors.whatIncludes = 'Debe incluir al menos un elemento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error de Validación', 'Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      if (isEditMode && existingCampaign) {
        await dispatch(updateCampaign({
          id: existingCampaign.id,
          updates: formData,
        }));
        Alert.alert('Éxito', 'Campaña actualizada correctamente');
      } else {
        await dispatch(createCampaign(formData));
        Alert.alert('Éxito', 'Campaña creada correctamente');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const handleAddImage = () => {
    // TODO: Implement image picker
    Alert.alert('Próximamente', 'La funcionalidad de subir imágenes estará disponible pronto');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleAddIncludeItem = () => {
    setFormData({
      ...formData,
      whatIncludes: [...formData.whatIncludes, '']
    });
  };

  const handleUpdateIncludeItem = (index: number, value: string) => {
    const newIncludes = [...formData.whatIncludes];
    newIncludes[index] = value;
    setFormData({ ...formData, whatIncludes: newIncludes });
  };

  const handleRemoveIncludeItem = (index: number) => {
    if (formData.whatIncludes.length > 1) {
      const newIncludes = [...formData.whatIncludes];
      newIncludes.splice(index, 1);
      setFormData({ ...formData, whatIncludes: newIncludes });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancelar</Text>
        </TouchableOpacity>
        <ZyroLogo size="small" />
        <PremiumButton
          title="Guardar"
          onPress={handleSave}
          loading={isCreating || isUpdating}
          size="small"
          style={styles.saveButton}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {isEditMode ? 'Editar Campaña' : 'Crear Nueva Campaña'}
        </Text>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Título de la Campaña *</Text>
            <TextInput
              style={[styles.textInput, errors.title && styles.inputError]}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Ej: Cena Premium en La Terraza"
              placeholderTextColor={theme.colors.textSecondary}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del Negocio *</Text>
            <TextInput
              style={[styles.textInput, errors.businessName && styles.inputError]}
              value={formData.businessName}
              onChangeText={(text) => setFormData({ ...formData, businessName: text })}
              placeholder="Ej: Restaurante La Terraza"
              placeholderTextColor={theme.colors.textSecondary}
            />
            {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción *</Text>
            <TextInput
              style={[styles.textAreaInput, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe la experiencia que ofreces..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <CategorySelector
            selectedCategory={formData.category}
            onSelect={(category) => setFormData({ ...formData, category })}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ciudad *</Text>
            <TextInput
              style={[styles.textInput, errors.city && styles.inputError]}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Ej: Madrid"
              placeholderTextColor={theme.colors.textSecondary}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dirección *</Text>
            <TextInput
              style={[styles.textInput, errors.address && styles.inputError]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Ej: Calle Gran Vía 123, Madrid"
              placeholderTextColor={theme.colors.textSecondary}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <ImageGallery
            images={formData.images}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
          />
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requisitos</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Min. Seguidores IG</Text>
              <TextInput
                style={styles.textInput}
                value={formData.requirements.minInstagramFollowers?.toString() || ''}
                onChangeText={(text) => setFormData({
                  ...formData,
                  requirements: {
                    ...formData.requirements,
                    minInstagramFollowers: text ? parseInt(text) : undefined
                  }
                })}
                placeholder="5000"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Min. Seguidores TikTok</Text>
              <TextInput
                style={styles.textInput}
                value={formData.requirements.minTiktokFollowers?.toString() || ''}
                onChangeText={(text) => setFormData({
                  ...formData,
                  requirements: {
                    ...formData.requirements,
                    minTiktokFollowers: text ? parseInt(text) : undefined
                  }
                })}
                placeholder="10000"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Máximo Acompañantes</Text>
            <TextInput
              style={styles.textInput}
              value={formData.requirements.maxCompanions.toString()}
              onChangeText={(text) => setFormData({
                ...formData,
                requirements: {
                  ...formData.requirements,
                  maxCompanions: parseInt(text) || 0
                }
              })}
              placeholder="2"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* What Includes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qué Incluye</Text>
          {formData.whatIncludes.map((item, index) => (
            <View key={index} style={styles.includeItemContainer}>
              <TextInput
                style={[styles.textInput, styles.includeInput]}
                value={item}
                onChangeText={(text) => handleUpdateIncludeItem(index, text)}
                placeholder="Ej: Cena completa para 2 personas"
                placeholderTextColor={theme.colors.textSecondary}
              />
              {formData.whatIncludes.length > 1 && (
                <TouchableOpacity
                  style={styles.removeIncludeButton}
                  onPress={() => handleRemoveIncludeItem(index)}
                >
                  <Text style={styles.removeIncludeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addIncludeButton} onPress={handleAddIncludeItem}>
            <Text style={styles.addIncludeText}>+ Agregar elemento</Text>
          </TouchableOpacity>
        </View>

        {/* Content Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requisitos de Contenido</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Historias IG</Text>
              <TextInput
                style={styles.textInput}
                value={formData.contentRequirements.instagramStories.toString()}
                onChangeText={(text) => setFormData({
                  ...formData,
                  contentRequirements: {
                    ...formData.contentRequirements,
                    instagramStories: parseInt(text) || 0
                  }
                })}
                placeholder="2"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Videos TikTok</Text>
              <TextInput
                style={styles.textInput}
                value={formData.contentRequirements.tiktokVideos.toString()}
                onChangeText={(text) => setFormData({
                  ...formData,
                  contentRequirements: {
                    ...formData.contentRequirements,
                    tiktokVideos: parseInt(text) || 0
                  }
                })}
                placeholder="1"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Plazo para Publicar (horas)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contentRequirements.deadline.toString()}
              onChangeText={(text) => setFormData({
                ...formData,
                contentRequirements: {
                  ...formData.contentRequirements,
                  deadline: parseInt(text) || 72
                }
              })}
              placeholder="72"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  backButtonText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  saveButton: {
    minWidth: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Cinzel',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontFamily: 'Inter',
    fontSize: 16,
  },
  textAreaInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontFamily: 'Inter',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Category styles
  categoryContainer: {
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 72) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  selectedCategoryItem: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  selectedCategoryLabel: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  // Image gallery styles
  imageGalleryContainer: {
    marginBottom: 16,
  },
  imageGallery: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  addImageText: {
    fontSize: 32,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  addImageLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  // Include items styles
  includeItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  includeInput: {
    flex: 1,
    marginRight: 12,
  },
  removeIncludeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIncludeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addIncludeButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  addIncludeText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  bottomPadding: {
    height: 40,
  },
});

export default CampaignEditorScreen;