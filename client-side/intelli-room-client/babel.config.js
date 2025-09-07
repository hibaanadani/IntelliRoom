module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            // This maps the @ alias directly to your project's root
            "@": "./",
            // You can add more specific aliases if needed
            // example: "@components": "./components",
          },
        },
      ],
    ],
  };
};
