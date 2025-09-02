export default [
  // O que ignorar
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**", ".github/**"]
  },

  // Regras básicas
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off"
    }
  }
];
