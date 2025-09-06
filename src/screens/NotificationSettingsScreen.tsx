import React from 'react';
import { View, Text, Switch, ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useNotifications, useNotificationSettings } from '../hooks/useNotifications';
import { PremiumButton } from '../components/PremiumButton';
import { ZyroLogo } from '../components/ZyroLogo';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const Header = styled.View`
  padding: 20px;
  padding-top: 60px;
  background-color: ${props => props.theme.colors.surface};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const HeaderTitle = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-top: 20px;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const Section = styled.View`
  margin-bottom: 30px;
`;

const SectionTitle = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 15px;
`;

const SettingItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const SettingInfo = styled.View`
  flex: 1;
  margin-right: 15px;
`;

const SettingTitle = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const SettingDescription = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const QuietHoursContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 15px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const TimeSelector = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
`;

const TimeInput = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TimeLabel = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  margin-right: 10px;
`;

const TimeValue = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  padding: 8px 12px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatusContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatusRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const StatusLabel = styled.Text`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const StatusValue = styled.Text<{ status: 'granted' | 'denied' | 'unknown' }>`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 14px;
  font-weight: 600;
  color: ${props => 
    props.status === 'granted' 
      ? props.theme.colors.success 
      : props.status === 'denied'
      ? props.theme.colors.error
      : props.theme.colors.textSecondary
  };
`;

const TokenContainer = styled.View`
  background-color: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
`;

const TokenText = styled.Text`
  font-family: ${props => props.theme.fonts.mono || props.theme.fonts.primary};
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

