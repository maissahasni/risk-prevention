/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                industrial: {
                    900: '#0f172a', // Slate 900
                    800: '#1e293b', // Slate 800
                    700: '#334155', // Slate 700
                },
                neon: {
                    500: '#10b981', // Emerald 500
                    400: '#34d399', // Emerald 400
                }
            }
        },
    },
    plugins: [],
}
