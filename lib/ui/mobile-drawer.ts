export function shouldDismissMobileDrawer(
  mobilePresent: boolean,
  desktopViewportMatches: boolean
) {
  return mobilePresent && desktopViewportMatches;
}
