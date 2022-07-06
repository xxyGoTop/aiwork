module.exports = {
  root: true,
  env: {
    node: true
  },
  "extends": [
    "plugin:vue/essential",
    "eslint:recommended"
  ],
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-irregular-whitespace": process.env.NODE_ENV === "production" ? "warn" :"off",
    "no-useless-escape": "off",
    "vue/no-unused-vars": "off",
    "semi": [2, "never"],
    "quotes": [2, "double"],
    "indent": ["error", 2],
  }
}
