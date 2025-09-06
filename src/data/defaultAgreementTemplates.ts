import { AgreementTemplate } from '../types';

export const DEFAULT_AGREEMENT_TEMPLATES: Omit<AgreementTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  {
    title: 'Acuerdo de Colaboración - Restaurante',
    category: 'collaboration',
    isActive: true,
    variables: ['nombre_influencer', 'nombre_restaurante', 'fecha_visita', 'numero_acompanantes', 'contenido_requerido'],
    content: `ACUERDO DE COLABORACIÓN - RESTAURANTE

Estimado/a {{nombre_influencer}},

Nos complace confirmar tu colaboración con {{nombre_restaurante}} para el día {{fecha_visita}}.

DETALLES DE LA COLABORACIÓN:
- Influencer: {{nombre_influencer}}
- Restaurante: {{nombre_restaurante}}
- Fecha de visita: {{fecha_visita}}
- Número de acompañantes: {{numero_acompanantes}}
- Contenido requerido: {{contenido_requerido}}

COMPROMISOS DEL INFLUENCER:
1. Asistir puntualmente a la cita programada
2. Crear y publicar el contenido acordado dentro de las 72 horas posteriores a la visita
3. Mencionar al restaurante de manera positiva y auténtica
4. Etiquetar correctamente al establecimiento en las publicaciones

COMPROMISOS DEL RESTAURANTE:
1. Proporcionar la experiencia gastronómica acordada sin costo
2. Atender de manera profesional al influencer y acompañantes
3. Facilitar la creación de contenido (permitir fotos/videos)

CONDICIONES GENERALES:
- Esta colaboración se basa en intercambio de servicios, no hay compensación monetaria
- El incumplimiento de los compromisos puede resultar en la cancelación de futuras colaboraciones
- Cualquier cambio debe ser comunicado con al menos 24 horas de anticipación

¡Esperamos que disfrutes de esta experiencia!

Equipo Zyro`
  },

  {
    title: 'Acuerdo de Colaboración - Producto/Servicio',
    category: 'collaboration',
    isActive: true,
    variables: ['nombre_influencer', 'nombre_empresa', 'producto_servicio', 'direccion_envio', 'contenido_requerido'],
    content: `ACUERDO DE COLABORACIÓN - PRODUCTO/SERVICIO

Estimado/a {{nombre_influencer}},

Confirmamos tu colaboración con {{nombre_empresa}} para promocionar {{producto_servicio}}.

DETALLES DE LA COLABORACIÓN:
- Influencer: {{nombre_influencer}}
- Empresa: {{nombre_empresa}}
- Producto/Servicio: {{producto_servicio}}
- Dirección de envío: {{direccion_envio}}
- Contenido requerido: {{contenido_requerido}}

COMPROMISOS DEL INFLUENCER:
1. Crear contenido auténtico y de calidad sobre el producto/servicio
2. Publicar el contenido acordado dentro de las 72 horas posteriores a la recepción
3. Mencionar a la marca de manera positiva y honesta
4. Cumplir con las directrices de contenido especificadas

COMPROMISOS DE LA EMPRESA:
1. Enviar el producto/servicio a la dirección especificada
2. Proporcionar información adicional si es necesaria
3. Coordinar la entrega en el horario acordado

CONDICIONES GENERALES:
- Esta colaboración se basa en intercambio de productos/servicios
- El producto debe ser utilizado/probado antes de crear el contenido
- El contenido debe cumplir con las regulaciones de publicidad en redes sociales
- Cualquier problema con el envío debe reportarse inmediatamente

¡Gracias por formar parte de Zyro!

Equipo Zyro`
  },

  {
    title: 'Confirmación de Colaboración Completada',
    category: 'collaboration',
    isActive: true,
    variables: ['nombre_influencer', 'nombre_empresa', 'fecha_completada', 'contenido_entregado'],
    content: `CONFIRMACIÓN DE COLABORACIÓN COMPLETADA

Estimado/a {{nombre_influencer}} y {{nombre_empresa}},

Nos complace confirmar que la colaboración ha sido completada exitosamente.

RESUMEN DE LA COLABORACIÓN:
- Influencer: {{nombre_influencer}}
- Empresa: {{nombre_empresa}}
- Fecha de finalización: {{fecha_completada}}
- Contenido entregado: {{contenido_entregado}}

CONFIRMACIÓN:
✅ El influencer ha cumplido con todos los compromisos acordados
✅ El contenido ha sido publicado según lo establecido
✅ La colaboración se considera completada satisfactoriamente

PRÓXIMOS PASOS:
- Esta colaboración queda registrada en el historial del influencer
- Ambas partes pueden solicitar nuevas colaboraciones en el futuro
- Cualquier feedback adicional puede ser compartido a través de este chat

¡Gracias por hacer de esta colaboración un éxito!

Equipo Zyro`
  },

  {
    title: 'Cancelación de Colaboración',
    category: 'cancellation',
    isActive: true,
    variables: ['nombre_influencer', 'nombre_empresa', 'motivo_cancelacion', 'fecha_cancelacion'],
    content: `CANCELACIÓN DE COLABORACIÓN

Estimado/a {{nombre_influencer}} y {{nombre_empresa}},

Lamentamos informar que la colaboración programada ha sido cancelada.

DETALLES DE LA CANCELACIÓN:
- Influencer: {{nombre_influencer}}
- Empresa: {{nombre_empresa}}
- Fecha de cancelación: {{fecha_cancelacion}}
- Motivo: {{motivo_cancelacion}}

ACCIONES REALIZADAS:
- La colaboración ha sido marcada como cancelada en el sistema
- No hay compromisos pendientes para ninguna de las partes
- Los espacios quedan disponibles para nuevas colaboraciones

POLÍTICA DE CANCELACIÓN:
- Las cancelaciones con menos de 24 horas de anticipación pueden afectar futuras oportunidades
- Se recomienda comunicar cualquier inconveniente lo antes posible
- Ambas partes pueden solicitar nuevas colaboraciones en el futuro

Si tienes alguna pregunta sobre esta cancelación, no dudes en contactarnos.

Equipo Zyro`
  },

  {
    title: 'Recordatorio de Contenido Pendiente',
    category: 'general',
    isActive: true,
    variables: ['nombre_influencer', 'nombre_empresa', 'contenido_pendiente', 'fecha_limite'],
    content: `RECORDATORIO - CONTENIDO PENDIENTE

Estimado/a {{nombre_influencer}},

Este es un recordatorio amigable sobre el contenido pendiente de tu colaboración con {{nombre_empresa}}.

DETALLES PENDIENTES:
- Contenido requerido: {{contenido_pendiente}}
- Fecha límite: {{fecha_limite}}
- Estado actual: Pendiente de publicación

RECORDATORIO:
Según nuestro acuerdo, el contenido debe ser publicado dentro de las 72 horas posteriores a la experiencia. Te pedimos que publiques el contenido lo antes posible para cumplir con los compromisos establecidos.

CONTENIDO REQUERIDO:
- 2 historias de Instagram (una debe ser en video) O 1 video de TikTok
- Mencionar y etiquetar correctamente al establecimiento
- Mostrar de manera auténtica la experiencia vivida

Si tienes algún inconveniente para cumplir con este compromiso, por favor comunícate con nosotros inmediatamente.

¡Gracias por tu colaboración!

Equipo Zyro`
  },

  {
    title: 'Bienvenida a Nueva Conversación',
    category: 'general',
    isActive: true,
    variables: ['nombre_participante', 'tipo_colaboracion'],
    content: `¡BIENVENIDO/A A ZYRO!

Hola {{nombre_participante}},

Te damos la bienvenida a esta conversación sobre tu {{tipo_colaboracion}}.

SOBRE ESTA CONVERSACIÓN:
- Aquí podrás comunicarte directamente con todas las partes involucradas
- Recibirás actualizaciones importantes sobre el estado de tu colaboración
- Podrás hacer preguntas y recibir respuestas rápidas

CÓMO FUNCIONA:
1. Mantén esta conversación activa para recibir notificaciones
2. Responde a los mensajes de manera oportuna
3. Comparte cualquier duda o comentario que tengas
4. Confirma la recepción de información importante

NUESTRO COMPROMISO:
- Respuesta rápida a tus consultas
- Transparencia en todo el proceso
- Soporte continuo durante la colaboración

¡Estamos aquí para ayudarte a tener la mejor experiencia posible!

Equipo Zyro`
  }
];

export const initializeDefaultTemplates = async (adminId: string, chatService: any) => {
  try {
    console.log('Initializing default agreement templates...');
    
    for (const template of DEFAULT_AGREEMENT_TEMPLATES) {
      await chatService.createAgreementTemplate(
        template.title,
        template.content,
        template.variables,
        template.category,
        adminId
      );
    }
    
    console.log('Default agreement templates initialized successfully');
  } catch (error) {
    console.error('Error initializing default templates:', error);
  }
};