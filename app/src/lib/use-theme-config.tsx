import type { Theme } from 'expo-router/react-navigation';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from 'expo-router/react-navigation';
import { useColorScheme } from 'nativewind';

import colors from '@/components/ui/colors';

const DARK_MODE_ENABLED = true;

const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary[200],
    background: colors.charcoal[950],
    text: colors.charcoal[100],
    border: colors.charcoal[500],
    card: colors.charcoal[850],
  },
};

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[500],
    background: colors.white,
  },
};

export function useThemeConfig() {
  const { colorScheme } = useColorScheme();

  if (DARK_MODE_ENABLED && colorScheme === 'dark') {
    return DarkTheme;
  }

  return LightTheme;
}
