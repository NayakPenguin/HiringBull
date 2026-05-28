/**
 * Expo Config Plugin: CMake Path Fix for Windows
 *
 * Windows has a 260-character path limit. CMake builds for native modules
 * (react-native-mmkv, react-native-nitro-modules, react-native-iap, etc.)
 * generate deeply nested output paths that exceed this limit, causing build
 * failures like:
 *
 *   "The filename or extension is too long"
 *
 * This plugin injects `externalNativeBuild.cmake.buildStagingDirectory`
 * into android/app/build.gradle to use a short path (C:/hb-cxx) instead.
 *
 * On macOS/Linux this line is harmless — Gradle ignores it if CMake isn't
 * hitting path limits.
 */
const { withAppBuildGradle } = require('expo/config-plugins');

function withCmakePathFix(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    const cmakeFix = [
      '    // Windows 260-char path limit fix for CMake builds',
      '    externalNativeBuild {',
      '        cmake {',
      '            buildStagingDirectory = file("C:/hb-cxx")',
      '        }',
      '    }',
    ].join('\n');

    // Only add if not already present
    if (!buildGradle.includes('buildStagingDirectory')) {
      // Insert at the top of the android { } block, right after ndkVersion
      config.modResults.contents = buildGradle.replace(
        /(ndkVersion\s+.*)/,
        `$1\n\n${cmakeFix}`
      );
    }

    return config;
  });
}

module.exports = withCmakePathFix;
