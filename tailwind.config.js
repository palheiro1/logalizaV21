module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        reveal: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        pop: {
          "0%": {
            transform: "scale(1)",
          },
          "75%": {
            transform: "scale(1.25)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        rankUp: {
          "0%": {
            opacity: "0.4",
            transform: "translateY(14px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        rankDown: {
          "0%": {
            opacity: "0.4",
            transform: "translateY(-14px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        reveal: "reveal 200ms forwards",
        pop: "pop 500ms ease-out forwards",
        rankUp: "rankUp 650ms ease-out forwards",
        rankDown: "rankDown 650ms ease-out forwards",
      },
    },
  },
  plugins: [],
};
