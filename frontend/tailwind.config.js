/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro con clase
  theme: {
    extend: {
      colors: {
        // Colores de la Universidad Autónoma de Chile
        'uach-red': {
          50: '#fee2e2',
          100: '#fecaca',
          200: '#fca5a5',
          300: '#f87171',
          400: '#ef4444',
          500: '#dc2626', // Rojo principal
          600: '#b91c1c', // Rojo más oscuro
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
        },
        'uach-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151', // Gris oscuro principal
          800: '#1f2937', // Gris muy oscuro
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}

