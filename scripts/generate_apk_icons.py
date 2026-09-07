#!/usr/bin/env python3
"""
Generate complete Android launcher icons, adaptive icons, splash screens, and PWA icons
from the master SmartRun logo (public/smartrun.png).
"""

import os
import subprocess
import shutil

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
SRC_IMAGE = os.path.join(BASE_DIR, "public", "smartrun.png")
BG_COLOR = "#F9C017"

if not os.path.exists(SRC_IMAGE):
    print(f"Error: Source logo not found at {SRC_IMAGE}")
    exit(1)

print(f"Source logo: {SRC_IMAGE}")

TMP_DIR = "/tmp/smartrun_icons"
os.makedirs(TMP_DIR, exist_ok=True)

# 1. Generate master square icon (1200x1200) centered on the logo
# The logo in public/smartrun.png (2268x1260) is centered at X=1135, Y=611
# Cropping a 1200x1200 box centered at (1135, 611):
# X = 1135 - 600 = 535
# Y = max(0, 611 - 600) = 11
master_icon = os.path.join(TMP_DIR, "master_icon_1200.png")
subprocess.run([
    "convert", SRC_IMAGE,
    "-crop", "1200x1200+535+11",
    "+repage",
    master_icon
], check=True)
print(f"Created master square icon: {master_icon}")

# 2. Generate master round icon (1200x1200 with circular mask)
master_round = os.path.join(TMP_DIR, "master_round_1200.png")
mask_file = os.path.join(TMP_DIR, "circle_mask.png")
subprocess.run([
    "convert", "-size", "1200x1200", "xc:none",
    "-fill", "white",
    "-draw", "circle 600,600 600,1",
    mask_file
], check=True)
subprocess.run([
    "convert", master_icon, mask_file,
    "-alpha", "Off", "-compose", "CopyOpacity", "-composite",
    master_round
], check=True)
print(f"Created master circular icon: {master_round}")

# 3. Generate master adaptive foreground (1200x1200, transparent background)
# Transparent background with logo in center
master_fg = os.path.join(TMP_DIR, "master_fg_1200.png")
subprocess.run([
    "convert", master_icon,
    "-fuzz", "18%",
    "-transparent", "srgb(248,191,24)",
    master_fg
], check=True)
print(f"Created master adaptive foreground: {master_fg}")

# Android Mipmap dimensions
# density: (legacy_size, foreground_size)
MIPMAP_DENSITIES = {
    "mipmap-mdpi": (48, 108),
    "mipmap-hdpi": (72, 162),
    "mipmap-xhdpi": (96, 216),
    "mipmap-xxhdpi": (144, 324),
    "mipmap-xxxhdpi": (192, 432)
}

RES_DIR = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")

for density, (legacy_sz, fg_sz) in MIPMAP_DENSITIES.items():
    density_dir = os.path.join(RES_DIR, density)
    os.makedirs(density_dir, exist_ok=True)

    # ic_launcher.png (legacy square launcher)
    dest_launcher = os.path.join(density_dir, "ic_launcher.png")
    subprocess.run([
        "convert", master_icon,
        "-resize", f"{legacy_sz}x{legacy_sz}!",
        dest_launcher
    ], check=True)

    # ic_launcher_round.png (legacy round launcher)
    dest_round = os.path.join(density_dir, "ic_launcher_round.png")
    subprocess.run([
        "convert", master_round,
        "-resize", f"{legacy_sz}x{legacy_sz}!",
        dest_round
    ], check=True)

    # ic_launcher_foreground.png (adaptive foreground)
    dest_fg = os.path.join(density_dir, "ic_launcher_foreground.png")
    subprocess.run([
        "convert", master_fg,
        "-resize", f"{fg_sz}x{fg_sz}!",
        dest_fg
    ], check=True)

    print(f"Generated icons for {density}: launcher={legacy_sz}x{legacy_sz}, fg={fg_sz}x{fg_sz}")

