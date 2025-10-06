
// Funciones de limpieza para formulario de empresa
// Estas funciones deben ser agregadas al componente ZyroAppNew.js


    // Función para limpiar todos los datos del formulario de empresa
    const clearCompanyFormData = async () => {
        try {
            console.log('🧹 Limpiando datos del formulario de empresa...');
            
            // Limpiar estado local del formulario
            setRegisterForm({
                email: '',
                password: '',
                fullName: '',
                phone: '',
                birthDate: '',
                city: '',
                instagramUsername: '',
                tiktokUsername: '',
                instagramFollowers: '',
                tiktokFollowers: '',
                userType: 'influencer',
                acceptTerms: false,
                // Company fields - limpiar todos los campos de empresa
                companyName: '',
                cifNif: '',
                companyAddress: '',
                companyPhone: '',
                companyEmail: '',
                representativeName: '',
                representativeEmail: '',
                representativePosition: '',
                businessType: '',
                businessDescription: '',
                website: ''
            });

            // Limpiar estados relacionados con el registro de empresa
            setShowRegister(false);
            setShowUserTypeSelection(false);
            setShowStripeSubscription(false);
            setShowPaymentScreen(false);
            
            // Limpiar datos de pago
            setPaymentData({
                cardNumber: '',
                expiryDate: '',
                cvv: '',
                cardholderName: '',
                bankAccount: '',
                bankCode: '',
                accountHolder: ''
            });

            // Limpiar datos temporales de almacenamiento
            await StorageService.removeData('temp_company_registration');
            await StorageService.removeData('temp_payment_data');
            await StorageService.removeData('company_form_draft');
            
            console.log('✅ Datos del formulario de empresa limpiados correctamente');
            
        } catch (error) {
            console.error('❌ Error limpiando datos del formulario de empresa:', error);
        }
    };

    // Función para resetear completamente el estado de registro de empresa
    const resetCompanyRegistrationState = async () => {
        try {
            console.log('🔄 Reseteando estado completo de registro de empresa...');
            
            // Limpiar formulario
            await clearCompanyFormData();
            
            // Resetear pantalla a inicial
            dispatch(setCurrentScreen('welcome'));
            
            // Limpiar cualquier dato de empresa en progreso
            await StorageService.removeData('company_registration_in_progress');
            await StorageService.removeData('company_payment_session');
            
            console.log('✅ Estado de registro de empresa reseteado completamente');
            
        } catch (error) {
            console.error('❌ Error reseteando estado de registro de empresa:', error);
        }
    };

    // Función de logout mejorada con limpieza completa
    const handleLogoutWithCleanup = async () => {
        try {
            console.log('👋 Cerrando sesión con limpieza completa...');
            
            // Limpiar datos del formulario de empresa
            await clearCompanyFormData();
            
            // Resetear estado de registro
            await resetCompanyRegistrationState();
            
            // Logout normal
            dispatch(logoutUser());
            
            // Limpiar estado de Redux
            dispatch(setCurrentScreen('welcome'));
            dispatch(setActiveTab('home'));
            
            // Limpiar datos temporales adicionales
            await StorageService.removeData('current_user_session');
            await StorageService.removeData('form_auto_save');
            
            console.log('✅ Logout completado con limpieza total');
            
        } catch (error) {
            console.error('❌ Error en logout con limpieza:', error);
            // Fallback a logout normal
            dispatch(logoutUser());
        }
    };



    // Función para inicializar formulario de empresa completamente limpio
    const initializeCleanCompanyForm = () => {
        console.log('🆕 Inicializando formulario de empresa limpio...');
        
        // Asegurar que el formulario esté completamente vacío
        setRegisterForm(prevForm => ({
            ...prevForm,
            userType: 'company', // Solo establecer el tipo de usuario
            // Limpiar todos los campos de empresa
            companyName: '',
            cifNif: '',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            representativeName: '',
            representativeEmail: '',
            representativePosition: '',
            businessType: '',
            businessDescription: '',
            website: '',
            // Limpiar campos generales también
            email: '',
            password: '',
            fullName: '',
            phone: '',
            acceptTerms: false
        }));
        
        console.log('✅ Formulario de empresa inicializado limpio');
    };

    // Función para manejar el botón "Soy empresa" con limpieza previa
    const handleCompanyRegistration = async () => {
        try {
            console.log('🏢 Iniciando registro de empresa con formulario limpio...');
            
            // Limpiar cualquier dato previo
            await clearCompanyFormData();
            
            // Inicializar formulario limpio
            initializeCleanCompanyForm();
            
            // Mostrar formulario de registro
            setShowUserTypeSelection(false);
            setShowRegister(true);
            setShowStripeSubscription(true);
            
            console.log('✅ Registro de empresa iniciado con formulario limpio');
            
        } catch (error) {
            console.error('❌ Error iniciando registro de empresa:', error);
        }
    };


// Para CompanyRegistrationWithStripe.js:

    // Efecto para limpiar formulario al montar el componente
    useEffect(() => {
        console.log('🧹 Limpiando formulario de empresa al iniciar...');
        
        // Resetear datos del formulario
        setCompanyData({
            name: '',
            email: '',
            phone: '',
            address: '',
            selectedPlan: 'basic',
            password: ''
        });
        
        // Resetear errores
        setErrors({});
        
        // Resetear paso actual
        setCurrentStep(1);
        
        console.log('✅ Formulario de empresa limpiado al iniciar');
    }, []); // Solo ejecutar al montar

    // Función para limpiar datos al cancelar o volver
    const handleBackWithCleanup = () => {
        console.log('🔙 Volviendo con limpieza de datos...');
        
        // Limpiar datos del formulario
        setCompanyData({
            name: '',
            email: '',
            phone: '',
            address: '',
            selectedPlan: 'basic',
            password: ''
        });
        
        // Limpiar errores
        setErrors({});
        
        // Volver a la pantalla anterior
        onBack && onBack();
    };


// Instrucciones de implementación:
// 1. Agregar las funciones de limpieza a ZyroAppNew.js
// 2. Modificar el botón "Soy empresa" para usar handleCompanyRegistration
// 3. Modificar la función de logout para usar handleLogoutWithCleanup
// 4. Agregar el useEffect de limpieza a CompanyRegistrationWithStripe.js
// 5. Cambiar onBack por handleBackWithCleanup en CompanyRegistrationWithStripe.js
