// Global text-size presets — scale the root `html` font-size so every
// rem-based Tailwind text-* utility across the app scales proportionally,
// without touching per-component classes.
export const TEXT_SIZE_PRESETS = [
  { id: 'xs', shortLabel: 'XS', label: 'Extra Small', px: 12 },
  { id: 's', shortLabel: 'S', label: 'Small', px: 14 },
  { id: 'm', shortLabel: 'M', label: 'Medium', px: 16 },
  { id: 'l', shortLabel: 'L', label: 'Large', px: 18 },
  { id: 'xl', shortLabel: 'XL', label: 'Extra Large', px: 20 },
  { id: 'xxl', shortLabel: 'XXL', label: 'Double XL', px: 24 },
];

export const DEFAULT_TEXT_SIZE_ID = 'm';

export function getTextSizePx(sizeId) {
  const preset = TEXT_SIZE_PRESETS.find((p) => p.id === sizeId) || TEXT_SIZE_PRESETS[2];
  return preset.px;
}

export function applyTextSize(sizeId) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.fontSize = `${getTextSizePx(sizeId)}px`;
}
