package com.example.polydiff

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.content.Intent

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.example.polydiff/device_unlock"
    private var unlockCallback: UnlockCallback? = null

    interface UnlockCallback {
        fun onUnlockResult(isUnlocked: Boolean)
    }
    
    companion object {
        const val REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS = 1
    }
    
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "unlockDevice") {
                unlockCallback = object : UnlockCallback {
                    override fun onUnlockResult(isUnlocked: Boolean) {
                        result.success(isUnlocked)
                    }
                }
                DeviceUnlock.unlockDevice(this, unlockCallback!!)
            } else {
                result.notImplemented()
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS) {
            val isUnlocked = resultCode == Activity.RESULT_OK
            unlockCallback?.onUnlockResult(isUnlocked)
        }
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    object DeviceUnlock {
        fun unlockDevice(context: MainActivity, callback: UnlockCallback): Boolean {
            val keyguardManager = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            if (keyguardManager.isKeyguardSecure) {
                val intent = keyguardManager.createConfirmDeviceCredentialIntent(null, null)
                context.startActivityForResult(intent, REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS)
                return true
            } else {
                return false
            }
        }
    }
}

