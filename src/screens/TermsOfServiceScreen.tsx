import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';

export const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.goldElegant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Normas de Uso</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos y Condiciones de Uso - Zyro</Text>
          <Text style={styles.lastUpdated}>Última actualización: Enero 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>1. Aceptación de los Términos</Text>
          <Text style={styles.paragraph}>
            Al acceder y utilizar la aplicación Zyro, usted acepta estar sujeto a estos términos y condiciones de uso. 
            Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra aplicación.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>2. Descripción del Servicio</Text>
          <Text style={styles.paragraph}>
            Zyro es una plataforma que conecta influencers cualificados con empresas para colaboraciones basadas en 
            intercambio de productos y servicios. La plataforma opera bajo un modelo de suscripción para empresas, 
            con el administrador como intermediario exclusivo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>3. Registro y Aprobación</Text>
          <Text style={styles.paragraph}>
            • Los influencers deben proporcionar información veraz y actualizada durante el registro.
          </Text>
          <Text style={styles.paragraph}>
            • Todos los usuarios están sujetos a un proceso de aprobación manual por parte del administrador.
          </Text>
          <Text style={styles.paragraph}>
            • El administrador se reserva el derecho de rechazar o suspender cuentas sin previo aviso.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>4. Obligaciones del Influencer</Text>
          <Text style={styles.paragraph}>
            • Mantener información de perfil actualizada, especialmente el número de seguidores.
          </Text>
          <Text style={styles.paragraph}>
            • Cumplir con el compromiso de contenido acordado (2 historias de Instagram o 1 TikTok).
          </Text>
          <Text style={styles.paragraph}>
            • Entregar el contenido dentro del plazo establecido (72 horas).
          </Text>
          <Text style={styles.paragraph}>
            • Aparecer personalmente en el contenido creado.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>5. Colaboraciones</Text>
          <Text style={styles.paragraph}>
            • Las colaboraciones se basan en intercambio de productos/servicios, no en pagos monetarios.
          </Text>
          <Text style={styles.paragraph}>
            • Solo el administrador puede crear, editar y publicar campañas.
          </Text>
          <Text style={styles.paragraph}>
            • Los influencers deben cumplir con los requisitos mínimos de seguidores para cada campaña.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>6. Contenido y Propiedad Intelectual</Text>
          <Text style={styles.paragraph}>
            • El contenido creado por los influencers debe ser original y no infringir derechos de terceros.
          </Text>
          <Text style={styles.paragraph}>
            • Los influencers otorgan a las marcas el derecho de uso del contenido creado para sus campañas.
          </Text>
          <Text style={styles.paragraph}>
            • Zyro se reserva el derecho de utilizar el contenido para fines promocionales de la plataforma.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>7. Prohibiciones</Text>
          <Text style={styles.paragraph}>
            • Proporcionar información falsa o engañosa.
          </Text>
          <Text style={styles.paragraph}>
            • Utilizar la plataforma para actividades ilegales o no autorizadas.
          </Text>
          <Text style={styles.paragraph}>
            • Intentar acceder a cuentas de otros usuarios.
          </Text>
          <Text style={styles.paragraph}>
            • Crear contenido ofensivo, discriminatorio o inapropiado.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>8. Suspensión y Terminación</Text>
          <Text style={styles.paragraph}>
            Zyro se reserva el derecho de suspender o terminar cuentas de usuarios que violen estos términos, 
            sin previo aviso y sin reembolso de pagos realizados.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>9. Limitación de Responsabilidad</Text>
          <Text style={styles.paragraph}>
            Zyro no se hace responsable de daños directos, indirectos, incidentales o consecuentes que puedan 
            surgir del uso de la plataforma o de las colaboraciones realizadas a través de ella.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>10. Modificaciones</Text>
          <Text style={styles.paragraph}>
            Zyro se reserva el derecho de modificar estos términos en cualquier momento. Los usuarios serán 
            notificados de cambios significativos a través de la aplicación.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>11. Ley Aplicable</Text>
          <Text style={styles.paragraph}>
            Estos términos se rigen por las leyes de España. Cualquier disputa será resuelta en los tribunales 
            competentes de Madrid, España.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>12. Contacto</Text>
          <Text style={styles.paragraph}>
            Para preguntas sobre estos términos, puede contactarnos a través de la aplicación o en:
          </Text>
          <Text style={styles.contactInfo}>
            Email: legal@zyro.com{'\n'}
            Dirección: Madrid, España
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldElegant,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.goldElegant,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  lastUpdated: {
    fontSize: fontSizes.sm,
    color: colors.mediumGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: fontSizes.md,
    color: colors.white,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  contactInfo: {
    fontSize: fontSizes.md,
    color: colors.goldElegant,
    lineHeight: 22,
    marginTop: spacing.sm,
    fontWeight: fontWeights.medium,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});