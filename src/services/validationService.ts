import * as Yup from 'yup';
import { databaseService } from '../database';
import { 
  UserRole, 
  CampaignCategory, 
  SubscriptionPlan,
  CollaborationStatus 
} from '../types';

/**
 * Validation service with database integration
 */
export class ValidationService {
  /**
   * User registration validation schema
   */
  static getUserRegistrationSchema() {
    return Yup.object({
      email: Yup.string()
        .email('Invalid email format')
        .required('Email is required')
        .test('unique-email', 'Email already exists', async (value) => {
          if (!value) return true;
          const existingUser = await databaseService.users.findByEmail(value);
          return !existingUser;
        }),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .required('Password is required'),
      role: Yup.string()
        .oneOf(['influencer', 'company'] as UserRole[], 'Invalid role')
        .required('Role is required')
    });
  }

  /**
   * Influencer profile validation schema
   */
  static getInfluencerProfileSchema() {
    return Yup.object({
      fullName: Yup.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must be less than 100 characters')
        .required('Full name is required'),
      instagramUsername: Yup.string()
        .matches(/^[a-zA-Z0-9._]+$/, 'Invalid Instagram username format')
        .min(1, 'Instagram username is required')
        .max(30, 'Instagram username must be less than 30 characters'),
      tiktokUsername: Yup.string()
        .matches(/^[a-zA-Z0-9._]+$/, 'Invalid TikTok username format')
        .max(24, 'TikTok username must be less than 24 characters'),
      instagramFollowers: Yup.number()
        .min(0, 'Instagram followers must be 0 or greater')
        .max(1000000000, 'Instagram followers seems too high')
        .required('Instagram followers count is required'),
      tiktokFollowers: Yup.number()
        .min(0, 'TikTok followers must be 0 or greater')
        .max(1000000000, 'TikTok followers seems too high')
        .default(0),
      phone: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
      city: Yup.string()
        .min(2, 'City must be at least 2 characters')
        .max(50, 'City must be less than 50 characters')
        .required('City is required'),
      audienceStats: Yup.object({
        countries: Yup.array()
          .of(
            Yup.object({
              country: Yup.string().required(),
              percentage: Yup.number().min(0).max(100).required()
            })
          )
          .required(),
        cities: Yup.array()
          .of(
            Yup.object({
              city: Yup.string().required(),
              percentage: Yup.number().min(0).max(100).required()
            })
          )
          .required(),
        ageRanges: Yup.array()
          .of(
            Yup.object({
              range: Yup.string().required(),
              percentage: Yup.number().min(0).max(100).required()
            })
          )
          .required(),
        monthlyStats: Yup.object({
          views: Yup.number().min(0).required(),
          engagement: Yup.number().min(0).required(),
          reach: Yup.number().min(0).required()
        }).required()
      }).required()
    });
  }

  /**
   * Company profile validation schema
   */
  static getCompanyProfileSchema() {
    return Yup.object({
      companyName: Yup.string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must be less than 100 characters')
        .required('Company name is required'),
      cif: Yup.string()
        .matches(/^[A-Z]\d{8}$/, 'CIF must be in format A12345678')
        .required('CIF is required')
        .test('unique-cif', 'CIF already exists', async (value) => {
          if (!value) return true;
          const existingCompany = await databaseService.companies.findByCif(value);
          return !existingCompany;
        }),
      address: Yup.string()
        .min(10, 'Address must be at least 10 characters')
        .max(200, 'Address must be less than 200 characters')
        .required('Address is required'),
      phone: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
        .required('Phone is required'),
      contactPerson: Yup.string()
        .min(2, 'Contact person must be at least 2 characters')
        .max(100, 'Contact person must be less than 100 characters')
        .required('Contact person is required'),
      subscription: Yup.object({
        plan: Yup.string()
          .oneOf(['3months', '6months', '12months'] as SubscriptionPlan[], 'Invalid subscription plan')
          .required('Subscription plan is required'),
        price: Yup.number()
          .min(0, 'Price must be positive')
          .required('Price is required'),
        startDate: Yup.date()
          .required('Start date is required'),
        endDate: Yup.date()
          .min(Yup.ref('startDate'), 'End date must be after start date')
          .required('End date is required')
      }).required()
    });
  }

