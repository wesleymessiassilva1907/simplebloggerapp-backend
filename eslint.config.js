export default [
  { ignores: ["node_modules/**","dist/**","coverage/**",".github/**","eslint.config.*"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module", // <- importante
      globals: { process:"readonly", console:"readonly" }
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off"
    }
  }
];
