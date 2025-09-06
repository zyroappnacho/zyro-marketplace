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
import { colors, spacing, fontSizes, fontWeights } from '../styles/theme';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.goldElegant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidad</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Política de Privacidad - Zyro</Text>
          <Text style={styles.lastUpdated}>Última actualización: Enero 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>1. Introducción</Text>
          <Text style={styles.paragraph}>
            En Zyro, respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta política 
            de privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos su información personal 
            de acuerdo con el Reglamento General de Protección de Datos (GDPR) y la legislación española.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>2. Responsable del Tratamiento</Text>
          <Text style={styles.paragraph}>
            El responsable del tratamiento de sus datos personales es:
          </Text>
          <Text style={styles.contactInfo}>
            Zyro España S.L.{'\n'}
            CIF: B-12345678{'\n'}
            Dirección: Calle Mayor 123, 28001 Madrid, España{'\n'}
            Email: privacy@zyro.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>3. Datos que Recopilamos</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Para Influencers:</Text>
          </Text>
          <Text style={styles.paragraph}>
            • Información personal: nombre completo, email, teléfono, dirección
          </Text>
          <Text style={styles.paragraph}>
            • Datos de redes sociales: usuarios de Instagram/TikTok, número de seguidores
          </Text>
          <Text style={styles.paragraph}>
            • Estadísticas de audiencia: países, ciudades, rangos de edad, métricas mensuales
          </Text>
          <Text style={styles.paragraph}>
            • Foto de perfil y contenido creado
          </Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Para Empresas:</Text>
          </Text>
          <Text style={styles.paragraph}>
            • Información empresarial: nombre de la empresa, CIF, dirección
          </Text>
          <Text style={styles.paragraph}>
            • Datos de contacto: email corporativo, teléfono, persona de contacto
          </Text>
          <Text style={styles.paragraph}>
            • Información de suscripción y pagos
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>4. Base Legal y Finalidades</Text>
          <Text style={styles.paragraph}>
            Tratamos sus datos personales basándonos en las siguientes bases legales:
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Ejecución de contrato:</Text> Para proporcionar nuestros servicios y gestionar colaboraciones
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Consentimiento:</Text> Para enviar comunicaciones promocionales
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Interés legítimo:</Text> Para mejorar nuestros servicios y prevenir fraudes
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Obligación legal:</Text> Para cumplir con requisitos fiscales y legales
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>5. Compartir Datos con Terceros</Text>
          <Text style={styles.paragraph}>
            Sus datos pueden ser compartidos con:
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Empresas colaboradoras:</Text> Información necesaria para coordinar colaboraciones
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Proveedores de servicios:</Text> Procesadores de pago, servicios de hosting, análisis
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Autoridades:</Text> Cuando sea requerido por ley
          </Text>
          <Text style={styles.paragraph}>
            No vendemos ni alquilamos sus datos personales a terceros.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>6. Transferencias Internacionales</Text>
          <Text style={styles.paragraph}>
            Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo. 
            En estos casos, garantizamos que se implementen las salvaguardas adecuadas según el GDPR.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>7. Retención de Datos</Text>
          <Text style={styles.paragraph}>
            Conservamos sus datos personales durante el tiempo necesario para cumplir con las finalidades descritas:
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Cuentas activas:</Text> Mientras mantenga su cuenta activa
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Datos fiscales:</Text> 6 años según la legislación española
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Comunicaciones:</Text> 3 años desde la última interacción
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>8. Sus Derechos</Text>
          <Text style={styles.paragraph}>
            Bajo el GDPR, usted tiene los siguientes derechos:
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Acceso:</Text> Solicitar una copia de sus datos personales
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Rectificación:</Text> Corregir datos inexactos o incompletos
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Supresión:</Text> Solicitar la eliminación de sus datos
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Limitación:</Text> Restringir el procesamiento de sus datos
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Portabilidad:</Text> Recibir sus datos en formato estructurado
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Oposición:</Text> Oponerse al procesamiento de sus datos
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>9. Seguridad</Text>
          <Text style={styles.paragraph}>
            Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales:
          </Text>
          <Text style={styles.paragraph}>
            • Cifrado de datos en tránsito y en reposo
          </Text>
          <Text style={styles.paragraph}>
            • Controles de acceso estrictos
          </Text>
          <Text style={styles.paragraph}>
            • Auditorías regulares de seguridad
          </Text>
          <Text style={styles.paragraph}>
            • Formación del personal en protección de datos
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>10. Cookies y Tecnologías Similares</Text>
          <Text style={styles.paragraph}>
            Utilizamos cookies y tecnologías similares para mejorar su experiencia en la aplicación. 
            Puede gestionar sus preferencias de cookies en la configuración de su dispositivo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>11. Menores de Edad</Text>
          <Text style={styles.paragraph}>
            Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente 
            datos personales de menores de edad.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>12. Cambios en esta Política</Text>
          <Text style={styles.paragraph}>
            Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios 
            significativos a través de la aplicación o por email.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>13. Contacto</Text>
          <Text style={styles.paragraph}>
            Para ejercer sus derechos o hacer consultas sobre privacidad, contáctenos:
          </Text>
          <Text style={styles.contactInfo}>
            Email: privacy@zyro.com{'\n'}
            Teléfono: +34 91 123 4567{'\n'}
            Dirección: Calle Mayor 123, 28001 Madrid, España
          </Text>
          <Text style={styles.paragraph}>
            También puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).
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
  bold: {
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
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