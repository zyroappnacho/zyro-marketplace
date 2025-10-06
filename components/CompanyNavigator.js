import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import CompanyDashboard from './CompanyDashboard';
import CompanyRequests from './CompanyRequests';
import CompanySubscriptionPlans from './CompanySubscriptionPlans';
import CompanyDataScreen from './CompanyDataScreen';
import PaymentMethodsScreen from './PaymentMethodsScreen';
import PaymentDetailsScreen from './PaymentDetailsScreen';
import CompanyPasswordScreen from './CompanyPasswordScreen';

const CompanyNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const navigation = {
    navigate: (screen, params) => {
      setCurrentScreen(screen);
      // Store params for the screen if needed
      if (params) {
        setScreenParams(params);
      }
    },
    goBack: () => setCurrentScreen('dashboard'),
  };

  const [screenParams, setScreenParams] = useState(null);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <CompanyDashboard navigation={navigation} />;
      case 'requests':
        return <CompanyRequests navigation={navigation} />;
      case 'subscription-plans':
        return <CompanySubscriptionPlans navigation={navigation} />;
      case 'PaymentMethodsScreen':
        return <PaymentMethodsScreen navigation={navigation} route={{ params: screenParams }} />;
      case 'PaymentDetailsScreen':
        return <PaymentDetailsScreen navigation={navigation} route={{ params: screenParams }} />;
      case 'CompanyPasswordScreen':
        return <CompanyPasswordScreen navigation={navigation} />;
      case 'company-data':
        return <CompanyDataScreen />;
      default:
        return <CompanyDashboard navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

export default CompanyNavigator;