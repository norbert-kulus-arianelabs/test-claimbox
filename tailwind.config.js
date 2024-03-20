import { colors } from './colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: colors.black,
        white: colors.white,
        gray: colors.gray,
        primary: colors.primary,
        secondary: colors.secondary,
        error: colors.error,
        warning: colors.warning,
        textDefault: colors.textDefault,
        hover: colors.hover,
        backdrop: colors.backdrop,
        disabled: colors.disabled,
      },
    },
  },
  plugins: [],
}
