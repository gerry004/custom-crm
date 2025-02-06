// Create a new file for color utilities
export function getColorStyles(hexColor: string | null | undefined) {
  if (!hexColor) return {};

  // Convert hex to RGB for background opacity
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
    color: hexColor,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
  };
} 