  /**
   * Campaign validation schema
   */
  static getCampaignSchema() {
    return Yup.object({
      title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must be less than 100 characters')
        .required('Title is required'),
      description: Yup.string()
        .min(20, 'Description must be at least 20 characters')
        .max(1000, 'Description must be less than 1000 characters')
        .required('Description is required'),
      businessName: Yup.string()
        .min(2, 'Business name must be at least 2 characters')
        .max(100, 'Business name must be less than 100 characters')
        .required('Business name is required'),
      category: Yup.string()
        .oneOf([
          'restaurantes', 'movilidad', 'ropa', 'eventos', 
          'delivery', 'salud-belleza', 'alojamiento', 'discotecas'
        ] as CampaignCategory[], 'Invalid category')
        .required('Category is required'),
      city: Yup.string()
        .min(2, 'City must be at least 2 characters')
        .max(50, 'City must be less than 50 characters')
        .required('City is required'),
      address: Yup.string()
        .min(10, 'Address must be at least 10 characters')
        .max(200, 'Address must be less than 200 characters')
        .required('Address is required'),
      coordinates: Yup.object({
        lat: Yup.number()
          .min(-90, 'Latitude must be between -90 and 90')
          .max(90, 'Latitude must be between -90 and 90')
          .required('Latitude is required'),
        lng: Yup.number()
          .min(-180, 'Longitude must be between -180 and 180')
          .max(180, 'Longitude must be between -180 and 180')
          .required('Longitude is required')
      }).required(),
      images: Yup.array()
        .of(Yup.string().url('Invalid image URL'))
        .min(1, 'At least one image is required')
        .max(10, 'Maximum 10 images allowed')
        .required('Images are required'),
      requirements: Yup.object({
        minInstagramFollowers: Yup.number()
          .min(0, 'Minimum Instagram followers must be 0 or greater'),
        minTiktokFollowers: Yup.number()
          .min(0, 'Minimum TikTok followers must be 0 or greater'),
        maxCompanions: Yup.number()
          .min(0, 'Maximum companions must be 0 or greater')
          .max(10, 'Maximum companions cannot exceed 10')
          .required('Maximum companions is required')
      }).required(),
      whatIncludes: Yup.array()
        .of(Yup.string().min(1, 'Include item cannot be empty'))
        .min(1, 'At least one include item is required')
        .required('What includes is required'),
      contentRequirements: Yup.object({
        instagramStories: Yup.number()
          .min(0, 'Instagram stories must be 0 or greater')
          .max(10, 'Instagram stories cannot exceed 10')
          .required('Instagram stories requirement is required'),
        tiktokVideos: Yup.number()
          .min(0, 'TikTok videos must be 0 or greater')
          .max(5, 'TikTok videos cannot exceed 5')
          .required('TikTok videos requirement is required'),
        deadline: Yup.number()
          .min(24, 'Deadline must be at least 24 hours')
          .max(168, 'Deadline cannot exceed 168 hours (1 week)')
          .required('Deadline is required')
      }).required()
    });
  }

  /**
   * Collaboration request validation schema
   */
  static getCollaborationRequestSchema() {
    return Yup.object({
      proposedContent: Yup.string()
        .min(20, 'Proposed content must be at least 20 characters')
        .max(500, 'Proposed content must be less than 500 characters')
        .required('Proposed content is required'),
      reservationDetails: Yup.object({
        date: Yup.date()
          .min(new Date(), 'Reservation date must be in the future')
          .required('Reservation date is required'),
        time: Yup.string()
          .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
          .required('Reservation time is required'),
        companions: Yup.number()
          .min(0, 'Companions must be 0 or greater')
          .max(10, 'Companions cannot exceed 10')
          .required('Number of companions is required'),
        specialRequests: Yup.string()
          .max(200, 'Special requests must be less than 200 characters')
      }).when('deliveryDetails', {
        is: (deliveryDetails: any) => !deliveryDetails,
        then: (schema) => schema.required('Reservation details are required for non-delivery campaigns'),
        otherwise: (schema) => schema.notRequired()
      }),
      deliveryDetails: Yup.object({
        address: Yup.string()
          .min(10, 'Delivery address must be at least 10 characters')
          .max(200, 'Delivery address must be less than 200 characters')
          .required('Delivery address is required'),
        phone: Yup.string()
          .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
          .required('Phone is required'),
        preferredTime: Yup.string()
          .max(100, 'Preferred time must be less than 100 characters')
          .required('Preferred delivery time is required')
      }).when('reservationDetails', {
        is: (reservationDetails: any) => !reservationDetails,
        then: (schema) => schema.required('Delivery details are required for delivery campaigns'),
        otherwise: (schema) => schema.notRequired()
      })
    });
  }

  /**
   * Validate data against schema
   */
  static async validate<T>(schema: Yup.Schema<T>, data: any): Promise<{
    isValid: boolean;
    data?: T;
    errors?: Record<string, string>;
  }> {
    try {
      const validatedData = await schema.validate(data, { abortEarly: false });
      return {
        isValid: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        return {
          isValid: false,
          errors
        };
      }
      throw error;
    }
  }

  /**
   * Validate user credentials
   */
  static async validateCredentials(email: string, password: string): Promise<{
    isValid: boolean;
    user?: any;
    error?: string;
  }> {
    try {
      const user = await databaseService.users.verifyPassword(email, password);
      if (!user) {
        return {
          isValid: false,
          error: 'Invalid email or password'
        };
      }

      if (user.status !== 'approved') {
        return {
          isValid: false,
          error: 'Account is not approved yet'
        };
      }

      return {
        isValid: true,
        user
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Validate influencer eligibility for campaign
   */
  static validateInfluencerEligibility(
    influencerFollowers: { instagram: number; tiktok: number },
    campaignRequirements: { minInstagramFollowers?: number; minTiktokFollowers?: number }
  ): { isEligible: boolean; reason?: string } {
    const { minInstagramFollowers, minTiktokFollowers } = campaignRequirements;

    if (minInstagramFollowers && influencerFollowers.instagram < minInstagramFollowers) {
      return {
        isEligible: false,
        reason: `Requires at least ${minInstagramFollowers} Instagram followers`
      };
    }

    if (minTiktokFollowers && influencerFollowers.tiktok < minTiktokFollowers) {
      return {
        isEligible: false,
        reason: `Requires at least ${minTiktokFollowers} TikTok followers`
      };
    }

    return { isEligible: true };
  }
}

export const validationService = ValidationService;