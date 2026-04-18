const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const CALL_SCREENING_SERVICE = `package {{PACKAGE}}

import android.content.Context
import android.telecom.Call
import android.telecom.CallScreeningService
import org.json.JSONArray
import org.json.JSONObject

class CallScreeningServiceImpl : CallScreeningService() {

    override fun onScreenCall(callDetails: Call.Details) {
        val prefs = applicationContext.getSharedPreferences("CallBlockerPrefs", Context.MODE_PRIVATE)
        val masterEnabled = prefs.getBoolean("masterEnabled", true)
        val rulesJson = prefs.getString("rules", "[]") ?: "[]"

        val phoneNumber = callDetails.handle?.schemeSpecificPart ?: ""
        val normalized = normalizeNumber(phoneNumber)

        val response = CallResponse.Builder()

        if (masterEnabled && shouldBlock(normalized, rulesJson)) {
            response.setDisallowCall(true)
            response.setRejectCall(true)
            response.setSkipCallLog(false)
            response.setSilenceCall(true)

            logBlockedCall(applicationContext, normalized, rulesJson)
        } else {
            response.setDisallowCall(false)
        }

        respondToCall(callDetails, response.build())
    }

    private fun normalizeNumber(raw: String): String {
        var n = raw.replace(Regex("[^0-9+]"), "")
        if (n.startsWith("+")) n = n.substring(1)
        if (n.startsWith("0")) n = n.substring(1)
        return n
    }

    private fun shouldBlock(number: String, rulesJson: String): Boolean {
        val rules = JSONArray(rulesJson)
        var hasWhitelist = false
        var whitelistMatched = false

        for (i in 0 until rules.length()) {
            val rule = rules.getJSONObject(i)
            if (!rule.getBoolean("enabled")) continue

            when (rule.getString("type")) {
                "BLOCK_ALL_EXCEPT" -> {
                    hasWhitelist = true
                    val whitelist = rule.getJSONArray("whitelist")
                    for (j in 0 until whitelist.length()) {
                        if (number.endsWith(whitelist.getString(j)) || whitelist.getString(j).endsWith(number)) {
                            whitelistMatched = true
                            break
                        }
                    }
                }
                else -> {}
            }
        }

        if (hasWhitelist && whitelistMatched) return false

        for (i in 0 until rules.length()) {
            val rule = rules.getJSONObject(i)
            if (!rule.getBoolean("enabled")) continue

            val matched = when (rule.getString("type")) {
                "BLOCK_ALL" -> true

                "BLOCK_ALL_EXCEPT" -> !whitelistMatched

                "SPECIFIC_NUMBERS" -> {
                    val nums = rule.getJSONArray("numbers")
                    (0 until nums.length()).any { j ->
                        number.endsWith(nums.getString(j)) || nums.getString(j).endsWith(number)
                    }
                }

                "NUMBER_RANGE" -> {
                    val from = rule.getString("from")
                    val to = rule.getString("to")
                    try {
                        val n = number.toLong()
                        val f = from.toLong()
                        val t = to.toLong()
                        n in f..t
                    } catch (e: NumberFormatException) { false }
                }

                "NUMBER_LIST" -> {
                    val nums = rule.getJSONArray("numbers")
                    (0 until nums.length()).any { j ->
                        number.endsWith(nums.getString(j)) || nums.getString(j).endsWith(number)
                    }
                }

                "FOREIGN_CALLS" -> {
                    val allowed = rule.optString("allowedCountryCode", "55")
                    !number.startsWith(allowed) && number.length > 10
                }

                "SPECIFIC_DDD" -> {
                    val ddds = rule.getJSONArray("ddds")
                    val local = if (number.startsWith("55")) number.substring(2) else number
                    val ddd = local.take(2)
                    (0 until ddds.length()).any { j -> ddds.getString(j) == ddd }
                }

                "PREFIX" -> {
                    val prefix = rule.getString("prefix")
                    val local = if (number.startsWith("55")) number.substring(2) else number
                    local.startsWith(prefix) || number.startsWith(prefix)
                }

                "SUFFIX" -> {
                    val suffix = rule.getString("suffix")
                    number.endsWith(suffix)
                }

                else -> false
            }

            if (matched) return true
        }

        return false
    }

    private fun logBlockedCall(context: Context, number: String, rulesJson: String) {
        try {
            val prefs = context.getSharedPreferences("CallBlockerPrefs", Context.MODE_PRIVATE)
            val existingLogs = prefs.getString("blockedLogs", "[]") ?: "[]"
            val logsArray = JSONArray(existingLogs)

            val entry = JSONObject().apply {
                put("id", System.currentTimeMillis().toString())
                put("number", number)
                put("timestamp", System.currentTimeMillis())
            }

            val newLogs = JSONArray()
            newLogs.put(entry)
            for (i in 0 until minOf(logsArray.length(), 499)) {
                newLogs.put(logsArray.getJSONObject(i))
            }

            val count = prefs.getInt("blockedTodayCount", 0) + 1
            prefs.edit()
                .putString("blockedLogs", newLogs.toString())
                .putInt("blockedTodayCount", count)
                .apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}`;

