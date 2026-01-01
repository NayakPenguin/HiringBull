import prisma from '../prismaClient.js';
import httpStatus from 'http-status';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Get all companies with optional category filtering
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
 * Create a single company
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
 * Bulk create companies (internal use)
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
 * Update a single company
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
 * Bulk update companies
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
