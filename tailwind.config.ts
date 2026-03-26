import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        space: { black: '#0a0e17', dark: '#111827', panel: '#1a1f2e', border: '#1e293b' },
        hud: { text: '#e2e8f0', muted: '#64748b', amber: '#f59e0b', green: '#22c55e', red: '#ef4444' },
      },
    },
  },
  plugins: [],
}
export default config