interface NotificationSettingsScreenProps {
  navigation: any;
}

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  navigation,
}) => {
  const { state, requestPermissions, clearBadge, clearAllNotifications } = useNotifications();
  const { settings, updateSetting, updateQuietHours } = useNotificationSettings();

  const handlePermissionRequest = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert(
        'Permisos Concedidos',
        'Las notificaciones han sido habilitadas correctamente.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Permisos Denegados',
        'Para recibir notificaciones importantes, ve a Configuración > Notificaciones y habilita las notificaciones para Zyro.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar Notificaciones',
      '¿Estás seguro de que quieres limpiar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          style: 'destructive',
          onPress: clearAllNotifications 
        },
      ]
    );
  };

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <Container>
      <Header>
        <ZyroLogo size="small" />
        <HeaderTitle>Configuración de Notificaciones</HeaderTitle>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <Section>
          <SectionTitle>Estado del Sistema</SectionTitle>
          <StatusContainer>
            <StatusRow>
              <StatusLabel>Permisos de Notificación:</StatusLabel>
              <StatusValue status={state.permissionsGranted ? 'granted' : 'denied'}>
                {state.permissionsGranted ? 'Concedidos' : 'Denegados'}
              </StatusValue>
            </StatusRow>
            <StatusRow>
              <StatusLabel>Servicio Inicializado:</StatusLabel>
              <StatusValue status={state.isInitialized ? 'granted' : 'denied'}>
                {state.isInitialized ? 'Sí' : 'No'}
              </StatusValue>
            </StatusRow>
            <StatusRow>
              <StatusLabel>Notificaciones Pendientes:</StatusLabel>
              <StatusValue status="unknown">
                {state.badgeCount}
              </StatusValue>
            </StatusRow>
            {state.fcmToken && (
              <View>
                <StatusLabel>Token FCM:</StatusLabel>
                <TokenContainer>
                  <TokenText numberOfLines={2} ellipsizeMode="middle">
                    {state.fcmToken}
                  </TokenText>
                </TokenContainer>
              </View>
            )}
          </StatusContainer>

          {!state.permissionsGranted && (
            <PremiumButton
              title="Solicitar Permisos"
              onPress={handlePermissionRequest}
              style={{ marginBottom: 10 }}
            />
          )}

          <PremiumButton
            title="Limpiar Badge"
            onPress={clearBadge}
            variant="secondary"
            style={{ marginBottom: 10 }}
          />

          <PremiumButton
            title="Limpiar Todas las Notificaciones"
            onPress={handleClearAll}
            variant="secondary"
          />
        </Section>

        {/* Notification Types Section */}
        <Section>
          <SectionTitle>Tipos de Notificaciones</SectionTitle>
          
          <SettingItem>
            <SettingInfo>
              <SettingTitle>Solicitudes de Colaboración</SettingTitle>
              <SettingDescription>
                Recibe notificaciones cuando haya nuevas solicitudes o cambios de estado
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={settings.collaborationRequests}
              onValueChange={(value) => updateSetting('collaborationRequests', value)}
              trackColor={{ false: '#767577', true: '#C9A961' }}
              thumbColor={settings.collaborationRequests ? '#D4AF37' : '#f4f3f4'}
            />
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingTitle>Actualizaciones de Aprobación</SettingTitle>
              <SettingDescription>
                Notificaciones sobre el estado de tu cuenta y aprobaciones
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={settings.approvalUpdates}
              onValueChange={(value) => updateSetting('approvalUpdates', value)}
              trackColor={{ false: '#767577', true: '#C9A961' }}
              thumbColor={settings.approvalUpdates ? '#D4AF37' : '#f4f3f4'}
            />
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingTitle>Nuevas Campañas</SettingTitle>
              <SettingDescription>
                Recibe notificaciones sobre nuevas oportunidades de colaboración
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={settings.campaignUpdates}
              onValueChange={(value) => updateSetting('campaignUpdates', value)}
              trackColor={{ false: '#767577', true: '#C9A961' }}
              thumbColor={settings.campaignUpdates ? '#D4AF37' : '#f4f3f4'}
            />
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingTitle>Recordatorios de Contenido</SettingTitle>
              <SettingDescription>
                Recordatorios para entregar contenido de colaboraciones activas
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={settings.contentReminders}
              onValueChange={(value) => updateSetting('contentReminders', value)}
              trackColor={{ false: '#767577', true: '#C9A961' }}
              thumbColor={settings.contentReminders ? '#D4AF37' : '#f4f3f4'}
            />
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingTitle>Recordatorios de Pago</SettingTitle>
              <SettingDescription>
                Notificaciones sobre vencimientos y pagos de suscripciones
              </SettingDescription>
            </SettingInfo>
            <Switch
              value={settings.paymentReminders}
              onValueChange={(value) => updateSetting('paymentReminders', value)}
              trackColor={{ false: '#767577', true: '#C9A961' }}
              thumbColor={settings.paymentReminders ? '#D4AF37' : '#f4f3f4'}
            />
          </SettingItem>
        </Section>

        {/* Quiet Hours Section */}
        <Section>
          <SectionTitle>Horario Silencioso</SectionTitle>
          <QuietHoursContainer>
            <SettingItem style={{ marginBottom: 0, backgroundColor: 'transparent', padding: 0 }}>
              <SettingInfo>
                <SettingTitle>Activar Horario Silencioso</SettingTitle>
                <SettingDescription>
                  Las notificaciones se programarán para después de este horario
                </SettingDescription>
              </SettingInfo>
              <Switch
                value={settings.quietHours.enabled}
                onValueChange={(value) => updateQuietHours(value)}
                trackColor={{ false: '#767577', true: '#C9A961' }}
                thumbColor={settings.quietHours.enabled ? '#D4AF37' : '#f4f3f4'}
              />
            </SettingItem>

            {settings.quietHours.enabled && (
              <TimeSelector>
                <TimeInput>
                  <TimeLabel>Desde:</TimeLabel>
                  <TimeValue>{formatTime(settings.quietHours.start)}</TimeValue>
                </TimeInput>
                <TimeInput>
                  <TimeLabel>Hasta:</TimeLabel>
                  <TimeValue>{formatTime(settings.quietHours.end)}</TimeValue>
                </TimeInput>
              </TimeSelector>
            )}
          </QuietHoursContainer>
        </Section>
      </Content>
    </Container>
  );
};