/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        extend: {
            minWidth: {
                tab: "100px",
            },
        },
    },
    plugins: [],
}
