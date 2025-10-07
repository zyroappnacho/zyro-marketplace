import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polygon } from 'react-native-svg';

// Sistema de iconos minimalistas y elegantes para ZYRO
// Todos los iconos son vectoriales, sin colores, solo líneas elegantes

const MinimalistIcons = ({ name, size = 24, color = '#888888', strokeWidth = 2, isActive = false }) => {
    const activeColor = isActive ? '#C9A961' : color;
    const activeStrokeWidth = isActive ? 2.5 : strokeWidth;

    const icons = {
        // NAVEGACIÓN PRINCIPAL
        home: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M3 12L12 3L21 12M5 10V20A1 1 0 0 0 6 21H9M19 10V20A1 1 0 0 0 18 21H15M9 21V16A1 1 0 0 1 10 15H14A1 1 0 0 1 15 16V21M9 21H15" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        map: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M9 11A3 3 0 1 0 9 5A3 3 0 0 0 9 11Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M17.657 16.657L13.414 20.9A1.998 1.998 0 0 1 10.586 20.9L6.343 16.657C3.219 13.533 3.219 8.467 6.343 5.343C9.467 2.219 14.533 2.219 17.657 5.343C20.781 8.467 20.781 13.533 17.657 16.657Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        history: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M12 6V12L16 14" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        profile: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Circle 
                    cx="12" 
                    cy="7" 
                    r="4" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
            </Svg>
        ),

        // ICONOS DE FUNCIONALIDAD
        search: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="11" 
                    cy="11" 
                    r="8" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M21 21L16.65 16.65" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        filter: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        location: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M21 10C21 17 12 23 12 23S3 17 3 10A9 9 0 0 1 12 1A9 9 0 0 1 21 10Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Circle 
                    cx="12" 
                    cy="10" 
                    r="3" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
            </Svg>
        ),

        // ICONOS DE COMUNICACIÓN
        chat: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M21 15A2 2 0 0 1 19 17H7L4 20V5A2 2 0 0 1 6 3H19A2 2 0 0 1 21 5V15Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        notification: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M13.73 21A1.999 1.999 0 0 1 10.27 21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        message: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M22 6L12 13L2 6" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        phone: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M22 16.92V19.92A2 2 0 0 1 20.02 21.92C8.91 21.92 0.08 13.09 0.08 2A2 2 0 0 1 2.08 0H5.08A2 2 0 0 1 7.08 2V2C7.08 3.11 7.32 4.16 7.75 5.11L6.79 6.07A1 1 0 0 0 6.79 7.48L16.52 17.21A1 1 0 0 0 17.93 17.21L18.89 16.25C19.84 16.68 20.89 16.92 22 16.92Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONOS DE NEGOCIO
        business: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M3 21H21V9L12 2L3 9V21Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M9 21V12H15V21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        briefcase: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect 
                    x="2" 
                    y="7" 
                    width="20" 
                    height="14" 
                    rx="2" 
                    ry="2" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M16 21V5A2 2 0 0 0 14 3H10A2 2 0 0 0 8 5V21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        target: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="6" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="2" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
            </Svg>
        ),

        // ICONOS DE ESTADÍSTICAS
        chart: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M3 3V21H21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M9 9L12 6L16 10L20 6" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        trending: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M23 6L13.5 15.5L8.5 10.5L1 18" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M17 6H23V12" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        star: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Polygon 
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONOS DE CONFIGURACIÓN
        settings: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="3" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M19.4 15A1.65 1.65 0 0 0 19 14.3L20.25 13.05A1.65 1.65 0 0 0 20.25 10.95L19 9.7A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 21.05 7.35V4.65A1.65 1.65 0 0 0 19.4 3H16.6A1.65 1.65 0 0 0 15 4.65A1.65 1.65 0 0 0 14.3 5L13.05 3.75A1.65 1.65 0 0 0 10.95 3.75L9.7 5A1.65 1.65 0 0 0 9 4.6A1.65 1.65 0 0 0 7.35 2.95H4.65A1.65 1.65 0 0 0 3 4.6V7.4A1.65 1.65 0 0 0 4.65 9A1.65 1.65 0 0 0 5 9.7L3.75 10.95A1.65 1.65 0 0 0 3.75 13.05L5 14.3A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 2.95 16.65V19.35A1.65 1.65 0 0 0 4.6 21H7.4A1.65 1.65 0 0 0 9 19.35A1.65 1.65 0 0 0 9.7 19L10.95 20.25A1.65 1.65 0 0 0 13.05 20.25L14.3 19A1.65 1.65 0 0 0 15 19.4A1.65 1.65 0 0 0 16.65 21.05H19.35A1.65 1.65 0 0 0 21 19.4V16.6A1.65 1.65 0 0 0 19.4 15Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        edit: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M11 4H4A2 2 0 0 0 2 6V20A2 2 0 0 0 4 22H18A2 2 0 0 0 20 20V13" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M18.5 2.5A2.121 2.121 0 0 1 21 5L12 14L8 15L9 11L18.5 2.5Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONOS DE ACCIÓN
        logout: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M16 17L21 12L16 7" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M21 12H9" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        delete: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M3 6H5H21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6M19 6V20A2 2 0 0 1 17 22H7A2 2 0 0 1 5 20V6H19Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        back: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M19 12H5" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M12 19L5 12L12 5" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        close: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Line 
                    x1="18" 
                    y1="6" 
                    x2="6" 
                    y2="18" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
                <Line 
                    x1="6" 
                    y1="6" 
                    x2="18" 
                    y2="18" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
            </Svg>
        ),

        // ICONOS DE REDES SOCIALES
        instagram: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect 
                    x="2" 
                    y="2" 
                    width="20" 
                    height="20" 
                    rx="5" 
                    ry="5" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="4" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Circle 
                    cx="17.5" 
                    cy="6.5" 
                    r="1.5" 
                    fill={activeColor}
                />
            </Svg>
        ),

        tiktok: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M9 12A4 4 0 1 0 13 16V6A5 5 0 0 0 18 1" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONOS DE CATEGORÍAS
        restaurant: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M3 2V7C3 9.21 4.79 11 7 11S11 9.21 11 7V2" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M7 11V22" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M21 2V22" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        mobility: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="7" 
                    cy="17" 
                    r="2" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Circle 
                    cx="17" 
                    cy="17" 
                    r="2" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M5 17H3V12A2 2 0 0 1 5 10H9L11 6H16A2 2 0 0 1 18 8V10H19A2 2 0 0 1 21 12V17H19" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        clothing: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M15 4V2A2 2 0 0 0 13 0H11A2 2 0 0 0 9 2V4" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M6 4L4 6V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V6L18 4H6Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        events: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect 
                    x="3" 
                    y="4" 
                    width="18" 
                    height="18" 
                    rx="2" 
                    ry="2" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Line 
                    x1="16" 
                    y1="2" 
                    x2="16" 
                    y2="6" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
                <Line 
                    x1="8" 
                    y1="2" 
                    x2="8" 
                    y2="6" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
                <Line 
                    x1="3" 
                    y1="10" 
                    x2="21" 
                    y2="10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
            </Svg>
        ),

        delivery: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect 
                    x="1" 
                    y="3" 
                    width="15" 
                    height="13" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Polygon 
                    points="16,3 19,8 19,16 16,16" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Circle 
                    cx="5.5" 
                    cy="18.5" 
                    r="2.5" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Circle 
                    cx="18.5" 
                    cy="18.5" 
                    r="2.5" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
            </Svg>
        ),

        beauty: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        accommodation: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M2 17H22V21H2V17Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M2 17V11A2 2 0 0 1 4 9H20A2 2 0 0 1 22 11V17" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M6 9V5A2 2 0 0 1 8 3H16A2 2 0 0 1 18 5V9" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        nightlife: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M5 12V7A7 7 0 1 1 19 7V12" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M5 12A2 2 0 0 0 7 14H17A2 2 0 0 0 19 12V12A2 2 0 0 0 17 10H7A2 2 0 0 0 5 12V12Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M9 14V18" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M15 14V18" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONOS ADICIONALES
        world: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M2 12H22" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M12 2A15.3 15.3 0 0 1 16 12A15.3 15.3 0 0 1 12 22A15.3 15.3 0 0 1 8 12A15.3 15.3 0 0 1 12 2Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        check: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M20 6L9 17L4 12" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        arrow: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M9 18L15 12L9 6" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONOS DE ADMIN
        admin: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M9 12L11 14L15 10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        campaign: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M3 11L22 2L13 21L11 13L3 11Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        users: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M17 21V19A4 4 0 0 0 13 15H5A4 4 0 0 0 1 19V21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Circle 
                    cx="9" 
                    cy="7" 
                    r="4" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M23 21V19A4 4 0 0 0 16 15.13" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M16 3.13A4 4 0 0 1 16 11.87" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONO DE CATEGORÍAS
        category: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect 
                    x="3" 
                    y="3" 
                    width="7" 
                    height="7" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Rect 
                    x="14" 
                    y="3" 
                    width="7" 
                    height="7" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Rect 
                    x="14" 
                    y="14" 
                    width="7" 
                    height="7" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Rect 
                    x="3" 
                    y="14" 
                    width="7" 
                    height="7" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONO PLUS (AÑADIR)
        plus: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Line 
                    x1="12" 
                    y1="5" 
                    x2="12" 
                    y2="19" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Line 
                    x1="5" 
                    y1="12" 
                    x2="19" 
                    y2="12" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        // ICONOS ADICIONALES PARA COMPLETAR LA APP
        circle: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="8" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
            </Svg>
        ),

        card: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect 
                    x="1" 
                    y="4" 
                    width="22" 
                    height="16" 
                    rx="2" 
                    ry="2" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Line 
                    x1="1" 
                    y1="10" 
                    x2="23" 
                    y2="10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
            </Svg>
        ),

        bank: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M3 21H21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
                <Path 
                    d="M5 21V7L12 4L19 7V21" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M9 9V13" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
                <Path 
                    d="M12 9V13" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
                <Path 
                    d="M15 9V13" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
            </Svg>
        ),

        help: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M9.09 9A3 3 0 0 1 12 6C13.11 6 14.08 6.59 14.65 7.5C15.22 8.41 15.22 9.59 14.65 10.5C14.08 11.41 13.11 12 12 12" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Circle 
                    cx="12" 
                    cy="17" 
                    r="1" 
                    fill={activeColor}
                />
            </Svg>
        ),

        privacy: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect 
                    x="3" 
                    y="11" 
                    width="18" 
                    height="11" 
                    rx="2" 
                    ry="2" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Circle 
                    cx="12" 
                    cy="16" 
                    r="1" 
                    fill={activeColor}
                />
                <Path 
                    d="M7 11V7A5 5 0 0 1 17 7V11" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        security: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M12 22S8 18 8 12V7L12 5L16 7V12C16 18 12 22 12 22Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        support: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth}
                />
                <Path 
                    d="M12 6V12L16 14" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        ),

        terms: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M14 2V8H20" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Line 
                    x1="16" 
                    y1="13" 
                    x2="8" 
                    y2="13" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
                <Line 
                    x1="16" 
                    y1="17" 
                    x2="8" 
                    y2="17" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
                <Line 
                    x1="10" 
                    y1="9" 
                    x2="8" 
                    y2="9" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round"
                />
            </Svg>
        ),

        refresh: (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path 
                    d="M23 4V10H17" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <Path 
                    d="M20.49 15A9 9 0 1 1 5.64 5.64L17 10" 
                    stroke={activeColor} 
                    strokeWidth={activeStrokeWidth} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </Svg>
        )
    };

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {icons[name] || icons.home}
        </View>
    );
};

export default MinimalistIcons;