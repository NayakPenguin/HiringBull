import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HiringBull API',
      version: '1.0.0',
      description: 'API documentation for HiringBull - A job posting and social media platform',
      contact: {
        name: 'HiringBull Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://hiringbull-api.scale8ai.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from Clerk authentication',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for admin operations',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            clerkId: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            img_url: { type: 'string', format: 'uri' },
            active: { type: 'boolean' },
            is_experienced: { type: 'boolean' },
            college_name: { type: 'string' },
            cgpa: { type: 'string' },
            company_name: { type: 'string' },
            years_of_experience: { type: 'number', format: 'float' },
            resume_link: { type: 'string', format: 'uri' },
            segment: { type: 'string' },
            experience_level: {
              type: 'string',
              enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS'],
            },
            onboarding_completed: { type: 'boolean' },
            onboarding_completed_at: { type: 'string', format: 'date-time' },
            promo_code: { type: 'string' },
            promo_code_used: { type: 'string' },
            tokens_left: { type: 'integer' },
            tokens_last_update: { type: 'string', format: 'date-time' },
            total_paid: { type: 'number', format: 'float' },
            last_paid: { type: 'number', format: 'float' },
            current_plan_start: { type: 'string', format: 'date-time' },
            current_plan_end: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            expiry: { type: 'string', format: 'date-time' },
            isPaid: { type: 'boolean' },
            planExpiry: { type: 'string', format: 'date-time' },
          },
        },
        Company: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            logo: { type: 'string', format: 'uri' },
            description: { type: 'string' },
            category: {
              type: 'string',
              enum: ['TECH_GIANT', 'FINTECH_GIANT', 'INDIAN_STARTUP', 'GLOBAL_STARTUP', 'YCOMBINATOR', 'MASS_HIRING', 'HFT'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            company: { type: 'string' },
            companyId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            segment: {
              type: 'string',
              enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS'],
            },
            careerpage_link: { type: 'string', format: 'uri' },
            created_by: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        SocialPost: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            imageUrl: { type: 'string', format: 'uri' },
            videoUrl: { type: 'string', format: 'uri' },
            companyId: { type: 'string', format: 'uuid' },
            segment: {
              type: 'string',
              enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS'],
            },
            platform: { type: 'string' },
            link: { type: 'string', format: 'uri' },
            likesCount: { type: 'integer' },
            commentsCount: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Device: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            token: { type: 'string' },
            platform: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            planType: {
              type: 'string',
              enum: ['ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH'],
            },
            amount: { type: 'number', format: 'float' },
            status: {
              type: 'string',
              enum: ['PENDING', 'SUCCESS', 'FAILED'],
            },
            razorpayOrderId: { type: 'string' },
            razorpayPaymentId: { type: 'string' },
            razorpaySignature: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            statusCode: { type: 'integer' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        },
        OutreachRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            companyName: { type: 'string' },
            reason: { type: 'string', description: 'Required field explaining the outreach' },
            jobId: { type: 'string', format: 'uuid' },
            resumeLink: { type: 'string', format: 'uri' },
            message: { type: 'string' },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'SENT'],
              default: 'PENDING'
            },
            createdAt: { type: 'string', format: 'date-time' },
            reviewedAt: { type: 'string', format: 'date-time' },
            sentAt: { type: 'string', format: 'date-time' },
          },
        },
        WebRegistration: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            currentPlan: {
              type: 'string',
              enum: ['ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH'],
            },
            planStart: { type: 'string', format: 'date-time' },
            planEnd: { type: 'string', format: 'date-time' },
            paidAmount: { type: 'number', format: 'float' },
            referralCode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            content: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            postId: { type: 'string', format: 'uuid' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                img_url: { type: 'string', format: 'uri' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    },
    apis: ['./src/controllers/*.js', './src/routes/*.js', './src/index.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
