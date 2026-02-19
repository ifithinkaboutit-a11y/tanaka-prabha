const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin to increase the Gradle wrapper network timeout.
 *
 * EAS build servers sometimes time out when downloading the Gradle distribution
 * because the default timeout is only 10 000 ms. This plugin bumps it to
 * 120 000 ms (2 minutes) so that the download can succeed even on slower
 * connections.
 */
function withGradleNetworkTimeout(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const wrapperPropsPath = path.join(
        config.modRequest.platformProjectRoot,
        "gradle",
        "wrapper",
        "gradle-wrapper.properties"
      );

      if (fs.existsSync(wrapperPropsPath)) {
        let contents = fs.readFileSync(wrapperPropsPath, "utf-8");

        // If a networkTimeout line already exists, replace its value
        if (contents.includes("networkTimeout")) {
          contents = contents.replace(
            /networkTimeout\s*=\s*\d+/,
            "networkTimeout=120000"
          );
        } else {
          // Append the property
          contents = contents.trimEnd() + "\nnetworkTimeout=120000\n";
        }

        fs.writeFileSync(wrapperPropsPath, contents, "utf-8");
      }

      return config;
    },
  ]);
}

module.exports = withGradleNetworkTimeout;
