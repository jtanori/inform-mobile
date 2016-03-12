rm inform-armv7.apk
rm inform-x86.apk

cordova plugin rm cordova-plugin-console
cordova build android
cordova build --release android

#keystore settings
#keytool -genkey -v -keystore inform-prod.keystore -alias inform-prod -keyalg RSA -keysize 2048 -validity 10000
#Update paths to match your local environment
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore inform-prod.keystore platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk inform-prod
/Users/Jaime/Library/Android/sdk/build-tools/23.0.2/zipalign -v 4 $HOME/Documents/projects/inform-mobile/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk inform-armv7.apk

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore inform-prod.keystore platforms/android/build/outputs/apk/android-x86-release-unsigned.apk inform-prod
/Users/Jaime/Library/Android/sdk/build-tools/23.0.2/zipalign -v 4 $HOME/Documents/projects/inform-mobile/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk inform-x86.apk
