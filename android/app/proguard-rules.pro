
# Add project-specific ProGuard rules here.

# Basic Android proguard configuration
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Preserve some attributes that may be required
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep Capacitor and React core classes
-keep class com.getcapacitor.** { *; }
-keepnames class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Keep Kotlin reflection
-keep class kotlin.reflect.** { *; }
-dontwarn kotlin.reflect.**

# Keep React Native classes
-keep,allowobfuscation class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# Preserve all native method names and the names of their classes
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}
