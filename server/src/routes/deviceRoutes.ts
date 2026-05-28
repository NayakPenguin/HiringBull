import express from 'express';
import validate from '../middlewares/validate.js';
import * as deviceValidation from '../validations/deviceValidation.js';
import { requireAuth } from '../middlewares/auth.js';
import { addDevice, updateDevice, removeDevice, getDevices, addDevicePublic } from '../controllers/deviceController.js';

const router = express.Router();

// All device routes require authentication
router.post('/', requireAuth, validate(deviceValidation.addDevice), addDevice);
router.put('/', requireAuth, validate(deviceValidation.updateDevice), updateDevice);
// router.post('/public', validate(deviceValidation.addDevicePublic), addDevicePublic);
// router.get('/', requireAuth, getDevices);
// router.delete('/:userId', requireAuth, validate(deviceValidation.removeDevice), removeDevice);
router.delete('/me', requireAuth, removeDevice);

export default router;
