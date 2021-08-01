module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    ecmaVersion: "latest",
    sourceType: "module",
    extraFileExtensions: [".cjs"],
  },
  plugins: ["@typescript-eslint", "jest"],
  extends: [
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:node/recommended",
    "prettier",
  ],
  rules: {
    "node/no-missing-import": "off",
    "node/no-unpublished-import": "off",
    "no-void": ["error", { allowAsStatement: true }],
  },
};
