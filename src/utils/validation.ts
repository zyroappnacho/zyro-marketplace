import * as yup from 'yup';
import { 
  BaseUser, 
  Influencer, 
  Company, 
  Admin,
  UserRole,
  UserStatus,
  SubscriptionPlan 
} from '../types';

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateInstagramUsername = (username: string): boolean => {
  const instagramRegex = /^[a-zA-Z0-9._]+$/;
  return instagramRegex.test(username) && username.length >= 1 && username.length <= 30;
};

export const validateTikTokUsername = (username: string): boolean => {
  const tiktokRegex = /^[a-zA-Z0-9._]+$/;
  return tiktokRegex.test(username) && username.length >= 1 && username.length <= 24;
};

export const validateCIF = (cif: string): boolean => {
  const cifRegex = /^[A-Z]\d{8}$|^\d{8}[A-Z]$/;
  return cifRegex.test(cif);
};

export const validateSpanishPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
};

// Type guards
export const isInfluencer = (user: BaseUser): user is Influencer => {
  return user.role === 'influencer';
};

export const isCompany = (user: BaseUser): user is Company => {
  return user.role === 'company';
};

export const isAdmin = (user: BaseUser): user is Admin => {
  return user.role === 'admin';
};

// Validation functions for form data
export const validateInfluencerData = async (data: Partial<Influencer>): Promise<boolean> => {
  try {
    await influencerRegistrationSchema.validate(data, { abortEarly: false });
    return true;
  } catch (error) {
    console.error('Influencer validation error:', error);
    return false;
  }
};

export const validateCompanyData = async (data: Partial<Company>): Promise<boolean> => {
  try {
    await companyRegistrationSchema.validate(data, { abortEarly: false });
    return true;
  } catch (error) {
    console.error('Company validation error:', error);
    return false;
  }
};

export const validateAdminCredentials = async (credentials: { username: string; password: string }): Promise<boolean> => {
  try {
    await adminLoginSchema.validate(credentials, { abortEarly: false });
    return true;
  } catch (error) {
    console.error('Admin credentials validation error:', error);
    return false;
  }
};

// Export schemas for external use
export const influencerRegistrationSchema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .required('Nombre completo es requerido'),
  email: yup
    .string()
    .email('Email debe tener un formato válido')
    .required('Email es requerido'),
  password: yup
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .required('Contraseña es requerida'),
  instagramUsername: yup
    .string()
    .test('instagram-format', 'Usuario de Instagram debe ser válido', (value) => {
      return !value || validateInstagramUsername(value);
    })
    .optional(),
  tiktokUsername: yup
    .string()
    .test('tiktok-format', 'Usuario de TikTok debe ser válido', (value) => {
      return !value || validateTikTokUsername(value);
    })
    .optional(),
  instagramFollowers: yup
    .number()
    .min(0, 'Número de seguidores debe ser positivo')
    .integer('Número de seguidores debe ser un entero')
    .required('Número de seguidores de Instagram es requerido'),
  tiktokFollowers: yup
    .number()
    .min(0, 'Número de seguidores debe ser positivo')
    .integer('Número de seguidores debe ser un entero')
    .default(0),
  phone: yup
    .string()
    .test('spanish-phone', 'Teléfono debe tener un formato válido', (value) => {
      return !value || validateSpanishPhone(value);
    })
    .optional(),
  city: yup
    .string()
    .min(2, 'Ciudad debe tener al menos 2 caracteres')
    .required('Ciudad es requerida'),
  audienceStats: yup.object({
    countries: yup.array().of(
      yup.object({
        country: yup.string().required(),
        percentage: yup.number().min(0).max(100).required(),
      })
    ).required(),
    cities: yup.array().of(
      yup.object({
        city: yup.string().required(),
        percentage: yup.number().min(0).max(100).required(),
      })
    ).required(),
    ageRanges: yup.array().of(
      yup.object({
        range: yup.string().required(),
        percentage: yup.number().min(0).max(100).required(),
      })
    ).required(),
    monthlyStats: yup.object({
      views: yup.number().min(0).required(),
      engagement: yup.number().min(0).required(),
      reach: yup.number().min(0).required(),
    }).required(),
  }).required(),
});

export const companyRegistrationSchema = yup.object({
  companyName: yup
    .string()
    .min(2, 'Nombre de empresa debe tener al menos 2 caracteres')
    .max(100, 'Nombre de empresa no puede exceder 100 caracteres')
    .required('Nombre de empresa es requerido'),
  email: yup
    .string()
    .email('Email debe tener un formato válido')
    .required('Email es requerido'),
  password: yup
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .required('Contraseña es requerida'),
  cif: yup
    .string()
    .test('cif-format', 'CIF debe tener un formato válido', (value) => {
      return value ? validateCIF(value) : false;
    })
    .required('CIF es requerido'),
  address: yup
    .string()
    .min(10, 'Dirección debe tener al menos 10 caracteres')
    .required('Dirección es requerida'),
  phone: yup
    .string()
    .test('spanish-phone', 'Teléfono debe tener un formato válido', (value) => {
      return value ? validateSpanishPhone(value) : false;
    })
    .required('Teléfono es requerido'),
  contactPerson: yup
    .string()
    .min(2, 'Persona de contacto debe tener al menos 2 caracteres')
    .required('Persona de contacto es requerida'),
  subscription: yup.object({
    plan: yup
      .string()
      .oneOf(['3months', '6months', '12months'], 'Plan debe ser válido')
      .required('Plan de suscripción es requerido'),
  }).required(),
});

export const adminLoginSchema = yup.object({
  username: yup
    .string()
    .equals(['admin_zyrovip'], 'Usuario de administrador no válido')
    .required('Usuario es requerido'),
  password: yup
    .string()
    .equals(['xarrec-2paqra-guftoN'], 'Contraseña de administrador no válida')
    .required('Contraseña es requerida'),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email debe tener un formato válido')
    .required('Email es requerido'),
  password: yup
    .string()
    .min(1, 'Contraseña es requerida')
    .required('Contraseña es requerida'),
});