/**
 * AdminCategoriesManager - Componente para gestión de categorías del administrador
 * Permite añadir, editar, eliminar y gestionar categorías del selector deslizable
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    Modal,
    FlatList,
    Switch,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MinimalistIcons from './MinimalistIcons';
import CategoriesService, { CATEGORIES_EVENTS } from '../services/CategoriesService';
import EventBusService from '../services/EventBusService';

const { width, height } = Dimensions.get('window');

const AdminCategoriesManager = ({ onBack }) => {
    // State para categorías
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    // State para modal de categoría
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryModalMode, setCategoryModalMode] = useState('add'); // 'add' o 'edit'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '' });

    // Cargar datos al montar el componente
    useEffect(() => {
        loadCategoriesData();
        const unsubscribe = setupEventListeners();

        return () => {
            // Cleanup event listeners
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Configurar listeners para sincronización en tiempo real
    const setupEventListeners = () => {
        const unsubscribe = EventBusService.subscribe(CATEGORIES_EVENTS.CATEGORIES_UPDATED, (updatedCategories) => {
            console.log('🏷️ [AdminCategoriesManager] Categorías actualizadas via evento');
            setCategories(updatedCategories);
            loadStats();
        });
        
        // Guardar función de desuscripción para cleanup
        return unsubscribe;
    };

    // Cargar datos de categorías
    const loadCategoriesData = async () => {
        try {
            setIsLoading(true);
            console.log('🏷️ [AdminCategoriesManager] Cargando categorías...');
            
            const categoriesData = await CategoriesService.getAllCategories();
            setCategories(categoriesData);
            
            await loadStats();
            
            console.log('✅ [AdminCategoriesManager] Categorías cargadas:', categoriesData.length);
        } catch (error) {
            console.error('❌ [AdminCategoriesManager] Error cargando categorías:', error);
            Alert.alert('Error', 'No se pudieron cargar las categorías');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar estadísticas
    const loadStats = async () => {
        try {
            const statsData = await CategoriesService.getCategoriesStats();
            setStats(statsData);
        } catch (error) {
            console.error('❌ [AdminCategoriesManager] Error cargando estadísticas:', error);
        }
    };

    // Manejar añadir categoría
    const handleAddCategory = () => {
        setCategoryModalMode('add');
        setSelectedCategory(null);
        setCategoryForm({ name: '' });
        setShowCategoryModal(true);
    };

    // Manejar editar categoría
    const handleEditCategory = (category) => {
        setCategoryModalMode('edit');
        setSelectedCategory(category);
        setCategoryForm({ name: category.name });
        setShowCategoryModal(true);
    };

    // Manejar guardar categoría
    const handleSaveCategory = async () => {
        try {
            if (!categoryForm.name.trim()) {
                Alert.alert('Error', 'El nombre de la categoría es requerido');
                return;
            }

            let result;
            if (categoryModalMode === 'add') {
                result = await CategoriesService.addCategory(categoryForm.name.trim());
            } else {
                result = await CategoriesService.updateCategory(selectedCategory.id, { 
                    name: categoryForm.name.trim() 
                });
            }

            if (result.success) {
                console.log('✅ [AdminCategoriesManager] Categoría guardada exitosamente');
                Alert.alert('Éxito', result.message);
                setShowCategoryModal(false);
                // Los datos se actualizarán automáticamente via eventos
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            console.error('❌ [AdminCategoriesManager] Error guardando categoría:', error);
            Alert.alert('Error', 'No se pudo guardar la categoría');
        }
    };

    // Manejar eliminar categoría
    const handleDeleteCategory = async (category) => {
        try {
            Alert.alert(
                'Eliminar Categoría',
                `¿Estás seguro de que quieres eliminar "${category.name}"?\n\nEsta acción no se puede deshacer y la categoría desaparecerá del selector de influencers.`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: async () => {
                            const result = await CategoriesService.deleteCategory(category.id);
                            if (result.success) {
                                console.log('✅ [AdminCategoriesManager] Categoría eliminada exitosamente');
                                Alert.alert('Éxito', result.message);
                                // Los datos se actualizarán automáticamente via eventos
                            } else {
                                Alert.alert('Error', result.message);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('❌ [AdminCategoriesManager] Error eliminando categoría:', error);
            Alert.alert('Error', 'No se pudo eliminar la categoría');
        }
    };

    // Manejar cambio de estado activo/inactivo
    const handleToggleCategoryStatus = async (category) => {
        try {
            const newStatus = !category.isActive;
            const result = await CategoriesService.toggleCategoryStatus(category.id, newStatus);
            
            if (result.success) {
                console.log('✅ [AdminCategoriesManager] Estado de categoría cambiado exitosamente');
                // Los datos se actualizarán automáticamente via eventos
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            console.error('❌ [AdminCategoriesManager] Error cambiando estado de categoría:', error);
            Alert.alert('Error', 'No se pudo cambiar el estado de la categoría');
        }
    };

    // Manejar resetear a categorías por defecto
    const handleResetToDefault = () => {
        Alert.alert(
            'Resetear Categorías',
            '¿Estás seguro de que quieres resetear todas las categorías a los valores por defecto?\n\nEsto eliminará todas las categorías personalizadas que hayas añadido.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Resetear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await CategoriesService.resetToDefaultCategories();
                            if (result.success) {
                                Alert.alert('Éxito', result.message);
                                // Los datos se actualizarán automáticamente via eventos
                            } else {
                                Alert.alert('Error', result.message);
                            }
                        } catch (error) {
                            console.error('❌ [AdminCategoriesManager] Error reseteando categorías:', error);
                            Alert.alert('Error', 'No se pudo resetear las categorías');
                        }
                    }
                }
            ]
        );
    };

    // Renderizar item de categoría
    const renderCategoryItem = ({ item: category }) => (
        <View style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDate}>
                    Creada: {new Date(category.createdAt).toLocaleDateString()}
                </Text>
                {category.updatedAt && category.updatedAt !== category.createdAt && (
                    <Text style={styles.categoryDate}>
                        Actualizada: {new Date(category.updatedAt).toLocaleDateString()}
                    </Text>
                )}
            </View>
            
            <View style={styles.categoryActions}>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>
                        {category.isActive ? 'Activa' : 'Inactiva'}
                    </Text>
                    <Switch
                        value={category.isActive}
                        onValueChange={() => handleToggleCategoryStatus(category)}
                        trackColor={{ false: '#767577', true: '#4CAF50' }}
                        thumbColor={category.isActive ? '#fff' : '#f4f3f4'}
                    />
                </View>
                
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditCategory(category)}
                    >
                        <MinimalistIcons name="edit" size={16} color="#2196F3" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteCategory(category)}
                    >
                        <MinimalistIcons name="trash" size={16} color="#F44336" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <MinimalistIcons name="back" size={24} color="#C9A961" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Gestión de Categorías</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
                    <MinimalistIcons name="plus" size={24} color="#C9A961" />
                </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.active}</Text>
                    <Text style={styles.statLabel}>Activas</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.inactive}</Text>
                    <Text style={styles.statLabel}>Inactivas</Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    Las categorías activas aparecen en el selector deslizable de los influencers.
                    Los cambios se sincronizan inmediatamente.
                </Text>
            </View>

            {/* Categories List */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Categorías ({categories.length})</Text>
                    <TouchableOpacity 
                        style={styles.resetButton} 
                        onPress={handleResetToDefault}
                    >
                        <Text style={styles.resetButtonText}>Resetear</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Cargando categorías...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.categoriesList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No hay categorías</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Modal para añadir/editar categoría */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {categoryModalMode === 'add' ? 'Añadir Categoría' : 'Editar Categoría'}
                            </Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowCategoryModal(false)}
                            >
                                <MinimalistIcons name="close" size={24} color="#ccc" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <Text style={styles.inputLabel}>Nombre de la categoría</Text>
                            <TextInput
                                style={styles.textInput}
                                value={categoryForm.name}
                                onChangeText={(text) => setCategoryForm({ name: text })}
                                placeholder="Ej: tecnología, deportes, etc."
                                placeholderTextColor="#666"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowCategoryModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveCategory}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {categoryModalMode === 'add' ? 'Añadir' : 'Guardar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    backButton: {
        padding: 8
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#C9A961',
        flex: 1,
        textAlign: 'center'
    },
    addButton: {
        padding: 8,
        backgroundColor: '#2a2a2a',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#C9A961'
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#1a1a1a',
        marginTop: 10,
        marginHorizontal: 20,
        borderRadius: 10
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#2a2a2a',
        marginHorizontal: 5,
        borderRadius: 8
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C9A961'
    },
    statLabel: {
        fontSize: 12,
        color: '#ccc',
        marginTop: 4
    },
    infoContainer: {
        backgroundColor: '#2a2a2a',
        marginHorizontal: 20,
        marginTop: 15,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#C9A961'
    },
    infoText: {
        fontSize: 14,
        color: '#C9A961',
        textAlign: 'center'
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        marginHorizontal: 20,
        marginTop: 15,
        borderRadius: 10,
        padding: 15
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#C9A961'
    },
    resetButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#ff9800',
        borderRadius: 6
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500'
    },
    categoriesList: {
        flex: 1
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        marginBottom: 8
    },
    categoryInfo: {
        flex: 1
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        textTransform: 'capitalize'
    },
    categoryDate: {
        fontSize: 12,
        color: '#ccc',
        marginTop: 2
    },
    categoryActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusContainer: {
        alignItems: 'center',
        marginRight: 15
    },
    statusLabel: {
        fontSize: 12,
        color: '#ccc',
        marginBottom: 4
    },
    actionButtons: {
        flexDirection: 'row'
    },
    editButton: {
        padding: 8,
        marginRight: 8,
        backgroundColor: '#333',
        borderRadius: 6
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#333',
        borderRadius: 6
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        fontSize: 16,
        color: '#ccc'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40
    },
    emptyText: {
        fontSize: 16,
        color: '#ccc'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        width: width * 0.9,
        maxHeight: height * 0.8,
        borderWidth: 1,
        borderColor: '#333'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#C9A961'
    },
    modalCloseButton: {
        padding: 4
    },
    modalContent: {
        padding: 20
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 8
    },
    textInput: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#fff'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        marginRight: 10,
        backgroundColor: '#333',
        borderRadius: 8,
        alignItems: 'center'
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#ccc',
        fontWeight: '500'
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 10,
        backgroundColor: '#C9A961',
        borderRadius: 8,
        alignItems: 'center'
    },
    saveButtonText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500'
    }
});

export default AdminCategoriesManager;