# Update ic_launcher_background.xml to match brand color
bg_xml = os.path.join(RES_DIR, "values", "ic_launcher_background.xml")
with open(bg_xml, "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#F9C017</color>\n</resources>\n')
print(f"Updated {bg_xml}")

# Update colors.xml
colors_xml = os.path.join(RES_DIR, "values", "colors.xml")
with open(colors_xml, "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="colorPrimary">#F9C017</color>\n    <color name="colorPrimaryDark">#D9A007</color>\n    <color name="colorAccent">#1F2937</color>\n</resources>\n')
print(f"Updated {colors_xml}")

# 4. Generate Android Splash Screens
# Sizes:
SPLASH_SIZES = {
    "drawable/splash.png": (480, 320),
    "drawable-land-mdpi/splash.png": (480, 320),
    "drawable-land-hdpi/splash.png": (800, 480),
    "drawable-land-xhdpi/splash.png": (1280, 720),
    "drawable-land-xxhdpi/splash.png": (1600, 960),
    "drawable-land-xxxhdpi/splash.png": (1920, 1280),
    "drawable-port-mdpi/splash.png": (320, 480),
    "drawable-port-hdpi/splash.png": (480, 800),
    "drawable-port-xhdpi/splash.png": (720, 1280),
    "drawable-port-xxhdpi/splash.png": (960, 1600),
    "drawable-port-xxxhdpi/splash.png": (1280, 1920),
}

# First extract a clean transparent logo banner for compositing onto splash screens
logo_banner = os.path.join(TMP_DIR, "logo_banner.png")
subprocess.run([
    "convert", SRC_IMAGE,
    "-crop", "800x250+730+500", "+repage",
    "-fuzz", "18%",
    "-transparent", "srgb(248,191,24)",
    "-trim", "+repage",
    logo_banner
], check=True)

for splash_rel_path, (w, h) in SPLASH_SIZES.items():
    splash_file = os.path.join(RES_DIR, splash_rel_path)
    os.makedirs(os.path.dirname(splash_file), exist_ok=True)

    # Scale logo to ~60% of splash width, max 40% of splash height
    target_logo_w = int(w * 0.65)
    target_logo_h = int(h * 0.35)

    subprocess.run([
        "convert",
        "-size", f"{w}x{h}", "xc:#F9C017",
        "(", logo_banner, "-resize", f"{target_logo_w}x{target_logo_h}", ")",
        "-gravity", "center",
        "-composite",
        splash_file
    ], check=True)
    print(f"Generated splash screen: {splash_rel_path} ({w}x{h})")

# 5. Generate Web & PWA Icons (public/icons/ & dist/icons/)
PUBLIC_ICONS_DIR = os.path.join(BASE_DIR, "public", "icons")
DIST_ICONS_DIR = os.path.join(BASE_DIR, "dist", "icons")
os.makedirs(PUBLIC_ICONS_DIR, exist_ok=True)
os.makedirs(DIST_ICONS_DIR, exist_ok=True)

WEB_ICONS = {
    "icon-192.png": 192,
    "icon-192-maskable.png": 192,
    "icon-512.png": 512,
    "icon-512-maskable.png": 512,
}

for icon_name, sz in WEB_ICONS.items():
    pub_path = os.path.join(PUBLIC_ICONS_DIR, icon_name)
    subprocess.run([
        "convert", master_icon,
        "-resize", f"{sz}x{sz}!",
        pub_path
    ], check=True)
    dist_path = os.path.join(DIST_ICONS_DIR, icon_name)
    shutil.copy2(pub_path, dist_path)
    print(f"Generated PWA icon: {icon_name} ({sz}x{sz})")

# Favicons
fav_png = os.path.join(BASE_DIR, "public", "favicon.png")
subprocess.run([
    "convert", master_icon,
    "-resize", "192x192!",
    fav_png
], check=True)
shutil.copy2(fav_png, os.path.join(BASE_DIR, "dist", "favicon.png"))

fav_ico = os.path.join(BASE_DIR, "public", "favicon.ico")
subprocess.run([
    "convert", master_icon,
    "-resize", "64x64!",
    fav_ico
], check=True)
shutil.copy2(fav_ico, os.path.join(BASE_DIR, "dist", "favicon.ico"))
print("Generated favicons (PNG and ICO)")

print("All Android APK icons, adaptive icons, splashes, and web icons generated successfully!")
