export default ({ config }) => {
  const isDevBuild = process.env.EAS_BUILD_PROFILE === 'development'

  return {
    ...config,

    name: isDevBuild ? 'Taco Loco (DEV)' : 'Taco Loco',

    android: {
      ...config.android,
      package: isDevBuild
        ? 'com.signemammoth.tacoloco.dev'
        : 'com.signemammoth.tacoloco'
    },

    ios: {
      ...config.ios,
      bundleIdentifier: isDevBuild
        ? 'com.signemammoth.tacoloco.dev'
        : 'com.signemammoth.tacoloco'
    }
  }
}
