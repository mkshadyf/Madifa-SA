import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.madifa.app',
  appName: 'Madifa',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'android/madifa.keystore',
      keystorePassword: process.env.KEYSTORE_PASSWORD || 'madifa2024',
      keystoreAlias: 'madifa',
      keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASSWORD || 'madifa2024'
    }
  }
};

export default config;