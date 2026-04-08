const { withAndroidManifest } = require('@expo/config-plugins');

const withBluetoothPermissions = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const permissions = manifest['uses-permission'];

    const toAdd = [
      // Android 12+ (API 31+)
      { $: { 'android:name': 'android.permission.BLUETOOTH_CONNECT' } },
      { $: { 'android:name': 'android.permission.BLUETOOTH_SCAN' } },
      // Android < 12
      { $: { 'android:name': 'android.permission.BLUETOOTH', 'android:maxSdkVersion': '30' } },
      { $: { 'android:name': 'android.permission.BLUETOOTH_ADMIN', 'android:maxSdkVersion': '30' } },
      // Localización requerida para scan en Android < 12
      { $: { 'android:name': 'android.permission.ACCESS_FINE_LOCATION' } },
    ];

    for (const permission of toAdd) {
      const name = permission.$['android:name'];
      const alreadyExists = permissions.some((p) => p.$?.['android:name'] === name);
      if (!alreadyExists) {
        permissions.push(permission);
      }
    }

    return config;
  });
};

module.exports = withBluetoothPermissions;
