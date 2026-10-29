import os
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SOURCE_IMAGE = r"C:\Users\hp\.gemini\antigravity\brain\dcb7b765-b46d-44d7-a121-d24327e9f2c7\.user_uploaded\media_1793261344372_6d449fe6.png"
PROJECT_ROOT = r"C:\Users\hp\Desktop\hotel managementapp"
PUBLIC_IMAGES = os.path.join(PROJECT_ROOT, "public", "images")
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
APP_DIR = os.path.join(PROJECT_ROOT, "src", "app")
RES_DIR = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")

os.makedirs(PUBLIC_IMAGES, exist_ok=True)

def generate_base_assets():
    print("1. Extracting transparent logo from original image...")
    im = Image.open(SOURCE_IMAGE).convert('RGB')
    arr = np.array(im, dtype=np.float32)

    # Sub-crop tightly around logo area
    pad_x1, pad_x2 = 45, 522
    pad_y1, pad_y2 = 18, 205
    crop = arr[pad_y1:pad_y2, pad_x1:pad_x2]
    cH, cW, _ = crop.shape

    # Identify logo pixels (coral mark & text, plus dark tagline)
    is_coral = (crop[:, :, 0] - np.maximum(crop[:, :, 1], crop[:, :, 2]) > 25)
    is_dark = (crop.mean(axis=2) < 100)
    is_logo = is_coral | is_dark

    # Fit 2D background plane from background samples
    bg_mask = ~is_logo
    y_coords, x_coords = np.where(bg_mask)
    bg_pixels = crop[bg_mask]
    X = np.c_[np.ones(len(x_coords)), x_coords, y_coords, x_coords * y_coords]

    yy, xx = np.mgrid[0:cH, 0:cW]
    grid = np.c_[np.ones(cH * cW), xx.ravel(), yy.ravel(), (xx * yy).ravel()]

    bg_est = np.zeros_like(crop)
    for c in range(3):
        coeff, _, _, _ = np.linalg.lstsq(X, bg_pixels[:, c], rcond=None)
        bg_est[:, :, c] = grid.dot(coeff).reshape(cH, cW)

    # Compute contrast strength against estimated background
    sat_diff = crop[:, :, 0] - np.maximum(crop[:, :, 1], crop[:, :, 2])
    lum_diff = np.maximum(0.0, bg_est.mean(axis=2) - crop.mean(axis=2))
    strength = np.maximum(sat_diff * 1.8, lum_diff * 1.2)

    # Alpha gradient calculation
    alpha = np.clip((strength - 18.0) / 35.0, 0.0, 1.0)
    alpha = alpha * alpha * (3.0 - 2.0 * alpha)

    # Foreground color reconstruction
    fg = np.zeros_like(crop)
    for c in range(3):
        fg[:, :, c] = np.where(
            alpha > 0.04,
            np.clip((crop[:, :, c] - (1.0 - alpha) * bg_est[:, :, c]) / np.maximum(alpha, 0.04), 0, 255),
            0
        )

    # Enhance coral vibrance and standardize color
    c_mask = (crop[:, :, 0] > crop[:, :, 1] + 20)
    fg[c_mask, 0] = np.clip(fg[c_mask, 0] * 1.08 + 8, 0, 255)
    fg[c_mask, 1] = np.clip(fg[c_mask, 1] * 0.94, 0, 255)
    fg[c_mask, 2] = np.clip(fg[c_mask, 2] * 0.94, 0, 255)

    rgba = np.zeros((cH, cW, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(fg, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255).astype(np.uint8)

    refined = Image.fromarray(rgba, 'RGBA')

    # Bounding box of entire logo
    y_idx, x_idx = np.where(rgba[:, :, 3] > 20)
    min_x, max_x = x_idx.min(), x_idx.max()
    min_y, max_y = y_idx.min(), y_idx.max()

    logo_tight = refined.crop((min_x, min_y, max_x + 1, max_y + 1))

    # Add 12px padding around full logo
    logo_w, logo_h = logo_tight.size
    full_logo = Image.new('RGBA', (logo_w + 24, logo_h + 24), (0, 0, 0, 0))
    full_logo.paste(logo_tight, (12, 12), logo_tight)

    # Extract icon mark alone (left section)
    icon_mask = (rgba[:, :, 3] > 20) & (np.arange(cW)[None, :] < 160)
    iy, ix = np.where(icon_mask)
    icon_tight = refined.crop((ix.min(), iy.min(), ix.max() + 1, iy.max() + 1))
    
    # Square canvas for icon mark
    iw, ih = icon_tight.size
    side = max(iw, ih) + 20
    icon_square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    icon_square.paste(icon_tight, ((side - iw) // 2, (side - ih) // 2), icon_tight)

    # Create dark-background friendly version (subtitle in crisp white)
    logo_white_arr = np.array(full_logo)
    # Subtitle pixels: dark/neutral pixels where alpha > 40 and not coral
    is_coral_logo = (logo_white_arr[:, :, 0] > logo_white_arr[:, :, 1] + 30)
    is_subtitle = (logo_white_arr[:, :, 3] > 40) & (~is_coral_logo)
    logo_white_arr[is_subtitle, 0] = 255
    logo_white_arr[is_subtitle, 1] = 255
    logo_white_arr[is_subtitle, 2] = 255
    logo_white = Image.fromarray(logo_white_arr, 'RGBA')

    # Save base versions
    full_logo.save(os.path.join(PUBLIC_IMAGES, "rentify-logo.png"))
    logo_white.save(os.path.join(PUBLIC_IMAGES, "rentify-logo-white.png"))
    icon_square.save(os.path.join(PUBLIC_IMAGES, "rentify-icon.png"))
    print("Base logo, white logo, and icon mark saved.")

    return full_logo, logo_white, icon_square

def generate_web_icons(icon_square, full_logo):
    print("2. Generating web favicons and apple touch icons...")
    # High-res master icon (512x512)
    # Place icon on a crisp white squircle/circle with subtle padding
    size = 512
    icon_512 = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(icon_512)

    # Scale icon to ~72% of canvas
    target_icon_size = 368
    icon_resized = icon_square.resize((target_icon_size, target_icon_size), Image.Resampling.LANCZOS)
    offset = (size - target_icon_size) // 2
    icon_512.paste(icon_resized, (offset, offset), icon_resized)

    # Save to public and app
    icon_512.save(os.path.join(PUBLIC_DIR, "favicon.png"))
    icon_512.save(os.path.join(PUBLIC_DIR, "icon-512.png"))
    icon_512.save(os.path.join(APP_DIR, "icon.png"))

    # Apple touch icon (180x180)
    icon_180 = icon_512.resize((180, 180), Image.Resampling.LANCZOS)
    icon_180.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"))
    icon_180.save(os.path.join(APP_DIR, "apple-icon.png"))

    # Favicon ICO (multi-size: 16, 32, 48, 64)
    icon_512.save(
        os.path.join(PUBLIC_DIR, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )

    print("Web favicons and touch icons generated.")

def generate_app_thumbnail(full_logo, icon_square):
    print("3. Generating official App Thumbnail (1200x630)...")
    W, H = 1200, 630
    thumb = Image.new('RGBA', (W, H), (248, 250, 252, 255)) # Soft slate-50
    draw = ImageDraw.Draw(thumb)

    # Subtle modern gradient / background glow
    # Draw soft decorative circles
    glow_coral = Image.new('RGBA', (600, 600), (0, 0, 0, 0))
    d_glow1 = ImageDraw.Draw(glow_coral)
    d_glow1.ellipse((0, 0, 600, 600), fill=(234, 93, 78, 28))
    glow_coral = glow_coral.filter(ImageFilter.GaussianBlur(80))
    thumb.paste(glow_coral, (-100, -100), glow_coral)

    glow_indigo = Image.new('RGBA', (700, 700), (0, 0, 0, 0))
    d_glow2 = ImageDraw.Draw(glow_indigo)
    d_glow2.ellipse((0, 0, 700, 700), fill=(99, 102, 241, 24))
    glow_indigo = glow_indigo.filter(ImageFilter.GaussianBlur(90))
    thumb.paste(glow_indigo, (W - 500, H - 500), glow_indigo)

    # Central Hero Card
    card_w, card_h = 1040, 510
    card_x, card_y = (W - card_w) // 2, (H - card_h) // 2

    # Card shadow
    shadow = Image.new('RGBA', (card_w + 40, card_h + 40), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle((20, 20, card_w + 20, card_h + 20), radius=36, fill=(15, 23, 42, 28))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    thumb.paste(shadow, (card_x - 20, card_y - 10), shadow)

    # Main Card
    card = Image.new('RGBA', (card_w, card_h), (255, 255, 255, 255))
    c_draw = ImageDraw.Draw(card)
    # Subtle border
    c_draw.rounded_rectangle((0, 0, card_w - 1, card_h - 1), radius=32, outline=(226, 232, 240, 255), width=2)

    # Top pill badge: "OFFICIAL MOBILE APP & BOOKING PLATFORM"
    pill_text = "OFFICIAL MOBILE APP  •  FIND YOUR STAY"
    try:
        font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 16)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 20)
        font_tag = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 15)
    except Exception:
        font_pill = font_sub = font_tag = ImageFont.load_default()

    # Pill background
    pill_box = (card_w // 2 - 190, 42, card_w // 2 + 190, 76)
    c_draw.rounded_rectangle(pill_box, radius=17, fill=(254, 242, 242, 255), outline=(254, 205, 205, 255), width=1)
    c_draw.text((card_w // 2, 59), pill_text, fill=(225, 29, 72, 255), font=font_pill, anchor="mm")

    # Paste Logo in the center of card
    # Scale full logo to fit ~620 width
    target_lw = 640
    lw, lh = full_logo.size
    target_lh = int(lh * target_lw / lw)
    scaled_logo = full_logo.resize((target_lw, target_lh), Image.Resampling.LANCZOS)
    logo_pos = ((card_w - target_lw) // 2, 115)
    card.paste(scaled_logo, logo_pos, scaled_logo)

    # Bottom Category Tags
    categories = [
        "🎓 Student PGs & Hostels",
        "👨‍👩‍👧 Family Suites",
        "⚡ Hourly Day Stays",
        "🏖️ Regular Hotels"
    ]
    tag_y = 385
    total_tags_w = 4 * 200 + 3 * 16
    start_tag_x = (card_w - total_tags_w) // 2
    for i, cat in enumerate(categories):
        tx = start_tag_x + i * (200 + 16)
        c_draw.rounded_rectangle((tx, tag_y, tx + 200, tag_y + 44), radius=12, fill=(241, 245, 249, 255), outline=(226, 232, 240, 255), width=1)
        c_draw.text((tx + 100, tag_y + 22), cat, fill=(51, 65, 85, 255), font=font_tag, anchor="mm")

    # Trust note at bottom
    c_draw.text((card_w // 2, 465), "Verified Properties  •  Instant Confirmation  •  Zero Brokerage", fill=(100, 116, 139, 255), font=font_tag, anchor="mm")

    # Paste card onto thumbnail
    thumb.paste(card, (card_x, card_y), card)

    # Save thumbnail images
    thumb.save(os.path.join(PUBLIC_IMAGES, "rentify-thumbnail.png"))
    thumb.save(os.path.join(APP_DIR, "opengraph-image.png"))
    print("App thumbnail saved to public/images/rentify-thumbnail.png and src/app/opengraph-image.png.")

def generate_android_icons(icon_square, full_logo):
    print("4. Generating Android mipmap launcher icons and drawables...")
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
        # Keep icon within center 60% of the adaptive canvas
        icon_dim = int(fg_size * 0.58)
        resized_fg = icon_square.resize((icon_dim, icon_dim), Image.Resampling.LANCZOS)
        offset = (fg_size - icon_dim) // 2
        fg_im.paste(resized_fg, (offset, offset), resized_fg)
        fg_im.save(os.path.join(folder, "ic_launcher_foreground.png"))

        # 2. ic_launcher.png (Legacy square launcher icon with white background & rounded corners)
        legacy_im = Image.new('RGBA', (legacy_size, legacy_size), (255, 255, 255, 255))
        draw_leg = ImageDraw.Draw(legacy_im)
        icon_leg_dim = int(legacy_size * 0.72)
        resized_leg = icon_square.resize((icon_leg_dim, icon_leg_dim), Image.Resampling.LANCZOS)
        leg_offset = (legacy_size - icon_leg_dim) // 2
        legacy_im.paste(resized_leg, (leg_offset, leg_offset), resized_leg)
        legacy_im.save(os.path.join(folder, "ic_launcher.png"))

        # 3. ic_launcher_round.png (Circular launcher icon)
        round_mask = Image.new('L', (legacy_size, legacy_size), 0)
        d_mask = ImageDraw.Draw(round_mask)
        d_mask.ellipse((0, 0, legacy_size - 1, legacy_size - 1), fill=255)
        round_im = Image.new('RGBA', (legacy_size, legacy_size), (255, 255, 255, 255))
        round_im.paste(resized_leg, (leg_offset, leg_offset), resized_leg)
        round_im.putalpha(round_mask)
        round_im.save(os.path.join(folder, "ic_launcher_round.png"))

    print("Android mipmap icons completed.")

def generate_android_splashes(full_logo):
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

    lw, lh = full_logo.size

    for folder_name, (w, h) in splashes.items():
        folder = os.path.join(RES_DIR, folder_name)
        os.makedirs(folder, exist_ok=True)

        splash = Image.new('RGBA', (w, h), (255, 255, 255, 255))

        # Size logo to fit nicely in the middle of splash
        # In portrait: fit ~58% of width; In landscape: fit ~42% of width
        is_port = h > w
        scale_pct = 0.58 if is_port else 0.40
        target_w = int(w * scale_pct)
        target_h = int(lh * target_w / lw)

        # Guard against exceeding height
        if target_h > h * 0.35:
            target_h = int(h * 0.35)
            target_w = int(lw * target_h / lh)

        scaled_logo = full_logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        pos = ((w - target_w) // 2, (h - target_h) // 2)
        splash.paste(scaled_logo, pos, scaled_logo)

        splash.save(os.path.join(folder, "splash.png"))

    print("Android splash screens completed.")

if __name__ == '__main__':
    full_logo, logo_white, icon_square = generate_base_assets()
    generate_web_icons(icon_square, full_logo)
    generate_app_thumbnail(full_logo, icon_square)
    generate_android_icons(icon_square, full_logo)
    generate_android_splashes(full_logo)
    print("ALL APP ASSETS GENERATED SUCCESSFULLY!")

