# How to Build a Signed Android App Bundle (.aab) in Android Studio

This guide explains how to open this project in **Android Studio** and generate an **Android App Bundle (.aab)** ready for upload to the **Google Play Console**.

---

## Prerequisites
- **Android Studio** (Ladybug, Koala, Jellyfish, or newer) installed on your computer.
- **Java Development Kit (JDK 17 or JDK 21)** (bundled automatically inside Android Studio).

---

## Step 1: Open the Project in Android Studio

1. Launch **Android Studio**.
2. On the welcome screen, click **Open** (or go to **File > Open...**).
3. In the file picker, browse to your project directory and select the **`android`** folder:
   ```
   your-project-folder/android/
   ```
   > ⚠️ **Important**: Select the `android` subfolder, **not** the root project folder.
4. Click **OK** to open.
5. Android Studio will automatically start the **Gradle Sync**. Wait 1–2 minutes until you see `BUILD SUCCESSFUL` in the bottom status bar.

---

## Step 2: Build Signed App Bundle (.aab)

1. In Android Studio's top menu bar, go to:
   **Build > Generate Signed Bundle / APK...**

2. In the dialog, select **Android App Bundle** (`.aab`) and click **Next**.

3. **Key store path**:
   - If you already have a keystore: Click **Choose existing...** and select your `.jks` or `.keystore` file.
   - If this is your first release: Click **Create new...**:
     - **Key store path**: Choose where to save it (e.g. `C:/Users/YourName/smartrun-release-key.jks`).
     - **Password**: Enter a strong password and remember it.
     - **Alias**: e.g., `smartrun` or `key0`.
     - **Validity (years)**: 25 (default).
     - **Certificate**: Fill in your name or organization (e.g., `SmartRun`).
     - Click **OK**.

4. Enter your **Key store password**, **Key alias**, and **Key password**, then check **Remember passwords**. Click **Next**.

5. On the next screen:
   - **Destination folder**: Where Android Studio will output the `.aab` file (default is `android/app/release`).
   - **Build Variants**: Select **`release`**.
   - Check the **V1 (Jar Signature)** and **V2 (Full APK Signature)** options if visible.

6. Click **Finish** (or **Create**).

---

## Step 3: Locate Your .aab File

1. When the build finishes, a notification appears in the bottom right corner:
   `"Generate Signed Bundle: App bundle(s) generated successfully for module 'app'"`
2. Click **locate** inside the notification, or navigate directly to:
   ```
   android/app/release/app-release.aab
   ```
3. This **`app-release.aab`** is the file you upload to **Google Play Console**.

---

## Alternative: Build via Command Line (Terminal)

You can also generate the release bundle directly from your computer's terminal:

### On Windows:
```cmd
cd android
gradlew.bat bundleRelease
```

### On macOS / Linux:
```bash
cd android
./gradlew bundleRelease
```

The unsigned/signed release bundle will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## Step 4: Upload to Google Play Console

1. Log in to [Google Play Console](https://play.google.com/console).
2. Select your app: **SmartRun**.
3. Go to **Release > Production** (or **Internal testing**).
4. Click **Create new release**.
5. Drag and drop your **`app-release.aab`** file.
6. Enter release notes and click **Next > Save > Start rollout to Production**!
