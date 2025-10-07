import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // User data management
  async saveUser(user) {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  }

  async getUser() {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async removeUser() {
    try {
      await AsyncStorage.removeItem('currentUser');
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      return false;
    }
  }

  // Settings management
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      return settings ? JSON.parse(settings) : {
        notifications: true,
        emailNotifications: true,
        pushNotifications: true,
        city: 'Madrid',
        language: 'es'
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  // Collaboration history
  async saveCollaborationHistory(history) {
    try {
      await AsyncStorage.setItem('collaborationHistory', JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error saving collaboration history:', error);
      return false;
    }
  }

  async getCollaborationHistory() {
    try {
      const history = await AsyncStorage.getItem('collaborationHistory');
      return history ? JSON.parse(history) : {
        proximos: [],
        pasados: [],
        cancelados: []
      };
    } catch (error) {
      console.error('Error getting collaboration history:', error);
      return { proximos: [], pasados: [], cancelados: [] };
    }
  }

  // Favorites
  async saveFavorites(favorites) {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error saving favorites:', error);
      return false;
    }
  }

  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  // Search history
  async saveSearchHistory(searches) {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(searches));
      return true;
    } catch (error) {
      console.error('Error saving search history:', error);
      return false;
    }
  }

  async getSearchHistory() {
    try {
      const searches = await AsyncStorage.getItem('searchHistory');
      return searches ? JSON.parse(searches) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Cache management
  async saveCache(key, data, expirationMinutes = 60) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + (expirationMinutes * 60 * 1000)
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Error saving cache:', error);
      return false;
    }
  }

  async getCache(key) {
    try {
      const cacheData = await AsyncStorage.getItem(`cache_${key}`);
      if (!cacheData) return null;

      const parsed = JSON.parse(cacheData);
      if (Date.now() > parsed.expiration) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Company data management
  async saveCompanyData(companyData) {
    try {
      console.log('💾 StorageService: Guardando datos de empresa:', companyData.id);
      
      // Save individual company data with enhanced persistence
      const dataToSave = {
        ...companyData,
        lastSaved: new Date().toISOString(),
        version: '2.0'
      };
      
      await AsyncStorage.setItem(`company_${companyData.id}`, JSON.stringify(dataToSave));
      console.log('✅ StorageService: Datos principales guardados');

      // If there's a profile image, save it separately for extra persistence
      if (companyData.profileImage) {
        await AsyncStorage.setItem(`company_profile_image_${companyData.id}`, JSON.stringify({
          userId: companyData.id,
          profileImage: companyData.profileImage,
          savedAt: new Date().toISOString()
        }));
        console.log('✅ StorageService: Imagen de perfil guardada por separado');
      }

      // Update companies list
      const companiesList = await this.getCompaniesList();
      const updatedList = [...companiesList.filter(c => c.id !== companyData.id), {
        id: companyData.id,
        companyName: companyData.companyName,
        email: companyData.companyEmail,  // Email corporativo como credencial de acceso
        plan: companyData.selectedPlan,
        status: companyData.status,
        registrationDate: companyData.registrationDate,
        firstPaymentCompletedDate: companyData.firstPaymentCompletedDate || companyData.paymentCompletedDate,
        nextPaymentDate: companyData.nextPaymentDate,
        profileImage: companyData.profileImage, // Agregar imagen a la lista también
        paymentMethodName: companyData.paymentMethodName,
        monthlyAmount: companyData.monthlyAmount
      }];

      await AsyncStorage.setItem('companiesList', JSON.stringify(updatedList));
      console.log('✅ StorageService: Lista de empresas actualizada');
      
      return true;
    } catch (error) {
      console.error('❌ StorageService: Error saving company data:', error);
      return false;
    }
  }

  async getCompanyData(companyId) {
    try {
      console.log('📋 StorageService: Obteniendo datos de empresa:', companyId);
      
      const companyData = await AsyncStorage.getItem(`company_${companyId}`);
      const parsedData = companyData ? JSON.parse(companyData) : null;
      
      if (parsedData) {
        console.log('✅ StorageService: Datos de empresa encontrados');
        
        // Si no hay imagen en los datos principales, buscar en respaldo
        if (!parsedData.profileImage) {
          const imageBackup = await AsyncStorage.getItem(`company_profile_image_${companyId}`);
          if (imageBackup) {
            const imageData = JSON.parse(imageBackup);
            parsedData.profileImage = imageData.profileImage;
            console.log('📸 StorageService: Imagen recuperada desde respaldo');
          }
        }
      }
      
      return parsedData;
    } catch (error) {
      console.error('❌ StorageService: Error getting company data:', error);
      return null;
    }
  }

  // Método específico para obtener imagen de perfil de empresa
  async getCompanyProfileImage(companyId) {
    try {
      console.log('📸 StorageService: Obteniendo imagen de perfil de empresa:', companyId);
      
      // Intentar desde datos principales
      const companyData = await AsyncStorage.getItem(`company_${companyId}`);
      if (companyData) {
        const parsed = JSON.parse(companyData);
        if (parsed.profileImage) {
          console.log('📸 StorageService: Imagen encontrada en datos principales');
          return parsed.profileImage;
        }
      }

      // Intentar desde respaldo específico de imagen
      const imageBackup = await AsyncStorage.getItem(`company_profile_image_${companyId}`);
      if (imageBackup) {
        const imageData = JSON.parse(imageBackup);
        if (imageData.profileImage) {
          console.log('📸 StorageService: Imagen encontrada en respaldo');
          return imageData.profileImage;
        }
      }

      console.log('📸 StorageService: No se encontró imagen de perfil');
      return null;
    } catch (error) {
      console.error('❌ StorageService: Error getting company profile image:', error);
      return null;
    }
  }

  async getCompaniesList() {
    try {
      const companiesList = await AsyncStorage.getItem('companiesList');
      return companiesList ? JSON.parse(companiesList) : [];
    } catch (error) {
      console.error('Error getting companies list:', error);
      return [];
    }
  }

  // Influencer data management
  async saveInfluencerData(influencerData) {
    try {
      // Save individual influencer data
      await AsyncStorage.setItem(`influencer_${influencerData.id}`, JSON.stringify(influencerData));

      // Update influencers list
      const influencersList = await this.getInfluencersList();
      const updatedList = [...influencersList.filter(i => i.id !== influencerData.id), {
        id: influencerData.id,
        fullName: influencerData.fullName,
        email: influencerData.email,  // Email como credencial de acceso
        instagramUsername: influencerData.instagramUsername,
        instagramFollowers: influencerData.instagramFollowers,
        status: influencerData.status,
        createdAt: influencerData.createdAt
      }];

      await AsyncStorage.setItem('influencersList', JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Error saving influencer data:', error);
      return false;
    }
  }

  async getInfluencerData(influencerId) {
    try {
      const influencerData = await AsyncStorage.getItem(`influencer_${influencerId}`);
      return influencerData ? JSON.parse(influencerData) : null;
    } catch (error) {
      console.error('Error getting influencer data:', error);
      return null;
    }
  }

  async getInfluencersList() {
    try {
      const influencersList = await AsyncStorage.getItem('influencersList');
      return influencersList ? JSON.parse(influencersList) : [];
    } catch (error) {
      console.error('Error getting influencers list:', error);
      return [];
    }
  }

  // Form data management (auto-save)
  async saveFormData(formData) {
    try {
      await AsyncStorage.setItem('registrationFormData', JSON.stringify(formData));
      return true;
    } catch (error) {
      console.error('Error saving form data:', error);
      return false;
    }
  }

  async getFormData() {
    try {
      const formData = await AsyncStorage.getItem('registrationFormData');
      return formData ? JSON.parse(formData) : null;
    } catch (error) {
      console.error('Error getting form data:', error);
      return null;
    }
  }

  async clearFormData() {
    try {
      await AsyncStorage.removeItem('registrationFormData');
      return true;
    } catch (error) {
      console.error('Error clearing form data:', error);
      return false;
    }
  }

  // Clear user data (alias for removeUser)
  async clearUser() {
    try {
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('userSettings');
      await AsyncStorage.removeItem('collaborationHistory');
      await AsyncStorage.removeItem('favorites');
      await AsyncStorage.removeItem('searchHistory');
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  // Generic data methods for AdminService
  async saveData(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      return false;
    }
  }

  async getData(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      return false;
    }
  }

  // Clear all data
  async clearAll() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Company subscription management
  async saveCompanySubscription(subscriptionData) {
    try {
      console.log('💾 StorageService: Guardando suscripción de empresa:', subscriptionData.userId);
      
      // Save subscription data
      await AsyncStorage.setItem(`company_subscription_${subscriptionData.userId}`, JSON.stringify(subscriptionData));
      
      // Update company data with subscription info
      const companyData = await this.getCompanyData(subscriptionData.userId);
      if (companyData) {
        const updatedCompanyData = {
          ...companyData,
          selectedPlan: subscriptionData.plan.name,
          planId: subscriptionData.plan.id,
          monthlyAmount: subscriptionData.plan.price,
          totalAmount: subscriptionData.plan.totalPrice,
          planDuration: subscriptionData.plan.duration,
          paymentMethod: subscriptionData.paymentMethod,
          nextBillingDate: subscriptionData.nextBillingDate,
          subscriptionUpdatedAt: subscriptionData.updatedAt
        };
        
        await this.saveCompanyData(updatedCompanyData);
        console.log('✅ StorageService: Datos de empresa actualizados con suscripción');
      }
      
      return true;
    } catch (error) {
      console.error('❌ StorageService: Error saving company subscription:', error);
      return false;
    }
  }

  async getCompanySubscription(companyId) {
    try {
      console.log('📋 StorageService: Obteniendo suscripción de empresa:', companyId);
      
      const subscriptionData = await AsyncStorage.getItem(`company_subscription_${companyId}`);
      return subscriptionData ? JSON.parse(subscriptionData) : null;
    } catch (error) {
      console.error('❌ StorageService: Error getting company subscription:', error);
      return null;
    }
  }

  // Approved users management (for login after approval)
  async saveApprovedUser(userProfile) {
    try {
      // Save individual user profile
      await AsyncStorage.setItem(`approved_user_${userProfile.id}`, JSON.stringify(userProfile));

      // Update approved users list
      const approvedUsers = await this.getApprovedUsersList();
      const updatedList = [...approvedUsers.filter(u => u.id !== userProfile.id), {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        name: userProfile.name,
        approvedAt: userProfile.approvedAt,
        isActive: userProfile.isActive
      }];

      await AsyncStorage.setItem('approvedUsersList', JSON.stringify(updatedList));
      console.log(`✅ Usuario aprobado guardado: ${userProfile.email}`);
      return true;
    } catch (error) {
      console.error('Error saving approved user:', error);
      return false;
    }
  }

  async getApprovedUser(userId) {
    try {
      const userData = await AsyncStorage.getItem(`approved_user_${userId}`);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting approved user:', error);
      return null;
    }
  }

  async getApprovedUserByEmail(email) {
    try {
      console.log(`🔍 Buscando usuario aprobado por email: ${email}`);

      const approvedUsers = await this.getApprovedUsersList();
      console.log(`📋 Total usuarios en lista aprobados: ${approvedUsers.length}`);

      // Find user that is active and has matching email
      const userInfo = approvedUsers.find(u =>
        u.email === email &&
        (u.isActive === true || u.isActive === undefined)
      );

      if (userInfo) {
        console.log(`✅ Usuario encontrado en lista: ${userInfo.id} (isActive: ${userInfo.isActive})`);

        // Get full user data
        const fullUserData = await this.getApprovedUser(userInfo.id);
        if (fullUserData) {
          console.log(`✅ Datos completos del usuario obtenidos`);
          return fullUserData;
        } else {
          console.log(`⚠️ Usuario en lista pero sin datos completos: ${userInfo.id}`);
          return null;
        }
      } else {
        console.log(`❌ Usuario no encontrado o inactivo: ${email}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting approved user by email:', error);
      return null;
    }
  }

  async getApprovedUsersList() {
    try {
      const approvedUsers = await AsyncStorage.getItem('approvedUsersList');
      const existingUsers = approvedUsers ? JSON.parse(approvedUsers) : [];
      
      // Agregar usuario de prueba de empresa si no existe
      const testCompanyExists = existingUsers.find(u => u.email === 'empresa@zyro.com');
      if (!testCompanyExists) {
        // Verificar si el usuario ya cambió su contraseña
        const passwordChangeFlag = await AsyncStorage.getItem('password_changed_company_test_001');
        let userPassword = 'empresa123'; // Contraseña por defecto
        
        if (passwordChangeFlag) {
          const passwordData = JSON.parse(passwordChangeFlag);
          userPassword = passwordData.newPassword;
          console.log('✅ Usuario de empresa ya cambió contraseña, usando nueva contraseña');
        }

        const testCompanyUser = {
          id: 'company_test_001',
          email: 'empresa@zyro.com',
          password: userPassword,
          role: 'company',
          name: 'Empresa de Prueba ZYRO',
          companyName: 'Empresa de Prueba ZYRO',
          businessName: 'Empresa de Prueba ZYRO',
          subscriptionPlan: 'Plan de 6 meses',
          plan: '6months',
          status: 'approved',
          isActive: true,
          approvedAt: new Date().toISOString(),
          registrationDate: new Date().toISOString(),
          nextPaymentDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 meses
          profileImage: null,
          paymentCompleted: true,
          firstPaymentCompleted: true,
          passwordChanged: !!passwordChangeFlag
        };
        
        // Guardar el usuario completo
        await AsyncStorage.setItem(`approved_user_${testCompanyUser.id}`, JSON.stringify(testCompanyUser));
        
        // Agregar a la lista
        existingUsers.push({
          id: testCompanyUser.id,
          email: testCompanyUser.email,
          role: testCompanyUser.role,
          name: testCompanyUser.name,
          approvedAt: testCompanyUser.approvedAt,
          isActive: testCompanyUser.isActive
        });
        
        // Guardar la lista actualizada
        await AsyncStorage.setItem('approvedUsersList', JSON.stringify(existingUsers));
        console.log('✅ Usuario de prueba de empresa creado: empresa@zyro.com');
      } else {
        // Si el usuario ya existe, verificar si cambió la contraseña y actualizar si es necesario
        const passwordChangeFlag = await AsyncStorage.getItem('password_changed_company_test_001');
        if (passwordChangeFlag) {
          const passwordData = JSON.parse(passwordChangeFlag);
          const existingUserData = await AsyncStorage.getItem('approved_user_company_test_001');
          
          if (existingUserData) {
            const userData = JSON.parse(existingUserData);
            if (userData.password !== passwordData.newPassword) {
              // Actualizar con la nueva contraseña
              userData.password = passwordData.newPassword;
              userData.passwordChanged = true;
              userData.lastPasswordChange = passwordData.changedAt;
              
              await AsyncStorage.setItem('approved_user_company_test_001', JSON.stringify(userData));
              console.log('✅ Contraseña de usuario de empresa actualizada desde flag');
            }
          }
        }
      }

      
      // Agregar usuario de prueba de influencer si no existe
      const testInfluencerExists = existingUsers.find(u => u.email === 'colabos.nachodeborbon@gmail.com');
      if (!testInfluencerExists) {
        const testInfluencerUser = {
          id: 'influencer_test_001',
          email: 'colabos.nachodeborbon@gmail.com',
          password: 'Nacho12345',
          role: 'influencer',
          name: 'Náyades Colaboraciones',
          fullName: 'Náyades Colaboraciones',
          instagramUsername: '@nayades.colabos',
          instagramFollowers: '125000',
          tiktokUsername: '@nayades_colabos',
          tiktokFollowers: '85000',
          city: 'Madrid',
          phone: '+34 600 123 456',
          status: 'approved',
          isActive: true,
          approvedAt: new Date().toISOString(),
          registrationDate: new Date().toISOString(),
          profileImage: null,
          verified: true,
          followers: 125000,
          instagram: '@nayades.colabos'
        };
        
        // Guardar el usuario completo
        await AsyncStorage.setItem(`approved_user_${testInfluencerUser.id}`, JSON.stringify(testInfluencerUser));
        
        // Agregar a la lista
        existingUsers.push({
          id: testInfluencerUser.id,
          email: testInfluencerUser.email,
          role: testInfluencerUser.role,
          name: testInfluencerUser.name,
          approvedAt: testInfluencerUser.approvedAt,
          isActive: testInfluencerUser.isActive
        });
        
        console.log('✅ Usuario de prueba de influencer creado: colabos.nachodeborbon@gmail.com');
      }

      // Agregar usuario de prueba de administrador si no existe
      const testAdminExists = existingUsers.find(u => u.email === 'admin_zyrovip');
      if (!testAdminExists) {
        // Verificar si el usuario ya cambió su contraseña
        const passwordChangeFlag = await AsyncStorage.getItem('password_changed_admin_001');
        let userPassword = 'xarrec-2paqra-guftoN'; // Contraseña por defecto
        
        if (passwordChangeFlag) {
          const passwordData = JSON.parse(passwordChangeFlag);
          userPassword = passwordData.newPassword;
          console.log('✅ Usuario administrador ya cambió contraseña, usando nueva contraseña');
        }

        const testAdminUser = {
          id: 'admin_001',
          email: 'admin_zyrovip',
          password: userPassword,
          role: 'admin',
          name: 'Administrador ZYRO',
          fullName: 'Administrador ZYRO',
          status: 'approved',
          isActive: true,
          approvedAt: new Date().toISOString(),
          registrationDate: new Date().toISOString(),
          profileImage: null,
          verified: true,
          passwordChanged: !!passwordChangeFlag
        };
        
        // Guardar el usuario completo
        await AsyncStorage.setItem(`approved_user_${testAdminUser.id}`, JSON.stringify(testAdminUser));
        
        // Agregar a la lista
        existingUsers.push({
          id: testAdminUser.id,
          email: testAdminUser.email,
          role: testAdminUser.role,
          name: testAdminUser.name,
          approvedAt: testAdminUser.approvedAt,
          isActive: testAdminUser.isActive
        });
        
        // Guardar la lista actualizada
        await AsyncStorage.setItem('approvedUsersList', JSON.stringify(existingUsers));
        console.log('✅ Usuario de prueba de administrador creado: admin_zyrovip');
      } else {
        // Si el usuario ya existe, verificar si cambió la contraseña y actualizar si es necesario
        const passwordChangeFlag = await AsyncStorage.getItem('password_changed_admin_001');
        if (passwordChangeFlag) {
          const passwordData = JSON.parse(passwordChangeFlag);
          const existingUserData = await AsyncStorage.getItem('approved_user_admin_001');
          
          if (existingUserData) {
            const userData = JSON.parse(existingUserData);
            if (userData.password !== passwordData.newPassword) {
              // Actualizar con la nueva contraseña
              userData.password = passwordData.newPassword;
              userData.passwordChanged = true;
              userData.lastPasswordChange = passwordData.changedAt;
              
              await AsyncStorage.setItem('approved_user_admin_001', JSON.stringify(userData));
              console.log('✅ Contraseña de usuario administrador actualizada desde flag');
            }
          }
        }
      }
      
      return existingUsers;
    } catch (error) {
      console.error('Error getting approved users list:', error);
      return [];
    }
  }

  async updateUserLastLogin(userId) {
    try {
      const userData = await this.getApprovedUser(userId);
      if (userData) {
        const updatedData = {
          ...userData,
          lastLogin: new Date().toISOString()
        };
        await AsyncStorage.setItem(`approved_user_${userId}`, JSON.stringify(updatedData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user last login:', error);
      return false;
    }
  }

  async removeApprovedUser(userId) {
    try {
      console.log(`🗑️ Iniciando eliminación de usuario aprobado: ${userId}`);

      // 1. Remove individual user profile
      await AsyncStorage.removeItem(`approved_user_${userId}`);
      console.log(`✅ Perfil individual eliminado: approved_user_${userId}`);

      // 2. Update approved users list - mark as inactive AND remove from list
      const approvedUsers = await this.getApprovedUsersList();
      console.log(`📋 Usuarios aprobados antes: ${approvedUsers.length}`);

      // Filter out the user completely
      const updatedList = approvedUsers.filter(u => u.id !== userId);
      console.log(`📋 Usuarios aprobados después: ${updatedList.length}`);

      await AsyncStorage.setItem('approvedUsersList', JSON.stringify(updatedList));
      console.log(`✅ Lista de usuarios aprobados actualizada`);

      // 3. Verify removal
      const verifyUser = await this.getApprovedUserByEmail(userId);
      if (verifyUser) {
        console.log(`⚠️ ADVERTENCIA: Usuario ${userId} aún encontrado después de eliminación`);
      } else {
        console.log(`✅ Verificación: Usuario ${userId} eliminado correctamente`);
      }

      console.log(`🗑️ Usuario aprobado eliminado completamente: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error removing approved user:', error);
      return false;
    }
  }

  async removeApprovedUserByEmail(email) {
    try {
      console.log(`🗑️ Iniciando eliminación de usuario aprobado por email: ${email}`);

      // 1. Find user by email first
      const approvedUsers = await this.getApprovedUsersList();
      const userToRemove = approvedUsers.find(u => u.email === email);
      
      if (!userToRemove) {
        console.log(`⚠️ Usuario con email ${email} no encontrado en usuarios aprobados`);
        return true; // Consider it successful if user doesn't exist
      }

      console.log(`📋 Usuario encontrado: ${userToRemove.name} (ID: ${userToRemove.id})`);

      // 2. Remove individual user profile
      await AsyncStorage.removeItem(`approved_user_${userToRemove.id}`);
      console.log(`✅ Perfil individual eliminado: approved_user_${userToRemove.id}`);

      // 3. Update approved users list - remove from list
      console.log(`📋 Usuarios aprobados antes: ${approvedUsers.length}`);
      const updatedList = approvedUsers.filter(u => u.email !== email);
      console.log(`📋 Usuarios aprobados después: ${updatedList.length}`);

      await AsyncStorage.setItem('approvedUsersList', JSON.stringify(updatedList));
      console.log(`✅ Lista de usuarios aprobados actualizada`);

      // 4. Verify removal
      const verifyUser = await this.getApprovedUserByEmail(email);
      if (verifyUser) {
        console.log(`⚠️ ADVERTENCIA: Usuario ${email} aún encontrado después de eliminación`);
        return false;
      } else {
        console.log(`✅ Verificación: Usuario ${email} eliminado correctamente`);
      }

      console.log(`🗑️ Usuario aprobado eliminado completamente por email: ${email}`);
      return true;
    } catch (error) {
      console.error('Error removing approved user by email:', error);
      return false;
    }
  }

  // Company locations management
  async saveCompanyLocations(companyId, locations) {
    try {
      console.log(`💾 StorageService: Guardando locales para empresa ${companyId}:`, locations.length);
      
      const locationsData = {
        companyId: companyId,
        locations: locations,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      
      await AsyncStorage.setItem(`company_locations_${companyId}`, JSON.stringify(locationsData));
      console.log('✅ StorageService: Locales guardados exitosamente');
      
      return true;
    } catch (error) {
      console.error('❌ StorageService: Error saving company locations:', error);
      return false;
    }
  }

  async getCompanyLocations(companyId) {
    try {
      console.log(`📍 StorageService: Obteniendo locales para empresa ${companyId}`);
      
      const locationsData = await AsyncStorage.getItem(`company_locations_${companyId}`);
      
      if (!locationsData) {
        console.log('📍 StorageService: No se encontraron locales, devolviendo array vacío');
        return [];
      }
      
      const parsed = JSON.parse(locationsData);
      const locations = parsed.locations || [];
      
      console.log(`✅ StorageService: ${locations.length} locales encontrados`);
      return locations;
    } catch (error) {
      console.error('❌ StorageService: Error getting company locations:', error);
      return [];
    }
  }

  async removeCompanyLocations(companyId) {
    try {
      console.log(`🗑️ StorageService: Eliminando locales para empresa ${companyId}`);
      
      await AsyncStorage.removeItem(`company_locations_${companyId}`);
      console.log('✅ StorageService: Locales eliminados exitosamente');
      
      return true;
    } catch (error) {
      console.error('❌ StorageService: Error removing company locations:', error);
      return false;
    }
  }

  // Get storage info
  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);

      let totalSize = 0;
      const items = values.map(([key, value]) => {
        const size = new Blob([value]).size;
        totalSize += size;
        return { key, size };
      });

      return {
        totalItems: keys.length,
        totalSize,
        items: items.sort((a, b) => b.size - a.size)
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  // ========================================
  // ADMIN PASSWORD MANAGEMENT (PERSISTENT)
  // ========================================

  // Save admin password permanently
  // Save admin password permanently with enhanced persistence
  async saveAdminPassword(password) {
    try {
      console.log('🔐 [ENHANCED] Guardando contraseña de administrador...');
      console.log('🔐 [ENHANCED] Nueva contraseña:', password);
      
      const adminCredentials = {
        password: String(password),
        updatedAt: new Date().toISOString(),
        version: '2.1-enhanced',
        syncId: Date.now(),
        hash: this._generatePasswordHash(String(password)) // Para verificación adicional
      };

      const credentialsString = JSON.stringify(adminCredentials);
      console.log('🔐 [ENHANCED] Datos a guardar:', credentialsString);
      
      // Múltiples puntos de guardado para máxima persistencia
      const savePromises = [
        AsyncStorage.setItem('admin_credentials', credentialsString),
        AsyncStorage.setItem('admin_credentials_backup', credentialsString),
        AsyncStorage.setItem('admin_password_current', String(password)),
        AsyncStorage.setItem('admin_last_update', new Date().toISOString())
      ];
      
      await Promise.all(savePromises);
      console.log('🔐 [ENHANCED] Guardado en múltiples ubicaciones completado');
      
      // Esperar para asegurar sincronización
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificación exhaustiva
      const verifications = await Promise.all([
        AsyncStorage.getItem('admin_credentials'),
        AsyncStorage.getItem('admin_credentials_backup'),
        AsyncStorage.getItem('admin_password_current')
      ]);
      
      const [mainCreds, backupCreds, directPassword] = verifications;
      
      console.log('🔐 [ENHANCED] Verificaciones:');
      console.log('🔐 [ENHANCED] - Credenciales principales:', mainCreds ? 'OK' : 'FAIL');
      console.log('🔐 [ENHANCED] - Credenciales backup:', backupCreds ? 'OK' : 'FAIL');
      console.log('🔐 [ENHANCED] - Contraseña directa:', directPassword ? 'OK' : 'FAIL');
      
      if (mainCreds && backupCreds && directPassword) {
        try {
          const parsedMain = JSON.parse(mainCreds);
          const parsedBackup = JSON.parse(backupCreds);
          
          const allMatch = parsedMain.password === String(password) &&
                          parsedBackup.password === String(password) &&
                          directPassword === String(password);
          
          if (allMatch) {
            console.log('✅ [ENHANCED] Contraseña guardada y verificada en todas las ubicaciones');
            
            // Crear flag de cambio de contraseña para administrador
            const passwordChangeFlag = {
              newPassword: String(password),
              changedAt: new Date().toISOString(),
              userId: 'admin_001',
              previousPasswordDisabled: true
            };
            
            await AsyncStorage.setItem('password_changed_admin_001', JSON.stringify(passwordChangeFlag));
            console.log('✅ [ENHANCED] Flag de cambio de contraseña creado para administrador');
            
            // 🔧 ACTUALIZACIÓN DIRECTA DEL USUARIO ADMINISTRADOR
            try {
              console.log('🔧 [ENHANCED] Actualizando usuario administrador directamente...');
              
              // Obtener el usuario actual
              const currentAdminUser = await AsyncStorage.getItem('approved_user_admin_001');
              if (currentAdminUser) {
                const adminUserData = JSON.parse(currentAdminUser);
                
                // Actualizar con la nueva contraseña
                adminUserData.password = String(password);
                adminUserData.passwordChanged = true;
                adminUserData.lastPasswordChange = new Date().toISOString();
                
                // Guardar el usuario actualizado
                await AsyncStorage.setItem('approved_user_admin_001', JSON.stringify(adminUserData));
                console.log('✅ [ENHANCED] Usuario administrador actualizado directamente');
                console.log('🔐 [ENHANCED] Nueva contraseña del usuario:', adminUserData.password);
              } else {
                console.log('⚠️ [ENHANCED] Usuario administrador no encontrado para actualización directa');
              }
            } catch (updateError) {
              console.error('❌ [ENHANCED] Error actualizando usuario administrador:', updateError);
            }
            
            // Limpiar cualquier cache
            this._adminPasswordCache = null;
            this._lastPasswordCheck = null;
            
            return true;
          } else {
            console.error('❌ [ENHANCED] Error: Las contraseñas verificadas no coinciden');
            return false;
          }
        } catch (parseError) {
          console.error('❌ [ENHANCED] Error al verificar contraseñas:', parseError);
          return false;
        }
      } else {
        console.error('❌ [ENHANCED] Error: No se pudieron verificar todas las ubicaciones');
        return false;
      }
    } catch (error) {
      console.error('❌ [ENHANCED] Error saving admin password:', error);
      return false;
    }
  }

  // Get admin password
  // Get admin password with enhanced retrieval
  async getAdminPassword() {
    try {
      console.log('🔐 [ENHANCED] Obteniendo contraseña de administrador...');
      
      // Intentar múltiples fuentes en orden de prioridad
      const sources = [
        'admin_password_current',    // Más directo
        'admin_credentials',         // Principal
        'admin_credentials_backup'   // Backup
      ];
      
      for (const source of sources) {
        try {
          const data = await AsyncStorage.getItem(source);
          console.log(`🔐 [ENHANCED] Verificando fuente ${source}:`, data ? 'DATOS' : 'NULL');
          
          if (data) {
            let password;
            
            if (source === 'admin_password_current') {
              // Es la contraseña directa
              password = data;
            } else {
              // Es un objeto JSON con credenciales
              const parsed = JSON.parse(data);
              password = parsed.password;
              console.log(`🔐 [ENHANCED] Contraseña de ${source}:`, password);
              console.log(`🔐 [ENHANCED] Actualizada en:`, parsed.updatedAt);
            }
            
            if (password && password !== 'xarrec-2paqra-guftoN') {
              console.log(`✅ [ENHANCED] Contraseña personalizada encontrada en ${source}`);
              return password;
            } else if (password === 'xarrec-2paqra-guftoN') {
              console.log(`🔐 [ENHANCED] Contraseña por defecto encontrada en ${source}`);
              return password;
            }
          }
        } catch (sourceError) {
          console.error(`❌ [ENHANCED] Error en fuente ${source}:`, sourceError);
          continue;
        }
      }

      // Si no se encuentra nada, usar contraseña por defecto
      console.log('🔐 [ENHANCED] No se encontró contraseña personalizada, usando por defecto');
      return 'xarrec-2paqra-guftoN';
    } catch (error) {
      console.error('❌ [ENHANCED] Error getting admin password:', error);
      return 'xarrec-2paqra-guftoN';
    }
  }

  // Verify admin password
  async verifyAdminPassword(inputPassword) {
    try {
      const storedPassword = await this.getAdminPassword();
      const isValid = String(inputPassword) === String(storedPassword);
      
      return isValid;
    } catch (error) {
      console.error('Error verifying admin password:', error);
      return false;
    }
  }

  // Get admin credentials info
  async getAdminCredentialsInfo() {
    try {
      const adminCredentials = await AsyncStorage.getItem('admin_credentials');
      if (adminCredentials) {
        const parsed = JSON.parse(adminCredentials);
        return {
          hasCustomPassword: true,
          updatedAt: parsed.updatedAt,
          version: parsed.version
        };
      }

      return {
        hasCustomPassword: false,
        updatedAt: null,
        version: null
      };
    } catch (error) {
      console.error('Error getting admin credentials info:', error);
      return {
        hasCustomPassword: false,
        updatedAt: null,
        version: null
      };
    }
  }

  // ========================================
  // GDPR COMPLIANT DELETION METHODS
  // ========================================

  // Complete GDPR deletion of influencer data
  async deleteInfluencerDataCompletely(influencerId) {
    try {
      console.log(`🗑️ GDPR: Eliminando datos completos del influencer ${influencerId}`);

      // Remove main influencer data
      await AsyncStorage.removeItem(`influencer_${influencerId}`);
      console.log(`✅ GDPR: Datos principales eliminados`);

      // Remove any cached profile data
      await AsyncStorage.removeItem(`profile_${influencerId}`);
      console.log(`✅ GDPR: Datos de perfil eliminados`);

      // Remove any session data
      await AsyncStorage.removeItem(`session_${influencerId}`);
      console.log(`✅ GDPR: Datos de sesión eliminados`);

      // Remove any temporary data
      await AsyncStorage.removeItem(`temp_${influencerId}`);
      console.log(`✅ GDPR: Datos temporales eliminados`);

      return true;
    } catch (error) {
      console.error('Error in GDPR data deletion:', error);
      return false;
    }
  }

  // Remove influencer from all lists
  async removeInfluencerFromList(influencerId) {
    try {
      console.log(`🗑️ GDPR: Eliminando influencer de todas las listas`);

      // Remove from main influencers list
      const influencersList = await this.getInfluencersList();
      const updatedInfluencersList = influencersList.filter(inf => inf.id !== influencerId);
      await AsyncStorage.setItem('influencersList', JSON.stringify(updatedInfluencersList));
      console.log(`✅ GDPR: Eliminado de lista principal de influencers`);

      // Remove from pending list if exists
      const pendingList = await AsyncStorage.getItem('pendingInfluencers');
      if (pendingList) {
        const pendingInfluencers = JSON.parse(pendingList);
        const updatedPendingList = pendingInfluencers.filter(inf => inf.id !== influencerId);
        await AsyncStorage.setItem('pendingInfluencers', JSON.stringify(updatedPendingList));
        console.log(`✅ GDPR: Eliminado de lista de pendientes`);
      }

      // Remove from approved list if exists
      const approvedList = await AsyncStorage.getItem('approvedInfluencers');
      if (approvedList) {
        const approvedInfluencers = JSON.parse(approvedList);
        const updatedApprovedList = approvedInfluencers.filter(inf => inf.id !== influencerId);
        await AsyncStorage.setItem('approvedInfluencers', JSON.stringify(updatedApprovedList));
        console.log(`✅ GDPR: Eliminado de lista de aprobados`);
      }

      return true;
    } catch (error) {
      console.error('Error removing from lists:', error);
      return false;
    }
  }

  // Clean up all references to the influencer
  async cleanupInfluencerReferences(influencerId) {
    try {
      console.log(`🗑️ GDPR: Limpiando todas las referencias del influencer ${influencerId}`);

      // Get all storage keys
      const allKeys = await AsyncStorage.getAllKeys();

      // Find keys that might contain references to this influencer
      const keysToClean = allKeys.filter(key =>
        key.includes(influencerId) ||
        key.includes('collaboration') ||
        key.includes('request') ||
        key.includes('notification')
      );

      console.log(`🔍 GDPR: Encontradas ${keysToClean.length} claves para limpiar`);

      // Clean each key
      for (const key of keysToClean) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);

            // If it's an array, filter out references to this influencer
            if (Array.isArray(parsedData)) {
              const cleanedData = parsedData.filter(item =>
                item.influencerId !== influencerId &&
                item.userId !== influencerId &&
                item.id !== influencerId
              );

              if (cleanedData.length !== parsedData.length) {
                await AsyncStorage.setItem(key, JSON.stringify(cleanedData));
                console.log(`✅ GDPR: Limpiada referencia en ${key}`);
              }
            }
            // If it's an object and contains the influencer ID, remove the key entirely
            else if (parsedData.influencerId === influencerId || parsedData.userId === influencerId || parsedData.id === influencerId) {
              await AsyncStorage.removeItem(key);
              console.log(`✅ GDPR: Eliminada clave completa ${key}`);
            }
          }
        } catch (parseError) {
          // If we can't parse it, and it contains the influencer ID, remove it
          if (key.includes(influencerId)) {
            await AsyncStorage.removeItem(key);
            console.log(`✅ GDPR: Eliminada clave no parseable ${key}`);
          }
        }
      }

      console.log(`✅ GDPR: Limpieza de referencias completada`);
      return true;
    } catch (error) {
      console.error('Error cleaning up references:', error);
      return false;
    }
  }

  // ========== COMPANY GDPR DELETION FUNCTIONS ==========

  // Complete GDPR deletion of company data
  async deleteCompanyDataCompletely(companyId) {
    try {
      console.log(`🗑️ GDPR: Eliminando datos completos de la empresa ${companyId}`);

      // Remove main company data
      await AsyncStorage.removeItem(`company_${companyId}`);
      console.log(`✅ GDPR: Datos principales de empresa eliminados`);

      // Remove company profile image backup
      await AsyncStorage.removeItem(`company_profile_image_${companyId}`);
      console.log(`✅ GDPR: Imagen de perfil de empresa eliminada`);

      // Remove company subscription data
      await AsyncStorage.removeItem(`company_subscription_${companyId}`);
      console.log(`✅ GDPR: Datos de suscripción eliminados`);

      // Remove company payment methods
      await AsyncStorage.removeItem(`company_payment_methods_${companyId}`);
      console.log(`✅ GDPR: Métodos de pago eliminados`);

      // Remove any other company-specific data
      const allKeys = await AsyncStorage.getAllKeys();
      const companyKeys = allKeys.filter(key => key.includes(companyId));
      
      for (const key of companyKeys) {
        await AsyncStorage.removeItem(key);
        console.log(`✅ GDPR: Eliminada clave específica de empresa: ${key}`);
      }

      console.log(`✅ GDPR: Eliminación completa de datos de empresa completada`);
      return true;
    } catch (error) {
      console.error('Error deleting company data completely:', error);
      return false;
    }
  }

  // Remove company from all lists
  async removeCompanyFromList(companyId) {
    try {
      console.log(`🗑️ GDPR: Eliminando empresa de todas las listas`);

      // Remove from companies list
      const companiesList = await this.getCompaniesList();
      const updatedCompaniesList = companiesList.filter(company => company.id !== companyId);
      await AsyncStorage.setItem('companiesList', JSON.stringify(updatedCompaniesList));
      console.log(`✅ GDPR: Empresa eliminada de la lista principal`);

      // Remove from any other company-related lists
      const allKeys = await AsyncStorage.getAllKeys();
      const listKeys = allKeys.filter(key => 
        key.includes('companies') || 
        key.includes('Companies') ||
        key.includes('company_list')
      );

      for (const key of listKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
              const filteredData = parsedData.filter(item => 
                item.id !== companyId && 
                item.companyId !== companyId
              );
              if (filteredData.length !== parsedData.length) {
                await AsyncStorage.setItem(key, JSON.stringify(filteredData));
                console.log(`✅ GDPR: Empresa eliminada de ${key}`);
              }
            }
          }
        } catch (parseError) {
          console.log(`⚠️ GDPR: No se pudo procesar ${key}, continuando...`);
        }
      }

      console.log(`✅ GDPR: Eliminación de listas completada`);
      return true;
    } catch (error) {
      console.error('Error removing company from lists:', error);
      return false;
    }
  }

  // Cancel company subscription and future payments
  async cancelCompanySubscription(companyId) {
    try {
      console.log(`🗑️ GDPR: Cancelando suscripciones y pagos futuros para empresa ${companyId}`);

      // Remove subscription data
      await AsyncStorage.removeItem(`company_subscription_${companyId}`);
      console.log(`✅ GDPR: Datos de suscripción eliminados`);

      // Remove payment schedule
      await AsyncStorage.removeItem(`company_payment_schedule_${companyId}`);
      console.log(`✅ GDPR: Calendario de pagos eliminado`);

      // Remove billing information
      await AsyncStorage.removeItem(`company_billing_${companyId}`);
      console.log(`✅ GDPR: Información de facturación eliminada`);

      // In a real app, here you would also:
      // - Cancel recurring payments with payment processor
      // - Send cancellation notifications
      // - Update external billing systems
      console.log(`💳 GDPR: En producción se cancelarían pagos recurrentes externos`);

      console.log(`✅ GDPR: Cancelación de suscripciones completada`);
      return true;
    } catch (error) {
      console.error('Error cancelling company subscription:', error);
      return false;
    }
  }

  // Clean up all references to the company
  async cleanupCompanyReferences(companyId) {
    try {
      console.log(`🗑️ GDPR: Limpiando todas las referencias de la empresa ${companyId}`);

      // Get all storage keys
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter keys that might contain company references
      const keysToClean = allKeys.filter(key => 
        !key.startsWith(`company_${companyId}`) && // Don't clean the main company keys (already deleted)
        (key.includes('campaign') || 
         key.includes('collaboration') || 
         key.includes('request') || 
         key.includes('admin') ||
         key.includes('financial') ||
         key.includes('transaction'))
      );

      // Clean each key
      for (const key of keysToClean) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);

            // If it's an array, filter out references to this company
            if (Array.isArray(parsedData)) {
              const cleanedData = parsedData.filter(item =>
                item.companyId !== companyId &&
                item.userId !== companyId &&
                item.id !== companyId
              );

              if (cleanedData.length !== parsedData.length) {
                await AsyncStorage.setItem(key, JSON.stringify(cleanedData));
                console.log(`✅ GDPR: Limpiada referencia de empresa en ${key}`);
              }
            }
            // If it's an object and contains the company ID, remove the key entirely
            else if (parsedData.companyId === companyId || parsedData.userId === companyId || parsedData.id === companyId) {
              await AsyncStorage.removeItem(key);
              console.log(`✅ GDPR: Eliminada clave completa ${key}`);
            }
          }
        } catch (parseError) {
          // If we can't parse it, and it contains the company ID, remove it
          if (key.includes(companyId)) {
            await AsyncStorage.removeItem(key);
            console.log(`✅ GDPR: Eliminada clave no parseable ${key}`);
          }
        }
      }

      console.log(`✅ GDPR: Limpieza de referencias de empresa completada`);
      return true;
    } catch (error) {
      console.error('Error cleaning up company references:', error);
      return false;
    }
  }

  // Verify complete GDPR deletion
  async verifyGDPRDeletion(influencerId, email) {
    try {
      console.log(`🔍 GDPR: Verificando eliminación completa para ${influencerId} (${email})`);

      const verificationResults = {
        approvedUserExists: false,
        influencerDataExists: false,
        referencesFound: [],
        gdprCompliant: true
      };

      // Check if approved user still exists
      const approvedUser = await this.getApprovedUserByEmail(email);
      verificationResults.approvedUserExists = !!approvedUser;

      // Check if influencer data still exists
      const influencerData = await this.getInfluencerData(influencerId);
      verificationResults.influencerDataExists = !!influencerData;

      // Check for any remaining references
      const allKeys = await AsyncStorage.getAllKeys();
      const referencesFound = [];

      for (const key of allKeys) {
        if (key.includes(influencerId)) {
          referencesFound.push(key);
        }
      }

      verificationResults.referencesFound = referencesFound;
      verificationResults.gdprCompliant = !verificationResults.approvedUserExists &&
        !verificationResults.influencerDataExists &&
        referencesFound.length === 0;

      console.log(`🔍 GDPR Verification Results:`, verificationResults);

      return verificationResults;
    } catch (error) {
      console.error('Error verifying GDPR deletion:', error);
      return {
        approvedUserExists: true,
        influencerDataExists: true,
        referencesFound: ['verification_error'],
        gdprCompliant: false
      };
    }
  }

  // ========================================
  // SUBSCRIPTION MANAGEMENT
  // ========================================

  // Save company subscription data
  async saveCompanySubscription(subscriptionData) {
    try {
      console.log('💳 Guardando datos de suscripción:', subscriptionData);
      
      const subscriptionKey = `subscription_${subscriptionData.userId}`;
      await AsyncStorage.setItem(subscriptionKey, JSON.stringify(subscriptionData));
      
      // También actualizar en los datos de empresa
      const companyData = await this.getCompanyData(subscriptionData.userId);
      if (companyData) {
        const updatedCompanyData = {
          ...companyData,
          currentPlan: subscriptionData.plan,
          selectedPlan: subscriptionData.plan.name,
          planId: subscriptionData.plan.id,
          monthlyAmount: subscriptionData.plan.price,
          totalAmount: subscriptionData.plan.totalPrice,
          planDuration: subscriptionData.plan.duration,
          paymentMethod: subscriptionData.paymentMethod,
          paymentMethodName: subscriptionData.paymentMethod?.name || 'No definido',
          nextBillingDate: subscriptionData.nextBillingDate,
          subscriptionUpdatedAt: subscriptionData.updatedAt
        };
        await this.saveCompanyData(updatedCompanyData);
      }
      
      console.log('✅ Datos de suscripción guardados exitosamente');
      return true;
    } catch (error) {
      console.error('Error saving company subscription:', error);
      return false;
    }
  }

  // Get company subscription data
  async getCompanySubscription(userId) {
    try {
      const subscriptionKey = `subscription_${userId}`;
      const subscriptionData = await AsyncStorage.getItem(subscriptionKey);
      
      if (subscriptionData) {
        return JSON.parse(subscriptionData);
      }
      
      // Si no hay datos de suscripción, intentar obtener de datos de empresa
      const companyData = await this.getCompanyData(userId);
      if (companyData && companyData.currentPlan) {
        return {
          userId: userId,
          plan: companyData.currentPlan,
          paymentMethod: companyData.paymentMethod,
          nextBillingDate: companyData.nextBillingDate,
          updatedAt: companyData.subscriptionUpdatedAt || new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting company subscription:', error);
      return null;
    }
  }

  // Update subscription plan
  async updateSubscriptionPlan(userId, newPlan) {
    try {
      const currentSubscription = await this.getCompanySubscription(userId);
      
      const updatedSubscription = {
        ...currentSubscription,
        userId: userId,
        plan: newPlan,
        updatedAt: new Date().toISOString(),
        nextBillingDate: this.calculateNextBillingDate(newPlan.duration)
      };
      
      return await this.saveCompanySubscription(updatedSubscription);
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return false;
    }
  }

  // Update payment method
  async updatePaymentMethod(userId, newPaymentMethod) {
    try {
      const currentSubscription = await this.getCompanySubscription(userId);
      
      const updatedSubscription = {
        ...currentSubscription,
        userId: userId,
        paymentMethod: newPaymentMethod,
        updatedAt: new Date().toISOString()
      };
      
      return await this.saveCompanySubscription(updatedSubscription);
    } catch (error) {
      console.error('Error updating payment method:', error);
      return false;
    }
  }

  // Calculate next billing date
  calculateNextBillingDate(durationMonths) {
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate.toISOString();
  }

  // Get subscription history
  async getSubscriptionHistory(userId) {
    try {
      const historyKey = `subscription_history_${userId}`;
      const historyData = await AsyncStorage.getItem(historyKey);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error getting subscription history:', error);
      return [];
    }
  }

  // Save subscription history entry
  async saveSubscriptionHistoryEntry(userId, historyEntry) {
    try {
      const currentHistory = await this.getSubscriptionHistory(userId);
      const updatedHistory = [historyEntry, ...currentHistory];
      
      const historyKey = `subscription_history_${userId}`;
      await AsyncStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      
      return true;
    } catch (error) {
      console.error('Error saving subscription history entry:', error);
      return false;
    }
  }

  // Save payment details securely
  async savePaymentDetails(userId, paymentDetails) {
    try {
      const paymentDetailsKey = `payment_details_${userId}`;
      const securePaymentData = {
        userId: userId,
        paymentMethod: paymentDetails,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isEncrypted: false // En producción, esto debería ser true con encriptación real
      };
      
      await AsyncStorage.setItem(paymentDetailsKey, JSON.stringify(securePaymentData));
      console.log('✅ Detalles de pago guardados de forma segura');
      return true;
    } catch (error) {
      console.error('Error saving payment details:', error);
      return false;
    }
  }

  // Get payment details securely
  async getPaymentDetails(userId) {
    try {
      const paymentDetailsKey = `payment_details_${userId}`;
      const paymentData = await AsyncStorage.getItem(paymentDetailsKey);
      
      if (paymentData) {
        const parsedData = JSON.parse(paymentData);
        console.log('✅ Detalles de pago recuperados');
        return parsedData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting payment details:', error);
      return null;
    }
  }

  // Update payment details
  async updatePaymentDetails(userId, newPaymentDetails) {
    try {
      const existingDetails = await this.getPaymentDetails(userId);
      
      const updatedDetails = {
        ...existingDetails,
        paymentMethod: newPaymentDetails,
        lastUpdated: new Date().toISOString()
      };
      
      return await this.savePaymentDetails(userId, newPaymentDetails);
    } catch (error) {
      console.error('Error updating payment details:', error);
      return false;
    }
  }

  // Remove payment details (for security/GDPR compliance)
  async removePaymentDetails(userId) {
    try {
      const paymentDetailsKey = `payment_details_${userId}`;
      await AsyncStorage.removeItem(paymentDetailsKey);
      console.log('✅ Detalles de pago eliminados');
      return true;
    } catch (error) {
      console.error('Error removing payment details:', error);
      return false;
    }
  }

  // ========================================
  // DIRECT ASYNCSTORAGE PASSWORD FUNCTIONS (NO CACHE)
  // ========================================
  
  // Save admin password DIRECTLY to AsyncStorage (bypass any cache)
  async saveAdminPasswordDirect(password) {
    try {
      console.log('🔐 [DIRECT] Guardando contraseña directamente en AsyncStorage...');
      console.log('🔐 [DIRECT] Contraseña:', password);
      
      const adminCredentials = {
        password: String(password),
        updatedAt: new Date().toISOString(),
        version: '2.0-direct',
        syncId: Date.now()
      };

      const credentialsString = JSON.stringify(adminCredentials);
      
      // Import AsyncStorage directly
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Save directly
      await AsyncStorage.setItem('admin_credentials_direct', credentialsString);
      console.log('🔐 [DIRECT] Guardado en admin_credentials_direct');
      
      // Also save in the original key for compatibility
      await AsyncStorage.setItem('admin_credentials', credentialsString);
      console.log('🔐 [DIRECT] Guardado en admin_credentials (compatibilidad)');
      
      // Verify immediately
      const verification = await AsyncStorage.getItem('admin_credentials_direct');
      if (verification) {
        const parsed = JSON.parse(verification);
        if (parsed.password === String(password)) {
          console.log('✅ [DIRECT] Contraseña guardada y verificada directamente');
          return true;
        }
      }
      
      console.error('❌ [DIRECT] Error en verificación directa');
      return false;
    } catch (error) {
      console.error('❌ [DIRECT] Error guardando contraseña:', error);
      return false;
    }
  }
  
  // Get admin password DIRECTLY from AsyncStorage (bypass any cache)
  async getAdminPasswordDirect() {
    try {
      console.log('🔐 [DIRECT] Obteniendo contraseña directamente de AsyncStorage...');
      
      // Import AsyncStorage directly
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Try direct key first
      let adminCredentials = await AsyncStorage.getItem('admin_credentials_direct');
      console.log('🔐 [DIRECT] Datos de admin_credentials_direct:', adminCredentials ? 'EXISTE' : 'NULL');
      
      // Fallback to original key
      if (!adminCredentials) {
        adminCredentials = await AsyncStorage.getItem('admin_credentials');
        console.log('🔐 [DIRECT] Datos de admin_credentials:', adminCredentials ? 'EXISTE' : 'NULL');
      }
      
      if (adminCredentials) {
        try {
          const parsed = JSON.parse(adminCredentials);
          console.log('🔐 [DIRECT] Contraseña recuperada:', parsed.password);
          console.log('🔐 [DIRECT] Actualizada:', parsed.updatedAt);
          return parsed.password;
        } catch (parseError) {
          console.error('🔐 [DIRECT] Error parsing:', parseError);
        }
      }

      // Return default password if none is set
      console.log('🔐 [DIRECT] Usando contraseña por defecto');
      return 'xarrec-2paqra-guftoN';
    } catch (error) {
      console.error('🔐 [DIRECT] Error:', error);
      return 'xarrec-2paqra-guftoN';
    }
  }

  // ========================================
  // LOGIN CREDENTIALS MANAGEMENT
  // ========================================

  // Save login credentials for all users
  async saveLoginCredentials(credentials) {
    try {
      console.log('🔑 Guardando credenciales de login...');
      await AsyncStorage.setItem('loginCredentials', JSON.stringify(credentials));
      console.log('✅ Credenciales de login guardadas exitosamente');
      return true;
    } catch (error) {
      console.error('Error saving login credentials:', error);
      return false;
    }
  }

  // Get login credentials for all users
  async getLoginCredentials() {
    try {
      console.log('🔑 Obteniendo credenciales de login...');
      const credentials = await AsyncStorage.getItem('loginCredentials');
      const result = credentials ? JSON.parse(credentials) : {};
      console.log('✅ Credenciales de login obtenidas:', Object.keys(result).length, 'usuarios');
      return result;
    } catch (error) {
      console.error('Error getting login credentials:', error);
      return {};
    }
  }

  // Clear all user data (for logout)
  async clearUser() {
    try {
      await AsyncStorage.removeItem('currentUser');
      console.log('✅ Datos de usuario limpiados');
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  // ========================================




  // Generate simple hash for password verification
  _generatePasswordHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Company Locations Management
  async getCompanyLocations(companyId) {
    try {
      if (!companyId) {
        console.warn('Company ID is required for getting locations');
        return [];
      }

      const key = `company_locations_${companyId}`;
      const locationsData = await AsyncStorage.getItem(key);
      
      if (!locationsData) {
        console.log(`📍 No locations found for company ${companyId}`);
        return [];
      }

      const parsedData = JSON.parse(locationsData);
      
      // Manejar tanto formato nuevo como legacy
      let locations;
      if (parsedData.locations && Array.isArray(parsedData.locations)) {
        // Formato nuevo con metadata
        locations = parsedData.locations;
        console.log(`📍 Loaded ${locations.length} locations for company ${companyId} (v${parsedData.version || 'legacy'})`);
      } else if (Array.isArray(parsedData)) {
        // Formato legacy (array directo)
        locations = parsedData;
        console.log(`📍 Loaded ${locations.length} locations for company ${companyId} (legacy format)`);
        
        // Migrar a nuevo formato automáticamente
        await this.saveCompanyLocations(companyId, locations);
      } else {
        console.warn('Invalid locations data format, returning empty array');
        return [];
      }

      // Validar integridad de datos
      const validLocations = locations.filter(location => {
        if (!location.id || !location.name || !location.address) {
          console.warn('Skipping invalid location:', location);
          return false;
        }
        return true;
      });

      if (validLocations.length !== locations.length) {
        console.warn(`Filtered out ${locations.length - validLocations.length} invalid locations`);
        // Guardar solo las válidas
        await this.saveCompanyLocations(companyId, validLocations);
      }

      return validLocations;
    } catch (error) {
      console.error('❌ Error getting company locations:', error);
      return [];
    }
  }

  async saveCompanyLocations(companyId, locations) {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      if (!Array.isArray(locations)) {
        throw new Error('Locations must be an array');
      }

      const key = `company_locations_${companyId}`;
      
      // Validar estructura de datos antes de guardar
      const validatedLocations = locations.map(location => {
        if (!location.id || !location.name || !location.address) {
          throw new Error('Invalid location data: missing required fields');
        }
        
        return {
          ...location,
          companyId: companyId, // Asegurar que el companyId esté presente
          updatedAt: location.updatedAt || new Date().toISOString(),
          createdAt: location.createdAt || new Date().toISOString()
        };
      });

      // Guardar con timestamp para auditoría
      const dataToSave = {
        companyId: companyId,
        locations: validatedLocations,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
      
      // Verificar inmediatamente que se guardó
      const verification = await AsyncStorage.getItem(key);
      if (!verification) {
        throw new Error('Verification failed: data not found after save');
      }

      const parsedVerification = JSON.parse(verification);
      if (parsedVerification.locations.length !== validatedLocations.length) {
        throw new Error('Verification failed: location count mismatch');
      }

      console.log(`✅ Locales guardados y verificados para empresa ${companyId}:`, validatedLocations.length);
      return true;
    } catch (error) {
      console.error('❌ Error saving company locations:', error);
      return false;
    }
  }

  async addCompanyLocation(companyId, location) {
    try {
      const existingLocations = await this.getCompanyLocations(companyId);
      const newLocation = {
        ...location,
        id: Date.now().toString(),
        companyId: companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedLocations = [...existingLocations, newLocation];
      await this.saveCompanyLocations(companyId, updatedLocations);
      
      return newLocation;
    } catch (error) {
      console.error('Error adding company location:', error);
      return null;
    }
  }

  async updateCompanyLocation(companyId, locationId, locationData) {
    try {
      const existingLocations = await this.getCompanyLocations(companyId);
      const updatedLocations = existingLocations.map(location => 
        location.id === locationId 
          ? { ...location, ...locationData, updatedAt: new Date().toISOString() }
          : location
      );
      
      await this.saveCompanyLocations(companyId, updatedLocations);
      return true;
    } catch (error) {
      console.error('Error updating company location:', error);
      return false;
    }
  }

  async deleteCompanyLocation(companyId, locationId) {
    try {
      const existingLocations = await this.getCompanyLocations(companyId);
      const updatedLocations = existingLocations.filter(location => location.id !== locationId);
      
      await this.saveCompanyLocations(companyId, updatedLocations);
      return true;
    } catch (error) {
      console.error('Error deleting company location:', error);
      return false;
    }
  }

  async clearCompanyLocations(companyId) {
    try {
      const key = `company_locations_${companyId}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing company locations:', error);
      return false;
    }
  }
}

export default new StorageService();