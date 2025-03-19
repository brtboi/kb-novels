module.exports = {
   env: {
      browser: true,
      es2021: true, // Add ES2021 environment support
   },
   extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
   ],
   plugins: ["react-hooks", "@typescript-eslint"],
   rules: {
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-expressions": [
         "warn",
         { allowShortCircuit: true },
      ],
   },
   ignorePatterns: [
      "node_modules/",
      "build/",
      "functions/",
      "public/",
      ".eslintrc.js",
   ],
   overrides: [
      {
         files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
         excludedFiles: ["node_modules", ".firebase", "build", "functions"],
         settings: {
            react: {
               version: "detect",
            },
         },
      },
   ],
};
