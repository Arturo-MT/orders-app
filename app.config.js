export default ({ config }) => {
  const variant =
    process.env.APP_VARIANT || process.env.EAS_BUILD_PROFILE || 'production'

  const isDev = variant === 'development'
  const isBeta = variant === 'beta'

  return {
    ...config,

    name: isBeta ? 'Taco Loco (BETA)' : isDev ? 'Taco Loco (DEV)' : 'Taco Loco',

    android: {
      ...config.android,
      package: isBeta
        ? 'com.signemammoth.tacoloco.beta'
        : isDev
          ? 'com.signemammoth.tacoloco.dev'
          : 'com.signemammoth.tacoloco'
    },

    ios: {
      ...config.ios,
      bundleIdentifier: isBeta
        ? 'com.signemammoth.tacoloco.beta'
        : isDev
          ? 'com.signemammoth.tacoloco.dev'
          : 'com.signemammoth.tacoloco'
    }
  }
}
