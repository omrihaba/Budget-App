import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    background:     '#F2F2F7',
    card:           '#FFFFFF',
    text:           '#000000',
    secondaryText:  '#8E8E93',
    separator:      '#E5E5EA',
    primary:        '#007AFF',
    green:          '#34C759',
    red:            '#FF3B30',
    orange:         '#FF9500',
    tabBar:         '#FFFFFF',
    tabBorder:      '#C6C6C8',
  },
  dark: {
    background:     '#000000',
    card:           '#1C1C1E',
    text:           '#FFFFFF',
    secondaryText:  '#8E8E93',
    separator:      '#38383A',
    primary:        '#0A84FF',
    green:          '#30D158',
    red:            '#FF453A',
    orange:         '#FF9F0A',
    tabBar:         '#1C1C1E',
    tabBorder:      '#38383A',
  },
};

export type AppColors = typeof Colors.light;

export function useColors(): AppColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
