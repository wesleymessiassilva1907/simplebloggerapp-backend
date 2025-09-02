// ESLint v9 Flat Config — bem permissivo (quase tudo liberado)
export default [
  // O que não queremos analisar
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      ".github/**",
      "eslint.config.*"
    ]
  },

  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        fetch: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-console": "off",
      "no-empty": "off",
      "no-useless-catch": "off",
      "no-constant-condition": "off",
      "no-redeclare": "off",
      "prefer-const": "off",
      "eqeqeq": "off",
      "camelcase": "off"
    }
  }
];
