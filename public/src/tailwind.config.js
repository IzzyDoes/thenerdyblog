/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        'xs': '475px',     // Custom extra small breakpoint
        'sm': '640px',     // Small devices (already included by default)
        'md': '768px',     // Medium devices (already included by default)
        'lg': '1024px',    // Large devices (already included by default)
        'xl': '1280px',    // Extra large devices (already included by default)
        '2xl': '1536px',   // 2x Extra large devices (already included by default)
        '3xl': '1920px',   // Custom 3x Extra large breakpoint
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

