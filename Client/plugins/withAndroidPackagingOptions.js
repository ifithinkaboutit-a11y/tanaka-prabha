const {
  withAppBuildGradle,
  withAndroidManifest,
} = require("expo/config-plugins");

/**
 * Expo config plugin to fix Android build issues:
 * 1. Exclude duplicate META-INF files (mergeReleaseJavaResource failure)
 * 2. Add tools:replace for appComponentFactory (manifest merger conflict
 *    between androidx.core and com.android.support:support-compat)
 * 3. Force-exclude old Android Support Library dependencies
 */
function withAndroidBuildFixes(config) {
  // Step 1: Fix build.gradle — packaging exclusions + force-exclude old support libs
  config = withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;

    // Add packaging block if not present
    if (!buildGradle.includes("packaging {")) {
      buildGradle = buildGradle.replace(
        /android\s*\{/,
        `android {
    packaging {
        resources {
            excludes += "META-INF/androidx.localbroadcastmanager_localbroadcastmanager.version"
            excludes += "META-INF/androidx.customview_customview.version"
            excludes += "META-INF/*.version"
        }
    }`
      );
    }

    // Add configurations block to force-exclude old support libraries
    if (!buildGradle.includes("com.android.support")) {
      buildGradle = buildGradle.replace(
        /dependencies\s*\{/,
        `configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-annotations'
    exclude group: 'com.android.support', module: 'animated-vector-drawable'
    exclude group: 'com.android.support', module: 'support-vector-drawable'
    exclude group: 'com.android.support', module: 'support-media-compat'
    exclude group: 'com.android.support', module: 'localbroadcastmanager'
    exclude group: 'com.android.support', module: 'versionedparcelable'
    exclude group: 'com.android.support', module: 'customview'
}

dependencies {`
      );
    }

    config.modResults.contents = buildGradle;
    return config;
  });

  // Step 2: Fix AndroidManifest.xml — add tools:replace for appComponentFactory
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Ensure tools namespace is declared
    if (!manifest.manifest.$["xmlns:tools"]) {
      manifest.manifest.$["xmlns:tools"] =
        "http://schemas.android.com/tools";
    }

    // Add tools:replace and the actual value for appComponentFactory
    const application = manifest.manifest.application?.[0];
    if (application) {
      application.$["android:appComponentFactory"] =
        "androidx.core.app.CoreComponentFactory";
      application.$["tools:replace"] = "android:appComponentFactory";
    }

    return config;
  });

  return config;
}

module.exports = withAndroidBuildFixes;
