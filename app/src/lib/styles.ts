/**
 * Design tokens — reusable Tailwind class presets for consistent styling.
 */

export const btn = {
  primary:
    "px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
  secondary:
    "px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
  ghost:
    "px-3 py-2 rounded text-gray-600 text-sm hover:bg-gray-100 hover:text-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
  danger:
    "px-4 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
  sm: {
    primary:
      "px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
    secondary:
      "px-3 py-1.5 rounded text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
    ghost:
      "px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
    danger:
      "px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
  },
  icon: {
    base: "p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
    danger:
      "p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
  },
} as const;

export const badge = {
  info: "px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700",
  warning: "px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700",
  neutral: "px-1.5 py-0.5 rounded-full text-[10px] bg-gray-200 text-gray-700",
} as const;

export const input = {
  base: "w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:outline-none transition-colors",
  select:
    "w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:outline-none transition-colors",
} as const;

export const panel = {
  resizeHandle: "w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors",
} as const;

export const tab = {
  base: "px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
  active: "text-blue-600 border-b-2 border-blue-600 bg-white",
  inactive: "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
} as const;
