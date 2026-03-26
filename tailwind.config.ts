import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#FFFBF5', 100: '#F5F0EA', 200: '#E8E0D8' },
        warm: { text: '#1A1A1A', muted: '#6B7280', accent: '#B45309' },
      },
    },
  },
  plugins: [],
}
export default config
