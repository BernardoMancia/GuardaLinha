const { withAndroidManifest } = require('@expo/config-plugins');

const withCallScreening = (config) => {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];

    if (!application.service) {
      application.service = [];
    }

    const serviceExists = application.service.some(
      (s) => s.$?.['android:name']?.includes('CallScreeningServiceImpl')
    );

    if (!serviceExists) {
      application.service.push({
        $: {
          'android:name': '.CallScreeningServiceImpl',
          'android:permission': 'android.permission.BIND_SCREENING_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: { 'android:name': 'android.telecom.CallScreeningService' },
              },
            ],
          },
        ],
      });
    }

    const permissions = manifest.manifest['uses-permission'] || [];
    const requiredPermissions = [
      'android.permission.READ_PHONE_STATE',
      'android.permission.READ_CALL_LOG',
      'android.permission.ANSWER_PHONE_CALLS',
    ];

    requiredPermissions.forEach((perm) => {
      const exists = permissions.some((p) => p.$?.['android:name'] === perm);
      if (!exists) {
        permissions.push({ $: { 'android:name': perm } });
      }
    });

    manifest.manifest['uses-permission'] = permissions;
    return config;
  });
};

module.exports = withCallScreening;
