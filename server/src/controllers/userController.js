import httpStatus from 'http-status';
import prisma from '../prismaClient.js';

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile including devices and followed companies
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     devices:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Device'
 *                     followedCompanies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getCurrentUser = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { devices: true, followedCompanies: true }
  });

  if (!user) {
    const error = new Error('User record not found in database');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  res.status(httpStatus.OK).json(user);
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users in the system (admin/future use)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
export const getAllUsers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(httpStatus.OK).json(users);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their UUID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export const getUserById = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  res.status(httpStatus.OK).json(user);
});

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               is_experienced:
 *                 type: boolean
 *               college_name:
 *                 type: string
 *               cgpa:
 *                 type: string
 *               company_name:
 *                 type: string
 *               years_of_experience:
 *                 type: number
 *               experience_level:
 *                 type: string
 *                 enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS']
 *               resume_link:
 *                 type: string
 *                 format: uri
 *               followedCompanies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of company IDs to follow
 *             example:
 *               name: "John Doe"
 *               is_experienced: false
 *               college_name: "MIT"
 *               cgpa: "3.8"
 *               experience_level: "FRESHER_OR_LESS_THAN_1_YEAR"
 *               resume_link: "https://example.com/resume.pdf"
 *               followedCompanies: ["550e8400-e29b-41d4-a716-446655440000"]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     followedCompanies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request - Email already taken
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export const updateUser = catchAsync(async (req, res) => {
  const updateBody = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (updateBody.email && (await prisma.user.findUnique({ where: { email: updateBody.email } }))) {
    if (updateBody.email !== user.email) {
      const error = new Error('Email already taken');
      error.statusCode = httpStatus.BAD_REQUEST;
      throw error;
    }
  }

  let data = { ...updateBody };
  if (updateBody.companies) {
    delete data.companies;
    data.followedCompanies = {
      set: updateBody.companies.map((companyId) => ({ id: companyId }))
    };
  }

  if (updateBody.followedCompanies) {
    delete data.followedCompanies;
    data.followedCompanies = {
      set: updateBody.followedCompanies.map((companyId) => ({ id: companyId }))
    };
  }

  data.onboarding_completed = true;
  data.onboarding_completed_at = new Date();

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: data,
    include: { followedCompanies: true }
  });
  res.status(httpStatus.OK).json(updatedUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: Update a specific user's information (user can only update themselves)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               is_experienced:
 *                 type: boolean
 *               college_name:
 *                 type: string
 *               cgpa:
 *                 type: string
 *               company_name:
 *                 type: string
 *               years_of_experience:
 *                 type: number
 *               experience_level:
 *                 type: string
 *                 enum: ['INTERNSHIP', 'FRESHER_OR_LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS']
 *               resume_link:
 *                 type: string
 *                 format: uri
 *               segment:
 *                 type: string
 *               companies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of company IDs to follow
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     followedCompanies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request - Email already taken
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot update another user
 *       404:
 *         description: User not found
 */
export const updateUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateBody = req.body;

  if (id !== req.user.id) {
    const error = new Error('Unauthorized to update another user');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (updateBody.email && (await prisma.user.findUnique({ where: { email: updateBody.email } }))) {
    if (updateBody.email !== user.email) {
      const error = new Error('Email already taken');
      error.statusCode = httpStatus.BAD_REQUEST;
      throw error;
    }
  }

  let data = { ...updateBody };
  if (updateBody.companies) {
    delete data.companies;
    data.followedCompanies = {
      set: updateBody.companies.map((companyId) => ({ id: companyId }))
    };
  }

  if (updateBody.followedCompanies) {
    delete data.followedCompanies;
    data.followedCompanies = {
      set: updateBody.followedCompanies.map((companyId) => ({ id: companyId }))
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: data,
    include: { followedCompanies: true }
  });
  res.status(httpStatus.OK).json(updatedUser);
});

export const deleteUser = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  await prisma.user.delete({
    where: { id: req.user.id },
  });
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete a specific user (user can only delete themselves)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot delete another user
 *       404:
 *         description: User not found
 */
export const deleteUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (id !== req.user.id) {
    const error = new Error('Unauthorized to delete another user');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  await prisma.user.delete({
    where: { id },
  });
  res.status(httpStatus.NO_CONTENT).send();
});
