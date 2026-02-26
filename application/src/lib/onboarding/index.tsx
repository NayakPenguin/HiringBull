import { create } from 'zustand';

import { resetUser, type UserInfo } from '@/features/users';

import { storage } from '../storage';
import { createSelectors } from '../utils';

const ONBOARDING_COMPLETED_KEY = 'ONBOARDING_COMPLETED';
const IS_SUBSCRIBED_KEY = 'IS_SUBSCRIBED';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
  isSubscribed: boolean;
  completeOnboarding: () => void;
  subscribe: () => void;
  reset: () => Promise<void>;
  hydrate: () => void;
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo) => void;
};

const _useOnboarding = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: false,
  isSubscribed: false,
  userInfo: null,

  completeOnboarding: () => {
    storage.set(ONBOARDING_COMPLETED_KEY, true);
    set({ hasCompletedOnboarding: true });
  },

  subscribe: () => {
    storage.set(IS_SUBSCRIBED_KEY, true);
    set({ isSubscribed: true });
  },

  reset: async () => {
    storage.delete(ONBOARDING_COMPLETED_KEY);
    storage.delete(IS_SUBSCRIBED_KEY);
    set({ hasCompletedOnboarding: false, isSubscribed: false });
    set({ userInfo: null });
    try {
      await resetUser();
    } catch (e) {
      console.warn('Failed to remove device', e);
    }
  },

  hydrate: () => {
    const hasCompletedOnboarding =
      storage.getBoolean(ONBOARDING_COMPLETED_KEY) ?? false;
    const isSubscribed = storage.getBoolean(IS_SUBSCRIBED_KEY) ?? false;
    set({ hasCompletedOnboarding, isSubscribed });
  },

  setUserInfo: (userInfo: UserInfo) => {
    set({ userInfo });
  },
}));

export const useOnboarding = createSelectors(_useOnboarding);

export const completeOnboarding = () =>
  _useOnboarding.getState().completeOnboarding();
export const subscribe = () => _useOnboarding.getState().subscribe();
export const resetOnboarding = () => _useOnboarding.getState().reset();
export const hydrateOnboarding = () => _useOnboarding.getState().hydrate();
export const updateUserInfo = (userInfo: UserInfo) =>
  _useOnboarding.getState().setUserInfo(userInfo);
