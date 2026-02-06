import { useWindowDimensions } from 'react-native';

/** Minimum width to trust dimensions (avoids 0 on first paint so heading/sizes don't jump after build) */
const MIN_VALID_WIDTH = 300;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Treat unready dimensions as medium so first render matches later (no visible jump)
  const safeWidth = width >= MIN_VALID_WIDTH ? width : 375;

  // Breakpoints
  const isSmallScreen = safeWidth < 375; // iPhone SE, small Android
  const isMediumScreen = safeWidth >= 375 && safeWidth < 414; // iPhone 12/13/14
  const isLargeScreen = safeWidth >= 414; // iPhone Pro Max, tablets
  const isTablet = safeWidth >= 768;

  // Responsive values
  const getResponsiveValue = <T,>(small: T, medium: T, large: T): T => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  // Padding
  const horizontalPadding = getResponsiveValue(16, 20, 24);
  const verticalPadding = getResponsiveValue(12, 16, 20);

  // Font sizes (headings sized for clear page titles)
  const headingSize = getResponsiveValue('text-4xl', 'text-4xl', 'text-5xl');
  const subheadingSize = getResponsiveValue('text-2xl', 'text-2xl', 'text-3xl');
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
