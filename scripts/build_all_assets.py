import os
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SOURCE_IMAGE = r"C:\Users\hp\.gemini\antigravity\brain\dcb7b765-b46d-44d7-a121-d24327e9f2c7\.user_uploaded\media_1793298605370_530fcb86.jpg"
PROJECT_ROOT = r"C:\Users\hp\Desktop\hotel managementapp"
PUBLIC_IMAGES = os.path.join(PROJECT_ROOT, "public", "images")
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
APP_DIR = os.path.join(PROJECT_ROOT, "src", "app")
RES_DIR = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")

BRAND_BG_HEX = "#12082B"
BRAND_BG_RGB = (18, 8, 43)

os.makedirs(PUBLIC_IMAGES, exist_ok=True)

def generate_base_assets():
    print("1. Extracting high-resolution transparent logo from new source image...")
    im = Image.open(SOURCE_IMAGE).convert('RGB')
    arr = np.array(im, dtype=float)

    # Reference background color from interior corners
    bg = np.array([20.0, 7.8, 45.2])

    # Crop the logo area: x in [45, 380], y in [24, 148]
    crop = arr[24:148, 45:380]
    H, W, _ = crop.shape

    # Alpha extraction based on color difference from uniform dark violet background
    dist = np.linalg.norm(crop - bg, axis=2)
    # Smoothstep alpha for soft, anti-aliased edges
    alpha = np.clip((dist - 14.0) / 25.0, 0.0, 1.0)
    alpha = alpha * alpha * (3.0 - 2.0 * alpha)

    # Reconstruct un-premultiplied foreground colors
    fg = np.zeros_like(crop)
    for c in range(3):
        fg[:, :, c] = np.where(
            alpha > 0.04,
            np.clip((crop[:, :, c] - (1.0 - alpha) * bg[c]) / np.maximum(alpha, 0.04), 0, 255),
            0
        )

    # Boost vibrance slightly for crystal crisp rendering
    # Cyan / Blue boost in R mark
    is_cyan = (fg[:, :, 1] > 120) & (fg[:, :, 2] > 170)
    fg[is_cyan, 1] = np.clip(fg[is_cyan, 1] * 1.05, 0, 255)
    fg[is_cyan, 2] = np.clip(fg[is_cyan, 2] * 1.08, 0, 255)

    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(fg, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255).astype(np.uint8)

    extracted_im = Image.fromarray(rgba, 'RGBA')

    # Find tight bounding box of entire logo
    y_idx, x_idx = np.where(rgba[:, :, 3] > 25)
    min_x, max_x = x_idx.min(), x_idx.max()
    min_y, max_y = y_idx.min(), y_idx.max()

    logo_tight = extracted_im.crop((min_x, min_y, max_x + 1, max_y + 1))

    # Add 16px padding around full logo
    lw, lh = logo_tight.size
    full_logo_white = Image.new('RGBA', (lw + 32, lh + 32), (0, 0, 0, 0))
    full_logo_white.paste(logo_tight, (16, 16), logo_tight)

    # Upscale 3x using Lanczos for crisp high-DPI rendering
    full_logo_white = full_logo_white.resize((full_logo_white.width * 3, full_logo_white.height * 3), Image.Resampling.LANCZOS)

    # Create light mode version (with dark slate 'ent' text)
    white_arr = np.array(full_logo_white).copy()
    # Find white 'ent' text: x in center region and high brightness
    w_w = white_arr.shape[1]
    ent_mask = (np.arange(w_w)[None, :] > int(w_w * 0.40)) & (np.arange(w_w)[None, :] < int(w_w * 0.73))
    ent_mask = ent_mask & (white_arr[:, :, 3] > 40)
    is_bright_white = ent_mask & (white_arr[:, :, :3].mean(axis=2) > 150)
    white_arr[is_bright_white, 0] = 15  # Slate-900
    white_arr[is_bright_white, 1] = 23
    white_arr[is_bright_white, 2] = 42
    full_logo_light = Image.fromarray(white_arr, 'RGBA')

    # Extract 'R' icon mark alone
    # 'R' is from left to ~44% of tight logo
    r_cutoff = int(min_x + (max_x - min_x) * 0.43)
    r_mask = (rgba[:, :, 3] > 25) & (np.arange(W)[None, :] <= r_cutoff)
    ry, rx = np.where(r_mask)
    r_tight = extracted_im.crop((rx.min(), ry.min(), rx.max() + 1, ry.max() + 1))

    # Center 'R' in a clean square canvas
    rw, rh = r_tight.size
    side = max(rw, rh) + 20
    icon_square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    icon_square.paste(r_tight, ((side - rw) // 2, (side - rh) // 2), r_tight)
    # Upscale icon mark 4x
    icon_square = icon_square.resize((icon_square.width * 4, icon_square.height * 4), Image.Resampling.LANCZOS)

    # Save base extracted assets
    full_logo_light.save(os.path.join(PUBLIC_IMAGES, "rentify-logo.png"))
    full_logo_white.save(os.path.join(PUBLIC_IMAGES, "rentify-logo-white.png"))
    icon_square.save(os.path.join(PUBLIC_IMAGES, "rentify-icon.png"))
    print("Base logo, white logo, and icon mark saved to public/images/.")

    return full_logo_light, full_logo_white, icon_square

def generate_web_icons(icon_square, full_logo_white):
    print("2. Generating web favicons and apple touch icons...")
    # 512x512 Master App Icon with dark brand background
    size = 512
    icon_512 = Image.new('RGBA', (size, size), BRAND_BG_RGB + (255,))
    
    # Optional soft radial gradient glow behind 'R'
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse((size//4, size//4, size*3//4, size*3//4), fill=(147, 51, 234, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    icon_512.paste(glow, (0, 0), glow)

    # Scale 'R' to fit ~70% of canvas
    target_dim = int(size * 0.70)
    resized_r = icon_square.resize((target_dim, target_dim), Image.Resampling.LANCZOS)
    offset = (size - target_dim) // 2
    icon_512.paste(resized_r, (offset, offset), resized_r)

    # Save web icons
    icon_512.save(os.path.join(PUBLIC_DIR, "favicon.png"))
    icon_512.save(os.path.join(PUBLIC_DIR, "icon-512.png"))
    icon_512.save(os.path.join(APP_DIR, "icon.png"))

    # Apple touch icon (180x180)
    icon_180 = icon_512.resize((180, 180), Image.Resampling.LANCZOS)
    icon_180.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"))
    icon_180.save(os.path.join(APP_DIR, "apple-icon.png"))

    # Multi-size ICO
    icon_512.save(
        os.path.join(PUBLIC_DIR, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    print("Web favicons and touch icons generated.")

def generate_app_thumbnail(full_logo_white, icon_square):
    print("3. Generating official App Thumbnail (1200x630)...")
    W, H = 1200, 630
    thumb = Image.new('RGBA', (W, H), BRAND_BG_RGB + (255,))

    # Ambient glows in background
    glow_cyan = Image.new('RGBA', (600, 600), (0, 0, 0, 0))
    d_c = ImageDraw.Draw(glow_cyan)
    d_c.ellipse((0, 0, 600, 600), fill=(6, 182, 212, 40))
    glow_cyan = glow_cyan.filter(ImageFilter.GaussianBlur(90))
    thumb.paste(glow_cyan, (-100, -100), glow_cyan)

    glow_purple = Image.new('RGBA', (700, 700), (0, 0, 0, 0))
    d_p = ImageDraw.Draw(glow_purple)
    d_p.ellipse((0, 0, 700, 700), fill=(168, 85, 247, 45))
    glow_purple = glow_purple.filter(ImageFilter.GaussianBlur(100))
    thumb.paste(glow_purple, (W - 500, H - 500), glow_purple)

    # Hero Card
    card_w, card_h = 1040, 500
    card_x, card_y = (W - card_w) // 2, (H - card_h) // 2
    card = Image.new('RGBA', (card_w, card_h), (20, 10, 48, 240))
    c_draw = ImageDraw.Draw(card)
    c_draw.rounded_rectangle((0, 0, card_w - 1, card_h - 1), radius=32, outline=(147, 51, 234, 120), width=2)

    # Pill badge at top
    pill_text = "OFFICIAL MOBILE APP  •  FIND YOUR STAY"
    try:
        font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 16)
        font_tag = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 15)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
    except Exception:
        font_pill = font_tag = font_sub = ImageFont.load_default()

    pill_box = (card_w // 2 - 190, 40, card_w // 2 + 190, 76)
    c_draw.rounded_rectangle(pill_box, radius=18, fill=(49, 16, 99, 255), outline=(168, 85, 247, 180), width=1)
    c_draw.text((card_w // 2, 58), pill_text, fill=(216, 180, 254, 255), font=font_pill, anchor="mm")

    # Center Logo
    target_lw = 680
    lw, lh = full_logo_white.size
    target_lh = int(lh * target_lw / lw)
    scaled_logo = full_logo_white.resize((target_lw, target_lh), Image.Resampling.LANCZOS)
    card.paste(scaled_logo, ((card_w - target_lw) // 2, 120), scaled_logo)

    # Category Badges at bottom
    categories = [
        "🎓 Student PGs & Hostels",
        "👨‍👩‍👧 Family Suites",
        "⚡ Hourly Day Stays",
        "🏖️ Regular Hotels"
    ]
    tag_y = 370
    total_w = 4 * 200 + 3 * 16
    start_x = (card_w - total_w) // 2
    for i, cat in enumerate(categories):
        tx = start_x + i * (200 + 16)
        c_draw.rounded_rectangle((tx, tag_y, tx + 200, tag_y + 44), radius=12, fill=(30, 14, 65, 255), outline=(107, 33, 168, 180), width=1)
        c_draw.text((tx + 100, tag_y + 22), cat, fill=(226, 232, 240, 255), font=font_tag, anchor="mm")

    c_draw.text((card_w // 2, 450), "Verified Properties  •  Instant Confirmation  •  Zero Brokerage", fill=(192, 132, 252, 255), font=font_sub, anchor="mm")

    thumb.paste(card, (card_x, card_y), card)
    thumb.save(os.path.join(PUBLIC_IMAGES, "rentify-thumbnail.png"))
    thumb.save(os.path.join(APP_DIR, "opengraph-image.png"))
    print("App thumbnail saved.")

def generate_android_icons(icon_square):
    print("4. Generating Android mipmap launcher icons...")
    densities = {
        'mdpi': (48, 108),
        'hdpi': (72, 162),
        'xhdpi': (96, 216),
        'xxhdpi': (144, 324),
        'xxxhdpi': (192, 432),
    }

    for density, (legacy_size, fg_size) in densities.items():
        folder = os.path.join(RES_DIR, f"mipmap-{density}")
        os.makedirs(folder, exist_ok=True)

        # 1. ic_launcher_foreground.png (Adaptive icon foreground with safe margins)
        fg_im = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
        icon_dim = int(fg_size * 0.60)
        resized_fg = icon_square.resize((icon_dim, icon_dim), Image.Resampling.LANCZOS)
        offset = (fg_size - icon_dim) // 2
        fg_im.paste(resized_fg, (offset, offset), resized_fg)
        fg_im.save(os.path.join(folder, "ic_launcher_foreground.png"))

        # 2. ic_launcher.png (Legacy squircle launcher icon with brand dark background)
        legacy_im = Image.new('RGBA', (legacy_size, legacy_size), BRAND_BG_RGB + (255,))
        d_leg = ImageDraw.Draw(legacy_im)
        icon_leg_dim = int(legacy_size * 0.72)
        resized_leg = icon_square.resize((icon_leg_dim, icon_leg_dim), Image.Resampling.LANCZOS)
        leg_offset = (legacy_size - icon_leg_dim) // 2
        legacy_im.paste(resized_leg, (leg_offset, leg_offset), resized_leg)
        legacy_im.save(os.path.join(folder, "ic_launcher.png"))

        # 3. ic_launcher_round.png (Circular launcher icon)
        round_mask = Image.new('L', (legacy_size, legacy_size), 0)
        d_mask = ImageDraw.Draw(round_mask)
        d_mask.ellipse((0, 0, legacy_size - 1, legacy_size - 1), fill=255)
        round_im = Image.new('RGBA', (legacy_size, legacy_size), BRAND_BG_RGB + (255,))
        round_im.paste(resized_leg, (leg_offset, leg_offset), resized_leg)
        round_im.putalpha(round_mask)
        round_im.save(os.path.join(folder, "ic_launcher_round.png"))

    print("Android mipmap icons completed.")

def generate_android_splashes(full_logo_white, icon_square):
    print("5. Generating Android splash screens...")
    splashes = {
        'drawable': (480, 320),
        'drawable-land-mdpi': (480, 320),
        'drawable-land-hdpi': (800, 480),
        'drawable-land-xhdpi': (1280, 720),
        'drawable-land-xxhdpi': (1600, 960),
        'drawable-land-xxxhdpi': (1920, 1280),
        'drawable-port-mdpi': (320, 480),
        'drawable-port-hdpi': (480, 800),
        'drawable-port-xhdpi': (720, 1280),
        'drawable-port-xxhdpi': (960, 1600),
        'drawable-port-xxxhdpi': (1280, 1920),
    }

    lw, lh = full_logo_white.size

    for folder_name, (w, h) in splashes.items():
        folder = os.path.join(RES_DIR, folder_name)
        os.makedirs(folder, exist_ok=True)

        splash = Image.new('RGBA', (w, h), BRAND_BG_RGB + (255,))

        is_port = h > w
        scale_pct = 0.65 if is_port else 0.45
        target_w = int(w * scale_pct)
        target_h = int(lh * target_w / lw)

        if target_h > h * 0.35:
            target_h = int(h * 0.35)
            target_w = int(lw * target_h / lh)

        scaled_logo = full_logo_white.resize((target_w, target_h), Image.Resampling.LANCZOS)
        pos = ((w - target_w) // 2, (h - target_h) // 2)
        splash.paste(scaled_logo, pos, scaled_logo)

        splash.save(os.path.join(folder, "splash.png"))

    # Android 12+ windowSplashScreenAnimatedIcon (512x512)
    # Icon within safe circular area on brand background
    splash_icon = Image.new('RGBA', (512, 512), BRAND_BG_RGB + (255,))
    target_dim = 300
    resized_r = icon_square.resize((target_dim, target_dim), Image.Resampling.LANCZOS)
    splash_icon.paste(resized_r, ((512 - target_dim) // 2, (512 - target_dim) // 2), resized_r)
    splash_icon.save(os.path.join(RES_DIR, "drawable", "splash_icon.png"))

    print("Android splash screens completed.")

if __name__ == '__main__':
    full_logo_light, full_logo_white, icon_square = generate_base_assets()
    generate_web_icons(icon_square, full_logo_white)
    generate_app_thumbnail(full_logo_white, icon_square)
    generate_android_icons(icon_square)
    generate_android_splashes(full_logo_white, icon_square)
    print("ALL NEW RENTIFY LOGO ASSETS GENERATED!")
