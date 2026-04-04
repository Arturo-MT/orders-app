const { withAppBuildGradle } = require('@expo/config-plugins');

const FLAVORS_MARKER = 'flavorDimensions "app"';

function buildFlavorsBlock(flavors) {
  const entries = Object.entries(flavors)
    .map(
      ([name, { applicationId, appName }]) =>
        `    ${name} {\n        dimension "app"\n        applicationId "${applicationId}"\n        resValue "string", "app_name", "${appName}"\n    }`
    )
    .join('\n\n');

  return `flavorDimensions "app"\n\nproductFlavors {\n${entries}\n}\n`;
}

const withProductFlavors = (config, options = {}) => {
  const { flavors } = options;

  if (!flavors || Object.keys(flavors).length === 0) {
    throw new Error('[withProductFlavors] options.flavors is required and cannot be empty.');
  }

  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    if (contents.includes(FLAVORS_MARKER)) {
      return config;
    }

    const flavorsBlock = buildFlavorsBlock(flavors);

    config.modResults.contents = contents.replace(
      /(\s+signingConfigs\s*\{)/,
      `\n\n${flavorsBlock}\n$1`
    );

    return config;
  });
};

module.exports = withProductFlavors;
