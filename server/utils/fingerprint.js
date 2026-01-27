import crypto from 'crypto';

export const hashDevice = (deviceId, reviewCycleId) => {
  if (!deviceId || !reviewCycleId) {
    throw new Error('Device ID and Review Cycle ID are required');
  }

  return crypto
    .createHash('sha256')
    .update(`${deviceId}:${reviewCycleId}`)
    .digest('hex');
};

export const isValidDeviceId = (deviceId) => {
  // Device ID should be a non-empty string
  return typeof deviceId === 'string' && deviceId.trim().length > 0;
};
