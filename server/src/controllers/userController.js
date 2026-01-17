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
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
export const getCurrentUser = catchAsync(async (req, res) => {
  let user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { devices: true, followedCompanies: true }
  });

  if (!user) {
    const error = new Error('User record not found in database');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const now = new Date();

  /**
   * =====================================
   * 🔐 FIRST-TIME TOKEN INITIALIZATION
   * =====================================
   */
  if (!user.tokens_last_update) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        tokens_left: 3,
        tokens_last_update: now
      },
      include: { devices: true, followedCompanies: true }
    });

    return res.status(httpStatus.OK).json(user);
  }

  const lastUpdate = new Date(user.tokens_last_update);

  /**
   * =====================================
   * 🔐 PRODUCTION TOKEN RENEWAL (30 DAYS)
   * =====================================
   */

  const diffInDays = Math.floor(
    (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays >= 30) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        tokens_left: 3,
        tokens_last_update: now
      },
      include: { devices: true, followedCompanies: true }
    });
  }

  /**
   * =====================================
   * 🧪 TEST TOKEN RENEWAL (2 MINUTES)
   * =====================================
   */

  // const diffInMinutes = Math.floor(
  //   (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
  // );

  // console.log('====================================');
  // console.log(
  //   'GET USER DETAILS',
  //   'diffInMinutes:',
  //   diffInMinutes,
  //   'lastUpdate:',
  //   lastUpdate.toISOString()
  // );
  // console.log('====================================');

  // if (diffInMinutes >= 2) {
  //   user = await prisma.user.update({
  //     where: { id: user.id },
  //     data: {
  //       tokens_left: 3,
  //       tokens_last_update: now
  //     },
  //     include: { devices: true, followedCompanies: true }
  //   });
  // }

  res.status(httpStatus.OK).json(user);
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
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
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
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
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
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
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Success
 *       403:
 *         description: Forbidden
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
