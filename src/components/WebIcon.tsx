import React from 'react';
import { Text } from 'react-native';

interface WebIconProps {
    name: string;
    size: number;
    color: string;
    style?: any;
}

// Enhanced icon mapping with Material Icons names and emoji fallbacks
const iconMap: { [key: string]: { materialIcon: string; emoji: string } } = {
    'map': { materialIcon: 'map', emoji: '🗺️' },
    'location-on': { materialIcon: 'location_on', emoji: '📍' },
    'refresh': { materialIcon: 'refresh', emoji: '🔄' },
    'filter-list': { materialIcon: 'filter_list', emoji: '🔽' },
    'search': { materialIcon: 'search', emoji: '🔍' },
    'close': { materialIcon: 'close', emoji: '✕' },
    'restaurant': { materialIcon: 'restaurant', emoji: '🍽️' },
    'directions-car': { materialIcon: 'directions_car', emoji: '🚗' },
    'checkroom': { materialIcon: 'checkroom', emoji: '👕' },
    'event': { materialIcon: 'event', emoji: '🎉' },
    'delivery-dining': { materialIcon: 'delivery_dining', emoji: '🚚' },
    'spa': { materialIcon: 'spa', emoji: '💅' },
    'hotel': { materialIcon: 'hotel', emoji: '🏨' },
    'nightlife': { materialIcon: 'nightlife_dining', emoji: '🍸' },
    'place': { materialIcon: 'place', emoji: '📍' },
    'my-location': { materialIcon: 'my_location', emoji: '🎯' },
    'apps': { materialIcon: 'apps', emoji: '⚏' },
    'location-city': { materialIcon: 'location_city', emoji: '🏙️' },
    'people': { materialIcon: 'people', emoji: '👥' },
    'category': { materialIcon: 'category', emoji: '📂' },
    'arrow-forward': { materialIcon: 'arrow_forward', emoji: '→' },
    'check-circle': { materialIcon: 'check_circle', emoji: '✓' },
    'keyboard-arrow-down': { materialIcon: 'keyboard_arrow_down', emoji: '▼' },
    'location-off': { materialIcon: 'location_off', emoji: '🚫' },
};

// Check if Material Icons font is available
const isMaterialIconsAvailable = (): boolean => {
    if (typeof document === 'undefined') return false;
    
    // Create a test element to check if Material Icons font is loaded
    const testElement = document.createElement('span');
    testElement.style.fontFamily = 'Material Icons';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.textContent = 'home';
    document.body.appendChild(testElement);
    
    const width = testElement.offsetWidth;
    document.body.removeChild(testElement);
    
    // If Material Icons is loaded, the width should be different from default font
    return width > 0;
};

export const WebIcon: React.FC<WebIconProps> = ({ name, size, color, style }) => {
    const iconConfig = iconMap[name] || { materialIcon: 'help', emoji: '❓' };
    const useMaterialIcons = isMaterialIconsAvailable();
    
    if (useMaterialIcons) {
        // Use Material Icons font
        return (
            <Text
                style={[
                    {
                        fontFamily: 'Material Icons',
                        fontSize: size,
                        color,
                        lineHeight: size,
                        textAlign: 'center',
                    },
                    style
                ]}
            >
                {iconConfig.materialIcon}
            </Text>
        );
    } else {
        // Fallback to emoji
        return (
            <Text
                style={[
                    {
                        fontSize: size * 0.8, // Emojis are typically larger
                        color,
                        lineHeight: size,
                        textAlign: 'center',
                    },
                    style
                ]}
            >
                {iconConfig.emoji}
            </Text>
        );
    }
};

// Alternative implementation using CSS classes (if you prefer)
export const WebIconCSS: React.FC<WebIconProps> = ({ name, size, color, style }) => {
    const iconConfig = iconMap[name] || { materialIcon: 'help', emoji: '❓' };
    
    return (
        <span
            className="material-icons"
            style={{
                fontSize: size,
                color,
                lineHeight: `${size}px`,
                ...style
            }}
        >
            {iconConfig.materialIcon}
        </span>
    );
};

export default WebIcon;