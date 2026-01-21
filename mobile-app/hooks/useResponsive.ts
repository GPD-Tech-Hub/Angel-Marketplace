import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Breakpoints
  const isSmallScreen = width < 375; // iPhone SE, small Android
  const isMediumScreen = width >= 375 && width < 414; // iPhone 12/13/14
  const isLargeScreen = width >= 414; // iPhone Pro Max, tablets
  const isTablet = width >= 768;

  // Responsive values
  const getResponsiveValue = <T,>(small: T, medium: T, large: T): T => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  // Padding
  const horizontalPadding = getResponsiveValue(16, 20, 24);
  const verticalPadding = getResponsiveValue(12, 16, 20);

  // Font sizes
  const headingSize = getResponsiveValue('text-3xl', 'text-4xl', 'text-4xl');
  const subheadingSize = getResponsiveValue('text-xl', 'text-2xl', 'text-2xl');
  const bodySize = getResponsiveValue('text-sm', 'text-base', 'text-base');

  // Spacing
  const spacing = {
    xs: getResponsiveValue(4, 4, 6),
    sm: getResponsiveValue(8, 10, 12),
    md: getResponsiveValue(12, 16, 20),
    lg: getResponsiveValue(16, 20, 24),
    xl: getResponsiveValue(24, 28, 32),
  };

  return {
    width,
    height,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isTablet,
    getResponsiveValue,
    horizontalPadding,
    verticalPadding,
    headingSize,
    subheadingSize,
    bodySize,
    spacing,
  };
}

export default useResponsive;
