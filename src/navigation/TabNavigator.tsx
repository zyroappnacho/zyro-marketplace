import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, fontSizes, fontWeights } from '../styles/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { CollaborationDetailScreen } from '../screens/CollaborationDetailScreen';
import { CollaborationRequestScreen } from '../screens/CollaborationRequestScreen';
import { MapScreen } from '../screens/MapScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PersonalDataScreen } from '../screens/PersonalDataScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { SecuritySettingsScreen } from '../screens/SecuritySettingsScreen';
import { HomeStackParamList, ProfileStackParamList } from '../types';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator<HomeStackParamList>();
const MapStack = createStackNavigator<HomeStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="CollaborationDetail" component={CollaborationDetailScreen} />
      <HomeStack.Screen name="CollaborationRequest" component={CollaborationRequestScreen} />
    </HomeStack.Navigator>
  );
};

const MapStackNavigator = () => {
  return (
    <MapStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MapStack.Screen name="HomeMain" component={MapScreen} />
      <MapStack.Screen name="CollaborationDetail" component={CollaborationDetailScreen} />
      <MapStack.Screen name="CollaborationRequest" component={CollaborationRequestScreen} />
    </MapStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="PersonalData" component={PersonalDataScreen} />
      <ProfileStack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
    </ProfileStack.Navigator>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Map':
              iconName = 'map';
              break;
            case 'History':
              iconName = 'history';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerFocused
            ]}>
              <Icon 
                name={iconName} 
                size={size} 
                color={color}
                style={focused && styles.iconFocused}
              />
            </View>
          );
        },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.goldElegant,
        tabBarInactiveTintColor: colors.mediumGray,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        headerStyle: styles.header,
        headerTintColor: colors.goldElegant,
        headerTitleStyle: styles.headerTitle,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{
          title: 'Colaboraciones',
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapStackNavigator}
        options={{
          title: 'Mapa',
          tabBarLabel: 'Mapa',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          title: 'Historial',
          tabBarLabel: 'Historial',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // Tab Bar Styles
  tabBar: {
    backgroundColor: colors.darkGray,
    borderTopColor: colors.goldElegant,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabBarItem: {
    paddingVertical: spacing.xs,
  },
  tabBarLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    marginTop: 2,
  },
  
  // Icon Styles
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconContainerFocused: {
    backgroundColor: `${colors.goldElegant}20`, // 20% opacity
    shadowColor: colors.goldElegant,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  iconFocused: {
    textShadowColor: colors.goldElegant,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  // Header Styles
  header: {
    backgroundColor: colors.black,
    borderBottomColor: colors.goldElegant,
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
  },
  
  // Placeholder Screen Styles
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  placeholderText: {
    fontSize: fontSizes.lg,
    color: colors.goldElegant,
    fontWeight: fontWeights.medium,
  },
});