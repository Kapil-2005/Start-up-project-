/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#f8fafc', // Slate-50 like background
                surface: '#ffffff',
                primary: '#6366f1', // Indigo-500
                secondary: '#ec4899', // Pink-500
                border: '#e2e8f0', // Slate-200
                text: '#1e293b', // Slate-800
                'text-muted': '#64748b', // Slate-500
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
                mono: ['Roboto', 'sans-serif'], // reusing mono for Roboto temporarily or just add named keys
                montserrat: ['Montserrat', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
                lato: ['Lato', 'sans-serif'],
                oswald: ['Oswald', 'sans-serif'],
                quicksand: ['Quicksand', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
