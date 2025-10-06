import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { setCurrentScreen } from '../store/slices/uiSlice';
import StorageService from '../services/StorageService';

const ForceLogout = ({ children }) => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const forceLogoutAndWelcome = async () => {
            try {
                console.log('🔄 Forzando logout y pantalla de bienvenida...');
                
                // Limpiar Redux
                dispatch(logoutUser());
                dispatch(setCurrentScreen('welcome'));
                
                // Limpiar storage
                await StorageService.clearAll();
                
                console.log('✅ Estado limpiado, mostrando pantalla de bienvenida');
            } catch (error) {
                console.error('❌ Error forzando logout:', error);
                // Aún así ir a welcome
                dispatch(setCurrentScreen('welcome'));
            }
        };
        
        // Ejecutar inmediatamente
        forceLogoutAndWelcome();
    }, [dispatch]);
    
    return children;
};

export default ForceLogout;