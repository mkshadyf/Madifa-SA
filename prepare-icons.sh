#!/bin/bash
set -e

mkdir -p android/app/src/main/res/drawable

# Copy logo for use as icon and splash screen
if [ -f "client/public/madifa_logo.png" ]; then
  cp client/public/madifa_logo.png android/app/src/main/res/drawable/madifa_logo.png
  echo "Logo copied successfully!"
else
  echo "Logo file not found. Please ensure madifa_logo.png exists in the client/public directory."
  exit 1
fi

# Create a simple XML splash screen
cat > android/app/src/main/res/drawable/splash.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/background_color" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/madifa_logo" />
    </item>
</layer-list>
EOL

# Create a color values file for the splash screen background
mkdir -p android/app/src/main/res/values
cat > android/app/src/main/res/values/colors.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="background_color">#121212</color>
</resources>
EOL

echo "Splash screen resources prepared!"
echo "Note: You may need to adjust the splash.xml file for optimal display."