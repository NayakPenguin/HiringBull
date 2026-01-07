import prisma from '../prismaClient.js';
import httpStatus from 'http-status';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     description: Retrieve all companies with optional category filtering
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ['TECH_GIANT', 'FINTECH_GIANT', 'INDIAN_STARTUP', 'GLOBAL_STARTUP', 'YCOMBINATOR', 'MASS_HIRING', 'HFT']
 *         description: Filter by company category
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 */
export const getAllCompanies = catchAsync(async (req, res) => {
    const { category } = req.query;

    const where = {};
    if (category) {
        where.category = category;
    }

    const companies = await prisma.company.findMany({
        where,
        orderBy: { name: 'asc' },
    });

    res.status(httpStatus.OK).json(companies);
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a company
 *     description: Create a new company (admin only, requires API key)
 *     tags: [Companies]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Google"
 *               description:
 *                 type: string
 *                 example: "Technology company"
 *               logo:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/logo.png"
 *               category:
 *                 type: string
 *                 enum: ['TECH_GIANT', 'FINTECH_GIANT', 'INDIAN_STARTUP', 'GLOBAL_STARTUP', 'YCOMBINATOR', 'MASS_HIRING', 'HFT']
 *                 example: "TECH_GIANT"
 *             example:
 *               name: "Google"
 *               description: "Technology company"
 *               logo: "https://example.com/logo.png"
 *               category: "TECH_GIANT"
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request - Company already exists
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
export const createCompany = catchAsync(async (req, res) => {
    const { name, description, logo, category } = req.body;
    if (await prisma.company.findUnique({ where: { name } })) {
        res.status(httpStatus.BAD_REQUEST).json({ message: "Company already exists" });
        return;
    }
    const company = await prisma.company.create({
        data: { name, description, logo, category }
    });
    res.status(httpStatus.CREATED).json(company);
});

/**
 * @swagger
 * /api/companies/bulk:
 *   post:
 *     summary: Bulk create companies
 *     description: Create multiple companies at once (admin only, requires API key)
 *     tags: [Companies]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companies
 *             properties:
 *               companies:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Google"
 *                     description:
 *                       type: string
 *                       example: "Technology company"
 *                     logo:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/logo.png"
 *                     category:
 *                       type: string
 *                       enum: ['TECH_GIANT', 'FINTECH_GIANT', 'INDIAN_STARTUP', 'GLOBAL_STARTUP', 'YCOMBINATOR', 'MASS_HIRING', 'HFT']
 *                       example: "TECH_GIANT"
 *             example:
 *               companies:
 *                 - name: "Google"
 *                   description: "Technology company"
 *                   logo: "https://example.com/logo.png"
 *                   category: "TECH_GIANT"
 *                 - name: "Stripe"
 *                   description: "Payment processing"
 *                   logo: "https://example.com/stripe.png"
 *                   category: "FINTECH_GIANT"
 *     responses:
 *       201:
 *         description: Companies created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                   description: Number of created companies
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
export const bulkCreateCompanies = catchAsync(async (req, res) => {
    const { companies } = req.body;

    const count = await prisma.company.createMany({
        data: companies,
        skipDuplicates: true,
    });

    res.status(httpStatus.CREATED).json({
        message: "Bulk insert completed",
        count: count.count
    });
});

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update a company
 *     description: Update an existing company (admin only, requires API key)
 *     tags: [Companies]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Company UUID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Google LLC"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               logo:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/new-logo.png"
 *               category:
 *                 type: string
 *                 enum: ['TECH_GIANT', 'FINTECH_GIANT', 'INDIAN_STARTUP', 'GLOBAL_STARTUP', 'YCOMBINATOR', 'MASS_HIRING', 'HFT']
 *                 example: "TECH_GIANT"
 *             example:
 *               name: "Google LLC"
 *               description: "Updated description"
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request - Company name already exists
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 *       404:
 *         description: Company not found
 */
export const updateCompany = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, description, logo, category } = req.body;

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
        return res.status(httpStatus.NOT_FOUND).json({ message: "Company not found" });
    }

    if (name && name !== company.name) {
        if (await prisma.company.findUnique({ where: { name } })) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Company name already exists" });
        }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (category !== undefined) updateData.category = category;

    const updatedCompany = await prisma.company.update({
        where: { id },
        data: updateData,
    });

    res.status(httpStatus.OK).json(updatedCompany);
});

/**
 * @swagger
 * /api/companies/bulk:
 *   put:
 *     summary: Bulk update companies
 *     description: Update multiple companies by name (admin only, requires API key)
 *     tags: [Companies]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companies
 *             properties:
 *               companies:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Company name to identify the record
 *                       example: "Google"
 *                     description:
 *                       type: string
 *                       example: "Updated description"
 *                     logo:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/new-logo.png"
 *                     category:
 *                       type: string
 *                       enum: ['TECH_GIANT', 'FINTECH_GIANT', 'INDIAN_STARTUP', 'GLOBAL_STARTUP', 'YCOMBINATOR', 'MASS_HIRING', 'HFT']
 *                       example: "TECH_GIANT"
 *             example:
 *               companies:
 *                 - name: "Google"
 *                   description: "Updated Google description"
 *                 - name: "Stripe"
 *                   logo: "https://example.com/new-stripe.png"
 *     responses:
 *       200:
 *         description: Bulk update completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 success:
 *                   type: integer
 *                   description: Number of successfully updated companies
 *                 failures:
 *                   type: integer
 *                   description: Number of failed updates
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       error:
 *                         type: string
 *                       data:
 *                         $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
export const bulkUpdateCompanies = catchAsync(async (req, res) => {
    const { companies } = req.body;

    const results = await Promise.all(
        companies.map(async ({ name, ...updateData }) => {
            try {
                const company = await prisma.company.findUnique({ where: { name } });
                if (!company) {
                    return { name, success: false, error: "Company not found" };
                }

                const updated = await prisma.company.update({
                    where: { name },
                    data: updateData,
                });

                return { name, success: true, data: updated };
            } catch (error) {
                return { name, success: false, error: error.message };
            }
        })
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.status(httpStatus.OK).json({
        message: "Bulk update completed",
        total: results.length,
        success: successCount,
        failures: failureCount,
        results
    });
});
