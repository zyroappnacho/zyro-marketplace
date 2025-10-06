// Simple test to verify app structure
describe('ZYRO Marketplace App', () => {
  it('should have correct package configuration', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.name).toBe('zyromarketplace');
    expect(packageJson.version).toBe('1.0.0');
    expect(packageJson.dependencies).toBeDefined();
    expect(packageJson.dependencies['@reduxjs/toolkit']).toBeDefined();
    expect(packageJson.dependencies['react-redux']).toBeDefined();
    expect(packageJson.dependencies['expo']).toBeDefined();
  });

  it('should have correct app configuration', () => {
    const appJson = require('../app.json');
    
    expect(appJson.expo.name).toBe('ZYRO Marketplace');
    expect(appJson.expo.slug).toBe('zyro-marketplace');
    expect(appJson.expo.version).toBe('1.0.0');
    expect(appJson.expo.ios.bundleIdentifier).toBe('com.zyro.marketplace');
    expect(appJson.expo.android.package).toBe('com.zyro.marketplace');
  });

  it('should have EAS configuration', () => {
    const easJson = require('../eas.json');
    
    expect(easJson.build).toBeDefined();
    expect(easJson.build.production).toBeDefined();
    expect(easJson.submit).toBeDefined();
  });

  it('should have required files', () => {
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
      'App.js',
      'store/index.js',
      'components/ZyroApp.js',
      'services/StorageService.js',
      'services/ApiService.js',
      'services/NotificationService.js'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('should have Redux store configuration', () => {
    // Test that store files exist and have basic structure
    const fs = require('fs');
    const path = require('path');
    
    const storeFile = path.join(__dirname, '..', 'store/index.js');
    const storeContent = fs.readFileSync(storeFile, 'utf8');
    
    expect(storeContent).toContain('configureStore');
    expect(storeContent).toContain('persistStore');
  });

  it('should have all required Redux slices', () => {
    const fs = require('fs');
    const path = require('path');
    
    const slices = [
      'authSlice.js',
      'uiSlice.js', 
      'collaborationsSlice.js',
      'notificationsSlice.js'
    ];
    
    slices.forEach(slice => {
      const slicePath = path.join(__dirname, '..', 'store/slices', slice);
      expect(fs.existsSync(slicePath)).toBe(true);
    });
  });

  it('should have all required services', () => {
    const fs = require('fs');
    const path = require('path');
    
    const services = [
      'StorageService.js',
      'ApiService.js',
      'NotificationService.js'
    ];
    
    services.forEach(service => {
      const servicePath = path.join(__dirname, '..', 'services', service);
      expect(fs.existsSync(servicePath)).toBe(true);
    });
  });

  it('should have main components', () => {
    const fs = require('fs');
    const path = require('path');
    
    const components = [
      'ZyroApp.js',
      'NotificationManager.js',
      'ChatSystem.js',
      'InteractiveMap.js',
      'CollaborationDetailScreenNew.js'
    ];
    
    components.forEach(component => {
      const componentPath = path.join(__dirname, '..', 'components', component);
      expect(fs.existsSync(componentPath)).toBe(true);
    });
  });
});