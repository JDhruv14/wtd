import eslintConfigPrettier from "eslint-config-prettier/flat";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextCoreWebVitals,
  {
    files: [
      "src/components/animate-ui/primitives/animate/slot.tsx",
      "src/components/animate-ui/primitives/animate/tooltip.tsx",
    ],
    rules: {
      "react-hooks/static-components": "off",
      "react-hooks/refs": "off",
    },
  },
  eslintConfigPrettier,
];

export default config;
