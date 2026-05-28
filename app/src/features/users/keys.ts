export const userKeys = {
  all: ['users'] as const,
  devices: () => [...userKeys.all, 'devices'] as const,
};
