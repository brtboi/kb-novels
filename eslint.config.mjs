import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
   { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
   { languageOptions: { globals: globals.browser } },
   { ignores: ["node_modules", ".firebase", "build"] },
   { settings: { react: { version: "detect" } } },
   pluginJs.configs.recommended,
   ...tseslint.configs.recommended,
   pluginReact.configs.flat.recommended,
   { plugins: { "react-hooks": pluginReactHooks } },
   { rules: { "react-hooks/exhaustive-deps": "warn" } }, // Ensure this is enabled
];
