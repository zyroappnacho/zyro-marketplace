import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../store';

// Import screens
import { WelcomeScreen, LoginScreen, AdminPanelScreen, InfluencerRegistrationScreen, CompanyRegistrationScreen } from '../screens';
import UserManagementScreen from '../screens/UserManagementScreen';
import CampaignManagementScreen from '../screens/CampaignManagementScreen';
import CampaignEditorScreen from '../screens/CampaignEditorScreen';
import { PaymentConfigScreen } from '../screens/PaymentConfigScreen';
import { RevenueDashboardScreen } from '../screens/RevenueDashboardScreen';
import { CompanyDashboardScreen } from '../screens/CompanyDashboardScreen';
import { TabNavigator } from './TabNavigator';
import { Campaign } from '../store/slices/campaignSlice';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  InfluencerRegistration: undefined;
  CompanyRegistration: undefined;
  AdminPanel: undefined;
  UserManagement: undefined;
  CampaignManagement: undefined;
  CampaignEditor: {
    mode: 'create' | 'edit';
    campaign?: Campaign;
  };
  PaymentConfig: undefined;
  RevenueDashboard: undefined;
  CompanyDashboard: undefined;
  MainApp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {!isAuthenticated ? (
          // Authentication flow
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="InfluencerRegistration" component={InfluencerRegistrationScreen} />
            <Stack.Screen name="CompanyRegistration" component={CompanyRegistrationScreen} />
          </>
        ) : user?.role === 'admin' ? (
          // Admin flow
          <>
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="CampaignManagement" component={CampaignManagementScreen} />
            <Stack.Screen name="CampaignEditor" component={CampaignEditorScreen} />
            <Stack.Screen name="PaymentConfig" component={PaymentConfigScreen} />
            <Stack.Screen name="RevenueDashboard" component={RevenueDashboardScreen} />
          </>
        ) : user?.status === 'approved' ? (
          // Approved user flow - different screens based on role
          user?.role === 'company' ? (
            <Stack.Screen name="CompanyDashboard" component={CompanyDashboardScreen} />
          ) : (
            <Stack.Screen name="MainApp" component={TabNavigator} />
          )
        ) : (
          // Pending/rejected users stay on welcome screen
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};