import React, { useState, useEffect } from 'react';
import MinimalistIcons from './MinimalistIcons';
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
    Image,
    Dimensions,
    Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import StorageService from '../services/StorageService';
import CampaignSyncService from '../services/CampaignSyncService';
import GeocodingService from '../services/GeocodingService';
import CitiesService from '../services/CitiesService';
import CategoriesService from '../services/CategoriesService';

const { width, height } = Dimensions.get('window');

const AdminCampaignManager = ({ onBack }) => {
    const dispatch = useDispatch();
    
    // State for campaigns list
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    
    // State for campaign form
    const [campaignForm, setCampaignForm] = useState({
        id: null,
        title: '',
        business: '',
        category: 'restaurantes',
        city: 'Madrid',
        description: '',
        requirements: '',
        companions: '',
        whatIncludes: '',
        contentRequired: '',
        deadline: '',
        address: '',
        phone: '',
        email: '',
        minFollowers: '',
        images: [],
        availableDates: [],
        availableTimes: [],
        status: 'active'
    });
    
    // State for date/time selection
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    
    // State for calendar navigation
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    // State for geocoding
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [geocodingResult, setGeocodingResult] = useState(null);
    
    // State for dynamic categories and cities
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'];

    // Load campaigns, categories and cities on component mount
    useEffect(() => {
        loadCampaigns();
        loadCategoriesAndCities();
    }, []);

    // Load categories and cities from admin configuration
    const loadCategoriesAndCities = async () => {
        try {
            console.log('🔄 [AdminCampaignManager] Cargando categorías y ciudades...');
            
            setIsLoadingCategories(true);
            setIsLoadingCities(true);

            // Load active categories from admin configuration
            const activeCategories = await CategoriesService.getCategoriesAsStringArray();
            console.log('✅ [AdminCampaignManager] Categorías cargadas:', activeCategories);
            setCategories(activeCategories);

            // Load active cities from admin configuration
            const activeCities = await CitiesService.getActiveCityNames();
            console.log('✅ [AdminCampaignManager] Ciudades cargadas:', activeCities);
            setCities(activeCities);

        } catch (error) {
            console.error('❌ [AdminCampaignManager] Error cargando categorías y ciudades:', error);
            
            // Fallback to default values
            setCategories(['restaurantes', 'movilidad', 'ropa', 'eventos', 'delivery', 'salud-belleza', 'alojamiento', 'discotecas']);
            setCities(['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao']);
            
            Alert.alert(
                'Advertencia', 
                'No se pudieron cargar las categorías y ciudades actualizadas. Se usarán los valores por defecto.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoadingCategories(false);
            setIsLoadingCities(false);
        }
    };

    // Auto-save campaigns periodically for extra security
    useEffect(() => {
        if (campaigns.length > 0) {
            const autoSaveInterval = setInterval(async () => {
                try {
                    // Verificar que los datos aún estén en storage
                    const storedCampaigns = await StorageService.getData('admin_campaigns');
                    if (!storedCampaigns || storedCampaigns.length !== campaigns.length) {
                        console.log('🔄 Auto-guardado detectó inconsistencia, restaurando...');
                        await saveCampaigns(campaigns);
                    }
                } catch (error) {
                    console.warn('⚠️ Error en auto-guardado:', error);
                }
            }, 30000); // Auto-save cada 30 segundos

            return () => clearInterval(autoSaveInterval);
        }
    }, [campaigns]);

    const loadCampaigns = async () => {
        try {
            console.log('🔄 Cargando campañas desde almacenamiento persistente...');
            
            // Intentar cargar desde almacenamiento principal
            let storedCampaigns = await StorageService.getData('admin_campaigns');
            
            // Verificar integridad de los datos
            if (storedCampaigns && Array.isArray(storedCampaigns) && storedCampaigns.length > 0) {
                // Validar que cada campaña tenga los campos esenciales
                const validCampaigns = storedCampaigns.filter(campaign => 
                    campaign && 
                    campaign.id && 
                    campaign.title && 
                    campaign.business
                );
                
                if (validCampaigns.length === storedCampaigns.length) {
                    setCampaigns(storedCampaigns);
                    console.log(`✅ ${storedCampaigns.length} campañas cargadas exitosamente`);
                    
                    // Cargar metadata si existe
                    const metadata = await StorageService.getData('admin_campaigns_metadata');
                    if (metadata) {
                        console.log(`📊 Última modificación: ${metadata.lastModified}`);
                    }
                    return;
                } else {
                    console.warn('⚠️ Algunas campañas tienen datos corruptos, intentando recuperar...');
                    setCampaigns(validCampaigns);
                    // Guardar solo las campañas válidas
                    await StorageService.saveData('admin_campaigns', validCampaigns);
                    return;
                }
            }
            
            // Si no hay datos válidos, intentar recuperar desde backup
            console.log('🔄 No se encontraron campañas, intentando recuperar desde backup...');
            const backup = await StorageService.getData('admin_campaigns_backup');
            if (backup && backup.data && Array.isArray(backup.data)) {
                console.log(`🔄 Recuperando ${backup.data.length} campañas desde backup (${backup.timestamp})`);
                setCampaigns(backup.data);
                // Restaurar el backup como datos principales
                await StorageService.saveData('admin_campaigns', backup.data);
                return;
            }
            
            // Si no hay backup, crear datos iniciales
            console.log('🆕 Creando campaña de ejemplo inicial...');
            const mockCampaigns = [
                {
                    id: Date.now(),
                    title: 'Degustación Premium',
                    business: 'Restaurante Elegance',
                    category: 'restaurantes',
                    city: 'Madrid',
                    description: 'Experiencia gastronómica exclusiva con menú degustación de 7 platos.',
                    requirements: 'Min. 10K seguidores IG',
                    companions: '+2 acompañantes',
                    whatIncludes: 'Menú degustación completo para 3 personas, bebidas incluidas',
                    contentRequired: '2 historias Instagram + 1 post en feed',
                    deadline: '72 horas después de la visita',
                    address: 'Calle Serrano 45, Madrid',
                    phone: '+34 91 123 4567',
                    email: 'reservas@elegance.com',
                    images: ['https://via.placeholder.com/400x300/C9A961/000000?text=Restaurante+Elegance'],
                    minFollowers: 10000,
                    estimatedReach: '15K-25K',
                    engagement: '4.2%',
                    availableDates: ['2025-02-01', '2025-02-02', '2025-02-03'],
                    availableTimes: ['19:00', '20:00', '21:00'],
                    status: 'active',
                    coordinates: { latitude: 40.4168, longitude: -3.7038 },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            
            setCampaigns(mockCampaigns);
            await saveCampaigns(mockCampaigns);
            console.log('✅ Campaña de ejemplo creada y guardada');
            
        } catch (error) {
            console.error('❌ Error crítico cargando campañas:', error);
            
            // En caso de error crítico, al menos inicializar con array vacío
            setCampaigns([]);
            Alert.alert(
                'Error de Carga', 
                'Hubo un problema cargando las campañas. Se iniciará con una lista vacía.',
                [{ text: 'OK' }]
            );
        }
    };

    const saveCampaigns = async (updatedCampaigns) => {
        try {
            // Validar que los datos sean válidos antes de guardar
            if (!Array.isArray(updatedCampaigns)) {
                throw new Error('Los datos de campañas no son válidos');
            }

            // Crear backup de los datos actuales antes de guardar
            const currentCampaigns = await StorageService.getData('admin_campaigns');
            if (currentCampaigns) {
                await StorageService.saveData('admin_campaigns_backup', {
                    data: currentCampaigns,
                    timestamp: new Date().toISOString()
                });
            }

            // Guardar las campañas con timestamp de última modificación
            const campaignsWithMetadata = {
                campaigns: updatedCampaigns,
                lastModified: new Date().toISOString(),
                version: '1.0',
                totalCampaigns: updatedCampaigns.length
            };

            // Intentar guardar múltiples veces para asegurar persistencia
            let saveSuccess = false;
            let attempts = 0;
            const maxAttempts = 3;

            while (!saveSuccess && attempts < maxAttempts) {
                attempts++;
                try {
                    await StorageService.saveData('admin_campaigns', updatedCampaigns);
                    await StorageService.saveData('admin_campaigns_metadata', campaignsWithMetadata);
                    
                    // Verificar que se guardó correctamente
                    const savedData = await StorageService.getData('admin_campaigns');
                    if (savedData && savedData.length === updatedCampaigns.length) {
                        saveSuccess = true;
                        console.log(`Campañas guardadas exitosamente en intento ${attempts}`);
                    } else {
                        throw new Error('Verificación de guardado falló');
                    }
                } catch (attemptError) {
                    console.warn(`Intento ${attempts} de guardado falló:`, attemptError);
                    if (attempts === maxAttempts) {
                        throw attemptError;
                    }
                    // Esperar un poco antes del siguiente intento
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Actualizar el estado local solo después de confirmar el guardado
            setCampaigns(updatedCampaigns);
            
            // Las campañas ya están guardadas en 'admin_campaigns' y la app de influencers las lee directamente
            console.log('✅ AdminCampaignManager: Campaigns saved and available for influencers');

            // Log de éxito
            console.log(`✅ ${updatedCampaigns.length} campañas guardadas permanentemente`);
            
        } catch (error) {
            console.error('❌ Error crítico guardando campañas:', error);
            
            // Intentar recuperar desde backup si existe
            try {
                const backup = await StorageService.getData('admin_campaigns_backup');
                if (backup && backup.data) {
                    console.log('Intentando recuperar desde backup...');
                    setCampaigns(backup.data);
                    Alert.alert(
                        'Error de Guardado', 
                        'No se pudieron guardar los cambios. Se han restaurado los datos anteriores.',
                        [{ text: 'OK' }]
                    );
                    return;
                }
            } catch (backupError) {
                console.error('Error recuperando backup:', backupError);
            }
            
            Alert.alert(
                'Error Crítico', 
                'No se pudieron guardar los cambios. Por favor, intenta nuevamente.',
                [{ text: 'OK' }]
            );
            throw error;
        }
    };

    const resetForm = () => {
        setCampaignForm({
            id: null,
            title: '',
            business: '',
            category: categories.length > 0 ? categories[0] : 'restaurantes',
            city: cities.length > 0 ? cities[0] : 'Madrid',
            description: '',
            requirements: '',
            companions: '',
            whatIncludes: '',
            contentRequired: '',
            deadline: '',
            address: '',
            phone: '',
            email: '',
            companyInstagram: '',
            minFollowers: '',
            images: [],
            availableDates: [],
            availableTimes: [],
            status: 'active',
            coordinates: null,
            geocodingResult: null
        });
        setGeocodingResult(null);
    };

    const handleCreateCampaign = () => {
        resetForm();
        setShowCreateForm(true);
    };

    const handleEditCampaign = (campaign) => {
        setCampaignForm({
            ...campaign,
            images: campaign.images || [],
            availableDates: campaign.availableDates || [],
            availableTimes: campaign.availableTimes || []
        });
        setSelectedCampaign(campaign);
        setShowEditForm(true);
    };

    const handleGeocodeAddress = async () => {
        if (!campaignForm.address || campaignForm.address.trim() === '') {
            Alert.alert('Error', 'Por favor ingresa una dirección antes de geocodificar');
            return;
        }

        setIsGeocoding(true);
        setGeocodingResult(null);

        try {
            const formattedAddress = GeocodingService.formatAddressForGeocoding(
                campaignForm.address,
                campaignForm.city
            );

            const result = await GeocodingService.geocodeWithCityFallback(
                formattedAddress,
                campaignForm.city
            );

            setGeocodingResult(result);
            
            // Update campaign form with coordinates
            setCampaignForm({
                ...campaignForm,
                coordinates: {
                    latitude: result.latitude,
                    longitude: result.longitude
                },
                geocodingResult: result
            });

            // Show success message with accuracy info
            let accuracyMessage = '';
            switch (result.accuracy) {
                case 'high':
                    accuracyMessage = 'Ubicación encontrada con alta precisión';
                    break;
                case 'city':
                    accuracyMessage = 'Ubicación aproximada basada en la ciudad';
                    break;
                case 'manual':
                    accuracyMessage = 'Coordenadas extraídas del texto';
                    break;
                default:
                    accuracyMessage = 'Ubicación aproximada';
            }

            Alert.alert(
                'Geocodificación Exitosa',
                `${accuracyMessage}\n\nCoordenadas: ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}\n\nDirección formateada: ${result.formatted_address}`,
                [{ text: 'OK' }]
            );

        } catch (error) {
            Alert.alert('Error de Geocodificación', error.message);
            console.error('Geocoding error:', error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleSaveCampaign = async () => {
        if (!campaignForm.title || !campaignForm.business || !campaignForm.description) {
            Alert.alert('Error', 'Por favor completa los campos obligatorios: título, negocio y descripción');
            return;
        }

        try {
            const updatedCampaigns = [...campaigns];
            
            // Use geocoded coordinates if available, otherwise use default
            const coordinates = campaignForm.coordinates || { latitude: 40.4168, longitude: -3.7038 };
            
            const campaignData = {
                ...campaignForm,
                id: campaignForm.id || Date.now(),
                createdAt: campaignForm.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                coordinates: coordinates,
                geocodingInfo: geocodingResult // Store geocoding metadata
            };

            if (campaignForm.id) {
                // Edit existing campaign
                const index = updatedCampaigns.findIndex(c => c.id === campaignForm.id);
                if (index !== -1) {
                    updatedCampaigns[index] = campaignData;
                }
            } else {
                // Create new campaign
                updatedCampaigns.push(campaignData);
            }

            await saveCampaigns(updatedCampaigns);
            setShowCreateForm(false);
            setShowEditForm(false);
            resetForm();
            setGeocodingResult(null);
            Alert.alert('Éxito', campaignForm.id ? 'Campaña actualizada correctamente' : 'Campaña creada correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la campaña');
        }
    };

    const handleDeleteCampaign = (campaignId) => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que quieres eliminar esta campaña?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
                        await saveCampaigns(updatedCampaigns);
                        Alert.alert('Éxito', 'Campaña eliminada correctamente');
                    }
                }
            ]
        );
    };

    const handleImagePicker = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería para subir imágenes');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => asset.uri);
                setCampaignForm({
                    ...campaignForm,
                    images: [...campaignForm.images, ...newImages]
                });
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las imágenes');
        }
    };

    const removeImage = (index) => {
        const updatedImages = campaignForm.images.filter((_, i) => i !== index);
        setCampaignForm({ ...campaignForm, images: updatedImages });
    };

    const addDate = () => {
        if (selectedDate && !campaignForm.availableDates.includes(selectedDate)) {
            setCampaignForm({
                ...campaignForm,
                availableDates: [...campaignForm.availableDates, selectedDate]
            });
            setSelectedDate('');
        }
    };

    const removeDate = (date) => {
        setCampaignForm({
            ...campaignForm,
            availableDates: campaignForm.availableDates.filter(d => d !== date)
        });
    };

    const addTime = (time) => {
        if (!campaignForm.availableTimes.includes(time)) {
            setCampaignForm({
                ...campaignForm,
                availableTimes: [...campaignForm.availableTimes, time]
            });
        }
    };

    const removeTime = (time) => {
        setCampaignForm({
            ...campaignForm,
            availableTimes: campaignForm.availableTimes.filter(t => t !== time)
        });
    };

    // Calendar functions
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        const day = new Date(year, month, 1).getDay();
        // Convertir domingo (0) a 6, y el resto restar 1 para que lunes sea 0
        return day === 0 ? 6 : day - 1;
    };

    // Función para verificar qué día de la semana es una fecha específica
    const getDayOfWeek = (day, month, year) => {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        // Convertir: domingo (0) -> 6, lunes (1) -> 0, martes (2) -> 1, etc.
        return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    };

    const formatDateString = (day, month, year) => {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
    };

    const isDateSelected = (day, month, year) => {
        const dateString = formatDateString(day, month, year);
        return campaignForm.availableDates.includes(dateString);
    };

    const toggleDate = (day, month, year) => {
        const dateString = formatDateString(day, month, year);
        const currentDates = [...campaignForm.availableDates];
        
        if (currentDates.includes(dateString)) {
            // Remove date
            setCampaignForm({
                ...campaignForm,
                availableDates: currentDates.filter(date => date !== dateString)
            });
        } else {
            // Add date
            setCampaignForm({
                ...campaignForm,
                availableDates: [...currentDates, dateString].sort()
            });
        }
    };

    const navigateMonth = (direction) => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const getMonthName = (month) => {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[month];
    };

    const isPastDate = (day, month, year) => {
        const today = new Date();
        const checkDate = new Date(year, month, day);
        today.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    };

    const selectAllDatesInMonth = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const allDatesInMonth = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            // Solo añadir fechas futuras (no pasadas)
            if (!isPastDate(day, currentMonth, currentYear)) {
                const dateString = formatDateString(day, currentMonth, currentYear);
                allDatesInMonth.push(dateString);
            }
        }
        
        // Combinar con fechas ya seleccionadas de otros meses
        const currentDates = [...campaignForm.availableDates];
        const otherMonthDates = currentDates.filter(date => {
            const [year, month] = date.split('-').map(Number);
            return !(year === currentYear && month === currentMonth + 1);
        });
        
        // Unir fechas de otros meses con todas las fechas del mes actual
        const updatedDates = [...otherMonthDates, ...allDatesInMonth].sort();
        
        setCampaignForm({
            ...campaignForm,
            availableDates: updatedDates
        });
    };

    const deselectAllDatesInMonth = () => {
        // Filtrar para remover solo las fechas del mes actual
        const updatedDates = campaignForm.availableDates.filter(date => {
            const [year, month] = date.split('-').map(Number);
            return !(year === currentYear && month === currentMonth + 1);
        });
        
        setCampaignForm({
            ...campaignForm,
            availableDates: updatedDates
        });
    };

    const isAllMonthSelected = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        let futureDaysCount = 0;
        let selectedFutureDaysCount = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            if (!isPastDate(day, currentMonth, currentYear)) {
                futureDaysCount++;
                const dateString = formatDateString(day, currentMonth, currentYear);
                if (campaignForm.availableDates.includes(dateString)) {
                    selectedFutureDaysCount++;
                }
            }
        }
        
        return futureDaysCount > 0 && selectedFutureDaysCount === futureDaysCount;
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        
        // Crear una matriz de 6 semanas x 7 días (42 celdas total)
        const weeks = [];
        for (let week = 0; week < 6; week++) {
            weeks.push(new Array(7).fill(null));
        }
        
        // Llenar el calendario con los días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = date.getDay();
            // Convertir domingo (0) a posición 6, y el resto restar 1
            const columnIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            
            // Calcular en qué semana debe ir este día
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
            const firstDayWeekday = firstDayOfMonth.getDay();
            const firstDayColumn = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
            
            // Calcular la semana basada en el día del mes y el primer día
            const weekIndex = Math.floor((day - 1 + firstDayColumn) / 7);
            
            if (weekIndex < 6) {
                weeks[weekIndex][columnIndex] = day;
            }
        }
        
        // Convertir la matriz en filas de React
        const calendarRows = [];
        for (let week = 0; week < 6; week++) {
            const weekDays = [];
            
            for (let day = 0; day < 7; day++) {
                const dayNumber = weeks[week][day];
                
                if (dayNumber === null) {
                    // Celda vacía
                    weekDays.push(
                        <View key={`empty-${week}-${day}`} style={styles.calendarDay}>
                            <Text></Text>
                        </View>
                    );
                } else {
                    // Día del mes
                    const isSelected = isDateSelected(dayNumber, currentMonth, currentYear);
                    const isPast = isPastDate(dayNumber, currentMonth, currentYear);
                    
                    weekDays.push(
                        <TouchableOpacity
                            key={`day-${dayNumber}`}
                            style={[
                                styles.calendarDay,
                                isSelected && styles.calendarDaySelected,
                                isPast && styles.calendarDayPast
                            ]}
                            onPress={() => !isPast && toggleDate(dayNumber, currentMonth, currentYear)}
                            disabled={isPast}
                        >
                            <Text style={[
                                styles.calendarDayText,
                                isSelected && styles.calendarDayTextSelected,
                                isPast && styles.calendarDayTextPast
                            ]}>
                                {dayNumber}
                            </Text>
                        </TouchableOpacity>
                    );
                }
            }
            
            // Crear una fila con exactamente 7 días
            calendarRows.push(
                <View key={`week-${week}`} style={styles.calendarWeek}>
                    {weekDays}
                </View>
            );
        }
        
        return calendarRows;
    };

    const renderCampaignForm = () => (
        <Modal
            visible={showCreateForm || showEditForm}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.modalGradient}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => {
                            setShowCreateForm(false);
                            setShowEditForm(false);
                            resetForm();
                        }}>
                            <Text style={styles.cancelButton}>Cancelar</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {showEditForm ? 'Editar Campaña' : 'Nueva Campaña'}
                        </Text>
                        <TouchableOpacity onPress={handleSaveCampaign}>
                            <Text style={styles.saveButton}>Guardar</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        {/* Basic Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Información Básica</Text>
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Título de la campaña *"
                                placeholderTextColor="#666"
                                value={campaignForm.title}
                                onChangeText={(text) => setCampaignForm({...campaignForm, title: text})}
                            />
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre del negocio *"
                                placeholderTextColor="#666"
                                value={campaignForm.business}
                                onChangeText={(text) => setCampaignForm({...campaignForm, business: text})}
                            />
                            
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descripción detallada *"
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={4}
                                value={campaignForm.description}
                                onChangeText={(text) => setCampaignForm({...campaignForm, description: text})}
                            />
                        </View>

                        {/* Category and Location */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Categoría y Ubicación</Text>
                            
                            <View style={styles.pickerContainer}>
                                <View style={styles.pickerHeader}>
                                    <Text style={styles.pickerLabel}>Categoría:</Text>
                                    {isLoadingCategories && (
                                        <Text style={styles.loadingText}>Cargando...</Text>
                                    )}
                                    <TouchableOpacity 
                                        style={styles.refreshButton}
                                        onPress={loadCategoriesAndCities}
                                    >
                                        <MinimalistIcons name="refresh" size={16} color="#C9A961" />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {categories.length > 0 ? (
                                        categories.map(cat => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={[
                                                    styles.categoryButton,
                                                    campaignForm.category === cat && styles.categoryButtonActive
                                                ]}
                                                onPress={() => setCampaignForm({...campaignForm, category: cat})}
                                            >
                                                <Text style={[
                                                    styles.categoryButtonText,
                                                    campaignForm.category === cat && styles.categoryButtonTextActive
                                                ]}>
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View style={styles.emptyStateContainer}>
                                            <Text style={styles.emptyStateText}>
                                                No hay categorías disponibles. Configúralas en el panel de administrador.
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>

                            <View style={styles.pickerContainer}>
                                <View style={styles.pickerHeader}>
                                    <Text style={styles.pickerLabel}>Ciudad:</Text>
                                    {isLoadingCities && (
                                        <Text style={styles.loadingText}>Cargando...</Text>
                                    )}
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {cities.length > 0 ? (
                                        cities.map(city => (
                                            <TouchableOpacity
                                                key={city}
                                                style={[
                                                    styles.categoryButton,
                                                    campaignForm.city === city && styles.categoryButtonActive
                                                ]}
                                                onPress={() => setCampaignForm({...campaignForm, city: city})}
                                            >
                                                <Text style={[
                                                    styles.categoryButtonText,
                                                    campaignForm.city === city && styles.categoryButtonTextActive
                                                ]}>
                                                    {city}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View style={styles.emptyStateContainer}>
                                            <Text style={styles.emptyStateText}>
                                                No hay ciudades disponibles. Configúralas en el panel de administrador.
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Images */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Imágenes del Negocio</Text>
                            
                            <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
                                <Text style={styles.imagePickerText}>📷 Agregar Imágenes</Text>
                            </TouchableOpacity>
                            
                            {campaignForm.images.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                                    {campaignForm.images.map((image, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <Image source={{ uri: image }} style={styles.campaignImage} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => removeImage(index)}
                                            >
                                                <MinimalistIcons name="close" size={24} color={'#888888'} isActive={false} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        {/* Collaboration Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Detalles de la Colaboración</Text>
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Requisitos (ej: Min. 10K seguidores IG)"
                                placeholderTextColor="#666"
                                value={campaignForm.requirements}
                                onChangeText={(text) => setCampaignForm({...campaignForm, requirements: text})}
                            />
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Acompañantes permitidos (ej: +2 acompañantes)"
                                placeholderTextColor="#666"
                                value={campaignForm.companions}
                                onChangeText={(text) => setCampaignForm({...campaignForm, companions: text})}
                            />
                            
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Qué incluye la colaboración"
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={3}
                                value={campaignForm.whatIncludes}
                                onChangeText={(text) => setCampaignForm({...campaignForm, whatIncludes: text})}
                            />
                            
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Contenido requerido (ej: 2 historias IG + 1 post)"
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={3}
                                value={campaignForm.contentRequired}
                                onChangeText={(text) => setCampaignForm({...campaignForm, contentRequired: text})}
                            />
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Fecha límite para entregar contenido"
                                placeholderTextColor="#666"
                                value={campaignForm.deadline}
                                onChangeText={(text) => setCampaignForm({...campaignForm, deadline: text})}
                            />
                        </View>

                        {/* Contact Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Información de Contacto</Text>
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Dirección completa"
                                placeholderTextColor="#666"
                                value={campaignForm.address}
                                onChangeText={(text) => setCampaignForm({...campaignForm, address: text})}
                            />
                            
                            {/* Geocoding Button */}
                            <TouchableOpacity 
                                style={[styles.geocodeButton, isGeocoding && styles.geocodeButtonDisabled]} 
                                onPress={handleGeocodeAddress}
                                disabled={isGeocoding}
                            >
                                <Text style={styles.geocodeButtonText}>
                                    {isGeocoding ? '🔄 Geocodificando...' : '📍 Obtener Coordenadas'}
                                </Text>
                            </TouchableOpacity>
                            
                            {/* Geocoding Result */}
                            {geocodingResult && (
                                <View style={styles.geocodingResult}>
                                    <Text style={styles.geocodingResultTitle}>✅ Ubicación Encontrada</Text>
                                    <Text style={styles.geocodingResultText}>
                                        Coordenadas: {geocodingResult.latitude.toFixed(6)}, {geocodingResult.longitude.toFixed(6)}
                                    </Text>
                                    <Text style={styles.geocodingResultText}>
                                        Precisión: {geocodingResult.accuracy === 'high' ? 'Alta' : 
                                                   geocodingResult.accuracy === 'city' ? 'Ciudad' : 'Aproximada'}
                                    </Text>
                                    {geocodingResult.formatted_address && (
                                        <Text style={styles.geocodingResultAddress} numberOfLines={2}>
                                            {geocodingResult.formatted_address}
                                        </Text>
                                    )}
                                </View>
                            )}
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Teléfono de contacto"
                                placeholderTextColor="#666"
                                value={campaignForm.phone}
                                onChangeText={(text) => setCampaignForm({...campaignForm, phone: text})}
                            />
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Email de contacto"
                                placeholderTextColor="#666"
                                value={campaignForm.email}
                                onChangeText={(text) => setCampaignForm({...campaignForm, email: text})}
                            />
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Instagram de la empresa (ej: @miempresa)"
                                placeholderTextColor="#666"
                                value={campaignForm.companyInstagram}
                                onChangeText={(text) => setCampaignForm({...campaignForm, companyInstagram: text})}
                            />
                        </View>

                        {/* Analytics */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Requisitos de Audiencia</Text>
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Seguidores mínimos requeridos"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={campaignForm.minFollowers.toString()}
                                onChangeText={(text) => setCampaignForm({...campaignForm, minFollowers: parseInt(text) || 0})}
                            />
                        </View>

                        {/* Available Dates */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Fechas Disponibles</Text>
                            <Text style={styles.sectionSubtitle}>Selecciona las fechas en las que estará disponible la colaboración</Text>
                            
                            {/* Calendar Navigation */}
                            <View style={styles.calendarHeader}>
                                <TouchableOpacity 
                                    style={styles.calendarNavButton} 
                                    onPress={() => navigateMonth('prev')}
                                >
                                    <Text style={styles.calendarNavText}>‹</Text>
                                </TouchableOpacity>
                                
                                <Text style={styles.calendarMonthYear}>
                                    {getMonthName(currentMonth)} {currentYear}
                                </Text>
                                
                                <TouchableOpacity 
                                    style={styles.calendarNavButton} 
                                    onPress={() => navigateMonth('next')}
                                >
                                    <MinimalistIcons name="arrow" size={24} color={'#888888'} isActive={false} />
                                </TouchableOpacity>
                            </View>

                            {/* Select All Month Button */}
                            <View style={styles.selectAllContainer}>
                                <TouchableOpacity 
                                    style={[
                                        styles.selectAllButton,
                                        isAllMonthSelected() && styles.selectAllButtonActive
                                    ]} 
                                    onPress={isAllMonthSelected() ? deselectAllDatesInMonth : selectAllDatesInMonth}
                                >
                                    <Text style={[
                                        styles.selectAllButtonText,
                                        isAllMonthSelected() && styles.selectAllButtonTextActive
                                    ]}>
                                        {isAllMonthSelected() ? '✓ Deseleccionar Todo el Mes' : 'Seleccionar Todo el Mes'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Calendar Days Header */}
                            <View style={styles.calendarDaysHeader}>
                                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                                    <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
                                ))}
                            </View>

                            {/* Calendar Grid */}
                            <View style={styles.calendarContainer}>
                                {renderCalendar()}
                            </View>

                            {/* Selected Dates Summary */}
                            {campaignForm.availableDates.length > 0 && (
                                <View style={styles.selectedDatesContainer}>
                                    <Text style={styles.selectedDatesTitle}>
                                        📅 {campaignForm.availableDates.length} fechas seleccionadas
                                    </Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.selectedDatesList}>
                                            {campaignForm.availableDates.map((date, index) => (
                                                <View key={index} style={styles.selectedDateTag}>
                                                    <Text style={styles.selectedDateText}>{date}</Text>
                                                    <TouchableOpacity onPress={() => removeDate(date)}>
                                                        <MinimalistIcons name="close" size={24} color={'#C9A961'} isActive={true} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Available Times */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
                            
                            <View style={styles.timeGrid}>
                                {timeSlots.map(time => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeSlot,
                                            campaignForm.availableTimes.includes(time) && styles.timeSlotActive
                                        ]}
                                        onPress={() => {
                                            if (campaignForm.availableTimes.includes(time)) {
                                                removeTime(time);
                                            } else {
                                                addTime(time);
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.timeSlotText,
                                            campaignForm.availableTimes.includes(time) && styles.timeSlotTextActive
                                        ]}>
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={{ height: 50 }} />
                    </ScrollView>
                </LinearGradient>
            </View>
        </Modal>
    );

    const renderCampaignsList = () => (
        <ScrollView style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Gestión de Campañas</Text>
                    <TouchableOpacity onPress={handleCreateCampaign} style={styles.createButton}>
                        <Text style={styles.createButtonText}>+ Nueva</Text>
                    </TouchableOpacity>
                </View>

                {/* Campaigns List */}
                <View style={styles.campaignsContainer}>
                    <Text style={styles.sectionTitle}>Campañas Activas ({campaigns.length})</Text>
                    
                    {campaigns.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No hay campañas creadas</Text>
                            <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateCampaign}>
                                <Text style={styles.emptyStateButtonText}>Crear Primera Campaña</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={campaigns}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.campaignCard}>
                                    {/* Campaign Image */}
                                    {item.images && item.images.length > 0 && (
                                        <Image source={{ uri: item.images[0] }} style={styles.campaignCardImage} />
                                    )}
                                    
                                    <View style={styles.campaignCardContent}>
                                        <View style={styles.campaignCardHeader}>
                                            <Text style={styles.campaignCardTitle}>{item.title}</Text>
                                            <View style={[styles.statusBadge, styles.statusActive]}>
                                                <Text style={styles.statusText}>{item.status}</Text>
                                            </View>
                                        </View>
                                        
                                        <Text style={styles.campaignCardBusiness}>{item.business}</Text>
                                        <Text style={styles.campaignCardInfo}>{item.category} • {item.city}</Text>
                                        <Text style={styles.campaignCardDescription} numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                        
                                        {item.availableDates && item.availableDates.length > 0 && (
                                            <Text style={styles.campaignCardDates}>
                                                📅 {item.availableDates.length} fechas disponibles
                                            </Text>
                                        )}
                                        
                                        <View style={styles.campaignCardActions}>
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.editButton]}
                                                onPress={() => handleEditCampaign(item)}
                                            >
                                                <Text style={styles.actionButtonText}>Editar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.deleteButton]}
                                                onPress={() => handleDeleteCampaign(item.id)}
                                            >
                                                <Text style={styles.actionButtonText}>Eliminar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </LinearGradient>
        </ScrollView>
    );

    return (
        <>
            {renderCampaignsList()}
            {renderCampaignForm()}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    gradient: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961'
    },
    createButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#C9A961'
    },
    createButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600'
    },
    campaignsContainer: {
        padding: 20
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#C9A961',
        marginBottom: 20
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60
    },
    emptyStateText: {
        color: '#666',
        fontSize: 16,
        marginBottom: 20
    },
    emptyStateButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#C9A961'
    },
    emptyStateButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600'
    },
    campaignCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden'
    },
    campaignCardImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover'
    },
    campaignCardContent: {
        padding: 16
    },
    campaignCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    campaignCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961',
        flex: 1
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusActive: {
        backgroundColor: '#4CAF50'
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },
    campaignCardBusiness: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 4
    },
    campaignCardInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8
    },
    campaignCardDescription: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        marginBottom: 12
    },
    campaignCardDates: {
        fontSize: 12,
        color: '#C9A961',
        marginBottom: 16
    },
    campaignCardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4
    },
    editButton: {
        backgroundColor: '#2196F3'
    },
    deleteButton: {
        backgroundColor: '#F44336'
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    
    // Modal Styles
    modalContainer: {
        flex: 1
    },
    modalGradient: {
        flex: 1
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    cancelButton: {
        color: '#666',
        fontSize: 16
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C9A961'
    },
    saveButton: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: '600'
    },
    formContainer: {
        flex: 1,
        padding: 20
    },
    section: {
        marginBottom: 30
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    pickerContainer: {
        marginBottom: 15
    },
    pickerLabel: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#333',
        marginRight: 10,
        marginBottom: 10
    },
    categoryButtonActive: {
        backgroundColor: '#C9A961'
    },
    categoryButtonText: {
        color: '#fff',
        fontSize: 14
    },
    categoryButtonTextActive: {
        color: '#000'
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    loadingText: {
        color: '#C9A961',
        fontSize: 12,
        fontStyle: 'italic'
    },
    refreshButton: {
        padding: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(201, 169, 97, 0.1)'
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15
    },
    emptyStateText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic'
    },
    imagePickerButton: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15
    },
    imagePickerText: {
        color: '#C9A961',
        fontSize: 16,
        fontWeight: '600'
    },
    imageContainer: {
        marginBottom: 15
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 10
    },
    campaignImage: {
        width: 100,
        height: 100,
        borderRadius: 8
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#F44336',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    removeImageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    addButton: {
        backgroundColor: '#C9A961',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderRadius: 8,
        marginLeft: 10
    },
    addButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600'
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C9A961',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8
    },
    tagText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 6
    },
    tagRemove: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold'
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    timeSlot: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#333',
        marginRight: 10,
        marginBottom: 10
    },
    timeSlotActive: {
        backgroundColor: '#C9A961'
    },
    timeSlotText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },
    timeSlotTextActive: {
        color: '#000'
    },
    
    // Geocoding Styles
    geocodeButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15
    },
    geocodeButtonDisabled: {
        backgroundColor: '#666',
        opacity: 0.6
    },
    geocodeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },
    geocodingResult: {
        backgroundColor: '#1a4d1a',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#4CAF50'
    },
    geocodingResultTitle: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6
    },
    geocodingResultText: {
        color: '#fff',
        fontSize: 12,
        marginBottom: 3
    },
    geocodingResultAddress: {
        color: '#ccc',
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 6
    },
    
    // Calendar Styles
    sectionSubtitle: {
        color: '#666',
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10
    },
    calendarNavButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center'
    },
    calendarNavText: {
        color: '#C9A961',
        fontSize: 24,
        fontWeight: 'bold'
    },
    calendarMonthYear: {
        color: '#C9A961',
        fontSize: 18,
        fontWeight: 'bold'
    },
    calendarDaysHeader: {
        flexDirection: 'row',
        marginBottom: 15
    },
    calendarDayHeader: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        width: '14.285714%'
    },
    calendarContainer: {
        marginBottom: 20
    },
    calendarWeek: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    calendarDay: {
        width: '14.285714%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        margin: 0,
        padding: 0
    },
    calendarDaySelected: {
        backgroundColor: '#C9A961'
    },
    calendarDayPast: {
        opacity: 0.3
    },
    calendarDayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },
    calendarDayTextSelected: {
        color: '#000',
        fontWeight: 'bold'
    },
    calendarDayTextPast: {
        color: '#666'
    },
    selectedDatesContainer: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 8,
        marginTop: 10
    },
    selectedDatesTitle: {
        color: '#C9A961',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10
    },
    selectedDatesList: {
        flexDirection: 'row'
    },
    selectedDateTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C9A961',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 8
    },
    selectedDateText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '600',
        marginRight: 6
    },
    selectedDateRemove: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold'
    },
    
    // Select All Month Button Styles
    selectAllContainer: {
        alignItems: 'center',
        marginBottom: 15
    },
    selectAllButton: {
        backgroundColor: '#333',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#555'
    },
    selectAllButtonActive: {
        backgroundColor: '#C9A961',
        borderColor: '#C9A961'
    },
    selectAllButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center'
    },
    selectAllButtonTextActive: {
        color: '#000'
    }
});

export default AdminCampaignManager;