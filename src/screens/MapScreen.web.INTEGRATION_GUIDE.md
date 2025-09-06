# Map Integration Guide for Web

## Quick Start: Adding Real Map Functionality

### Option 1: Google Maps (Recommended)

#### 1. Install Dependencies
```bash
npm install @googlemaps/js-api-loader
npm install @types/google.maps
```

#### 2. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Create API key with proper restrictions
4. Add to environment variables

#### 3. Replace Map Placeholder
```typescript
import { Loader } from '@googlemaps/js-api-loader';

const initializeMap = async () => {
    const loader = new Loader({
        apiKey: process.env.GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
        libraries: ['places', 'geometry']
    });

    const google = await loader.load();
    const map = new google.maps.Map(mapContainerRef.current!, {
        center: { lat: 40.4637, lng: -3.7492 }, // Madrid
        zoom: 6,
        styles: customMapStyle, // Dark theme
    });

    // Add markers for campaigns
    filteredCampaigns.forEach(campaign => {
        const marker = new google.maps.Marker({
            position: {
                lat: campaign.coordinates.lat,
                lng: campaign.coordinates.lng
            },
            map,
            title: campaign.businessName,
            icon: {
                url: getCustomMarkerIcon(campaign.category),
                scaledSize: new google.maps.Size(40, 40)
            }
        });

        marker.addListener('click', () => {
            handleCampaignSelect(campaign);
        });
    });
};
```

### Option 2: Leaflet (Free Alternative)

#### 1. Install Dependencies
```bash
npm install leaflet react-leaflet
npm install @types/leaflet
```

#### 2. Add CSS Import
```typescript
import 'leaflet/dist/leaflet.css';
```

#### 3. Replace Map Placeholder
```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customIcon = (category: string) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${getCategoryColor(category)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        ${getCategoryIcon(category)}
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const LeafletMap = () => (
    <MapContainer
        center={[40.4637, -3.7492]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
    >
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
        />
        {filteredCampaigns.map(campaign => (
            <Marker
                key={campaign.id}
                position={[campaign.coordinates.lat, campaign.coordinates.lng]}
                icon={customIcon(campaign.category)}
                eventHandlers={{
                    click: () => handleCampaignSelect(campaign)
                }}
            >
                <Popup>
                    <div>
                        <h3>{campaign.businessName}</h3>
                        <p>{campaign.title}</p>
                    </div>
                </Popup>
            </Marker>
        ))}
    </MapContainer>
);
```

## Implementation Steps

### 1. Update MapScreen.web.tsx
Replace the `renderMapPlaceholder()` function with actual map component:

```typescript
const renderMap = () => {
    if (typeof window === 'undefined') {
        return renderMapPlaceholder(); // SSR fallback
    }
    
    return (
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}>
            {/* Your chosen map implementation */}
        </div>
    );
};
```

### 2. Add Map Controls
```typescript
const MapControls = () => (
    <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
    }}>
        <button onClick={resetToSpain}>🎯</button>
        <button onClick={toggleMapType}>🗺️</button>
        <button onClick={toggleClustering}>📍</button>
    </div>
);
```

### 3. Add Clustering (Google Maps)
```bash
npm install @googlemaps/markerclusterer
```

```typescript
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const clusterer = new MarkerClusterer({
    map,
    markers,
    renderer: {
        render: ({ count, position }) => {
            return new google.maps.Marker({
                position,
                icon: {
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                            <circle cx="20" cy="20" r="18" fill="${colors.goldElegant}" stroke="white" stroke-width="2"/>
                            <text x="20" y="25" text-anchor="middle" fill="black" font-size="12" font-weight="bold">
                                ${count > 99 ? '99+' : count}
                            </text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40)
                }
            });
        }
    }
});
```

### 4. Add Environment Variables
```env
# .env.local
GOOGLE_MAPS_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 5. Update Package.json Scripts
```json
{
    "scripts": {
        "web:dev": "expo start --web",
        "web:build": "expo build:web",
        "web:serve": "npx serve web-build"
    }
}
```

## Advanced Features

### Geolocation
```typescript
const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation);
                map.setZoom(12);
            },
            (error) => {
                console.warn('Geolocation error:', error);
            }
        );
    }
};
```

### Search Integration
```typescript
const initializeSearchBox = () => {
    const searchBox = new google.maps.places.SearchBox(searchInputRef.current!);
    
    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry?.location) {
                map.setCenter(place.geometry.location);
                map.setZoom(14);
            }
        }
    });
};
```

### Custom Map Styles (Dark Theme)
```typescript
const customMapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#1d2c4d" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8ec3b9" }]
    },
    // ... more styles (use existing mapStyle from MapScreen.tsx)
];
```

## Testing

### Unit Tests
```typescript
// MapScreen.web.test.tsx
import { render, screen } from '@testing-library/react';
import MapScreen from './MapScreen.web';

// Mock Google Maps
global.google = {
    maps: {
        Map: jest.fn(),
        Marker: jest.fn(),
        // ... other mocks
    }
};

test('renders map container', () => {
    render(<MapScreen />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
});
```

### E2E Tests
```typescript
// cypress/integration/map.spec.ts
describe('Map Screen', () => {
    it('should load and display campaigns', () => {
        cy.visit('/map');
        cy.get('[data-testid="map-container"]').should('be.visible');
        cy.get('[data-testid="campaign-card"]').should('have.length.greaterThan', 0);
    });
});
```

## Performance Optimization

### Lazy Loading
```typescript
const MapComponent = React.lazy(() => import('./MapComponent'));

const MapScreen = () => (
    <Suspense fallback={<MapPlaceholder />}>
        <MapComponent />
    </Suspense>
);
```

### Marker Optimization
```typescript
// Only render visible markers
const getVisibleCampaigns = (bounds: google.maps.LatLngBounds) => {
    return campaigns.filter(campaign => 
        bounds.contains(new google.maps.LatLng(
            campaign.coordinates.lat,
            campaign.coordinates.lng
        ))
    );
};
```

## Deployment Considerations

### Build Configuration
```javascript
// app.config.js
module.exports = {
    web: {
        bundler: 'webpack',
        build: {
            babel: {
                include: ['@googlemaps/js-api-loader']
            }
        }
    }
};
```

### CDN Integration
```html
<!-- Alternative: Load Google Maps via CDN -->
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry&callback=initMap">
</script>
```

This guide provides a complete roadmap for integrating real map functionality into your web MapScreen component. Choose the option that best fits your needs and budget constraints.