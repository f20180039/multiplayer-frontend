// .eslintrc.cjs
/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.eslint.json",
      tsconfigRootDir: __dirname,
    },
    ignorePatterns: ["node_modules/", "dist/", "build/", "*.config.js"],
    plugins: [
      "react",
      "react-hooks",
      "@typescript-eslint",
      "jsx-a11y",
      "import",
      "prettier",
    ],
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:jsx-a11y/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:prettier/recommended",
    ],
    rules: {
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": ["error"],
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  };
  