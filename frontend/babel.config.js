/**
 * Settings for Babel.
 */

 module.exports = (api) => {
  const presets = [
    [
      "@babel/env"
      // , {
      //   "useBuiltIns": "usage"
      // }
    ],
    "@babel/react"
  ];

  const plugins = [];

  api.cache(true);

  return {
    presets,
    plugins
  };
}
