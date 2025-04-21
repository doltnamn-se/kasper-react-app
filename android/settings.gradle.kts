
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

rootProject.name = "digitaltskydd-app"

include(":app")
include(":capacitor-android")
include(":capacitor-cordova-android-plugins")
include(":capacitor-push-notifications")
include(":capacitor-splash-screen")

project(":capacitor-android").projectDir = File("../node_modules/@capacitor/android/capacitor")
project(":capacitor-cordova-android-plugins").projectDir = File("../node_modules/@capacitor/android/capacitor-cordova-android-plugins")
project(":capacitor-push-notifications").projectDir = File("../node_modules/@capacitor/push-notifications/android")
project(":capacitor-splash-screen").projectDir = File("../node_modules/@capacitor/splash-screen/android")
