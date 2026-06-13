import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        alan: {
          indigo: "#5c59f3",
          orange: "#ff9359",
          teal: "#2aa79c",
          error: "#ed4e4e",
          success: "#7fca6c",
          surface: "#f5f8fe",
          border: "#dbe2f4",
          text: {
            primary: "#282830",
            secondary: "#464754",
            muted: "#656779",
          },
        },
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
      },
      boxShadow: {
        card: "0px 1px 4px rgba(40,40,48,0.06)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
