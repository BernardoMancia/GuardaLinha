package com.guardalinha.app

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
}
