import webpack from 'webpack';

export type WebpackConfigImport = {
  /**
   * The config.
   *
   * Note:
   * All environment variables need to be loaded before using this value.
   * If you cannot guarantee that they have been, use the method `getConfig()` instead.
   */
  readonly default: webpack.Configuration;

  /**
   * Get the config.
   *
   * Note:
   * This method ensures all environment variables have been loaded before generating the config.
   */
  readonly getConfig: () => Promise<webpack.Configuration>;
}
