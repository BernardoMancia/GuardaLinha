package com.guardalinha.app

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
}