const CALL_BLOCKER_MODULE = `package {{PACKAGE}}

import android.app.role.RoleManager
import android.content.Context
import android.os.Build
import com.facebook.react.bridge.*

class CallBlockerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "CallBlockerModule"

    @ReactMethod
    fun syncRules(rulesJson: String, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("CallBlockerPrefs", Context.MODE_PRIVATE)
            prefs.edit().putString("rules", rulesJson).putBoolean("masterEnabled", true).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SYNC_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun setMasterEnabled(enabled: Boolean, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("CallBlockerPrefs", Context.MODE_PRIVATE)
            prefs.edit().putBoolean("masterEnabled", enabled).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isScreeningRoleHeld(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val roleManager = reactApplicationContext.getSystemService(RoleManager::class.java)
                promise.resolve(roleManager?.isRoleHeld(RoleManager.ROLE_CALL_SCREENING) ?: false)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("ROLE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun requestScreeningRole(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val roleManager = reactApplicationContext.getSystemService(RoleManager::class.java)
                val intent = roleManager?.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
                if (intent != null) {
                    currentActivity?.startActivityForResult(intent, 1001)
                    promise.resolve(null)
                } else {
                    promise.reject("NO_INTENT", "Could not create role request intent")
                }
            } else {
                promise.reject("API_LEVEL", "CallScreeningService requires Android 10+")
            }
        } catch (e: Exception) {
            promise.reject("REQUEST_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getBlockedCount(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("CallBlockerPrefs", Context.MODE_PRIVATE)
            promise.resolve(prefs.getInt("blockedTodayCount", 0))
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }

    @ReactMethod
    fun resetBlockedCount(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("CallBlockerPrefs", Context.MODE_PRIVATE)
            prefs.edit().putInt("blockedTodayCount", 0).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
}`;

const CALL_BLOCKER_PACKAGE = `package {{PACKAGE}}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class CallBlockerPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(CallBlockerModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}`;

function getPackageName(config) {
  return config.android?.package || 'com.guardalinha.app';
}

const withCallScreeningFiles = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const packageName = getPackageName(config);
      const packagePath = packageName.replace(/\./g, '/');
      const kotlinDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        ...packagePath.split('/')
      );

      fs.mkdirSync(kotlinDir, { recursive: true });

      const files = [
        { name: 'CallScreeningServiceImpl.kt', content: CALL_SCREENING_SERVICE },
        { name: 'CallBlockerModule.kt', content: CALL_BLOCKER_MODULE },
        { name: 'CallBlockerPackage.kt', content: CALL_BLOCKER_PACKAGE },
      ];

      files.forEach(({ name, content }) => {
        const filePath = path.join(kotlinDir, name);
        const finalContent = content.replace(/\{\{PACKAGE\}\}/g, packageName);
        fs.writeFileSync(filePath, finalContent, 'utf-8');
      });

      const mainAppPath = path.join(kotlinDir, 'MainApplication.kt');
      if (fs.existsSync(mainAppPath)) {
        let mainApp = fs.readFileSync(mainAppPath, 'utf-8');
        if (!mainApp.includes('CallBlockerPackage')) {
          mainApp = mainApp.replace(
            /override fun getPackages\(\): List<ReactPackage> =\s*PackageList\(this\)\.packages\.apply \{/,
            `override fun getPackages(): List<ReactPackage> =\n            PackageList(this).packages.apply {\n              add(CallBlockerPackage())`
          );
          fs.writeFileSync(mainAppPath, mainApp, 'utf-8');
        }
      }

      return config;
    },
  ]);
};

const withCallScreening = (config) => {
  config = withCallScreeningFiles(config);

  config = withAndroidManifest(config, async (config) => {
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

  return config;
};

module.exports = withCallScreening;
