/**
 * Settings for Babel.
 */

 module.exports = (api) => {
  const presets = [
    [
      "@babel/env"
    ],
    "@babel/react"
  ];

  const plugins = [
    '@babel/plugin-syntax-dynamic-import'
  ];

  api.cache(true);

  return {
    presets,
    plugins
  };
}
