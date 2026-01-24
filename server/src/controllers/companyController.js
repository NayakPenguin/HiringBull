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

    // Fetch directly from external API
    try {
        const response = await fetch('https://api.hiringbull.org/api/companies');
        if (!response.ok) {
            throw new Error(`External API error: ${response.status}`);
        }
        
        const externalCompanies = await response.json();
        
        res.status(httpStatus.OK).json(externalCompanies);
    } catch (error) {
        console.error('Error fetching from external API:', error);
        // Return empty array if external API fails
        res.status(httpStatus.OK).json([]);
    }
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a company (admin)
 *     tags: [Companies]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Company exists
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
 *     summary: Bulk create companies (admin)
 *     tags: [Companies]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companies]
 *     responses:
 *       201:
 *         description: Created
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
 *     summary: Update a company (admin)
 *     tags: [Companies]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
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
 *     summary: Bulk update companies (admin)
 *     tags: [Companies]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companies]
 *     responses:
 *       200:
 *         description: Success
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
