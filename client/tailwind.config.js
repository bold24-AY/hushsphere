/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#0dc8f2",
                secondary: "#64748b",
                dark: "#0a0c10",
                darker: "#050608",
                surface: "#161b22",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                glow: {
                    'from': { boxShadow: '0 0 10px -10px #0dc8f2' },
                    'to': { boxShadow: '0 0 20px 5px rgba(13, 200, 242, 0.3)' },
                }
            }
        },
    },
    plugins: [],
}
