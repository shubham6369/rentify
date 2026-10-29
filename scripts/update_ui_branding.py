import os

PROJECT_ROOT = r"C:\Users\hp\Desktop\hotel managementapp"

def update_home_page():
    page_path = os.path.join(PROJECT_ROOT, "src", "app", "page.tsx")
    with open(page_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Step 1: Replace origami plane and text with official logo card
    # Find lines 212 to 251
    lines = content.splitlines(keepends=True)
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if "{/* Middle Logo & Branding */}" in line:
            new_lines.append(line)
            # Find the closing </div> of this block (line ~251)
            # Skip until after the block ends
            j = i + 1
            while j < len(lines) and "{/* Bottom Section: Heritage City Skyline" not in lines[j]:
                j += 1
            # Insert the clean official Rentify logo card
            new_lines.append('            <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto relative z-10 px-4">\n')
            new_lines.append('              <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-2xl shadow-indigo-950/40 border border-white/40 max-w-[320px] sm:max-w-[360px] transform hover:scale-102 transition-all duration-300">\n')
            new_lines.append('                <img\n')
            new_lines.append('                  src="/images/rentify-logo.png"\n')
            new_lines.append('                  alt="Rentify - Your Room, Your Way"\n')
            new_lines.append('                  className="w-full h-auto object-contain select-none"\n')
            new_lines.append('                />\n')
            new_lines.append('              </div>\n')
            new_lines.append('            </div>\n\n')
            i = j
            continue

        if "STEP 2: ONBOARDING SCREEN" in line:
            new_lines.append(line)
            i += 1
            # Advance until top brand row
            while i < len(lines) and "Top Brand / Skip" not in lines[i]:
                new_lines.append(lines[i])
                i += 1
            new_lines.append(lines[i]) # Top Brand / Skip
            i += 1
            new_lines.append(lines[i]) # <div className="pt-2 flex items-center justify-between">
            i += 1
            # Skip the old BedDouble box and replace with official logo
            while i < len(lines) and "<button" not in lines[i]:
                i += 1
            new_lines.append('              <img\n')
            new_lines.append('                src="/images/rentify-logo.png"\n')
            new_lines.append('                alt="Rentify - Your Room, Your Way"\n')
            new_lines.append('                className="h-8 sm:h-9 w-auto object-contain select-none"\n')
            new_lines.append('              />\n')
            continue

        if "Back to onboarding" in line:
            new_lines.append(line)
            i += 1
            # Skip until closing button
            while i < len(lines) and "</button>" not in lines[i]:
                new_lines.append(lines[i])
                i += 1
            new_lines.append(lines[i]) # </button>
            i += 1
            # Skip the old BedDouble box and text
            while i < len(lines) and "Hero Content: Title" not in lines[i]:
                i += 1
            new_lines.append('\n                  <img\n')
            new_lines.append('                    src="/images/rentify-logo-white.png"\n')
            new_lines.append('                    alt="Rentify - Your Room, Your Way"\n')
            new_lines.append('                    className="h-8 sm:h-9 w-auto object-contain select-none ml-1"\n')
            new_lines.append('                  />\n')
            new_lines.append('                </div>\n')
            new_lines.append('              </div>\n\n')
            new_lines.append('              {/* Hero Content: Title & 3D Bedroom Illustration */}\n')
            i += 1
            continue

        new_lines.append(line)
        i += 1

    with open(page_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Updated src/app/page.tsx successfully.")

def update_hotels_page():
    page_path = os.path.join(PROJECT_ROOT, "src", "app", "hotels", "page.tsx")
    with open(page_path, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines(keepends=True)
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if "{/* Center: Rentify Brand Identity */}" in line:
            new_lines.append(line)
            # Skip old BedDouble logo and text
            while i < len(lines) and "Right: Notifications" not in lines[i]:
                i += 1
            new_lines.append('            <Link href="/" className="flex items-center gap-2.5">\n')
            new_lines.append('              <img\n')
            new_lines.append('                src="/images/rentify-logo-white.png"\n')
            new_lines.append('                alt="Rentify - Your Room, Your Way"\n')
            new_lines.append('                className="h-8 sm:h-9 w-auto object-contain select-none"\n')
            new_lines.append('              />\n')
            new_lines.append('            </Link>\n\n')
            new_lines.append('            {/* Right: Notifications & User Profile Avatar */}\n')
            i += 1
            continue

        new_lines.append(line)
        i += 1

    with open(page_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Updated src/app/hotels/page.tsx successfully.")

def update_footer():
    footer_path = os.path.join(PROJECT_ROOT, "src", "components", "Footer.tsx")
    with open(footer_path, "r", encoding="utf-8") as f:
        content = f.read()

    old_block = '''        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800">Find Your Stay</span>
          <span>&copy; {new Date().getFullYear()} Find Your Stay India. All rights reserved.</span>
        </div>'''

    new_block = '''        <div className="flex items-center gap-2.5">
          <img
            src="/images/rentify-icon.png"
            alt="Rentify"
            className="w-6 h-6 object-contain"
          />
          <span className="font-bold text-slate-800">Rentify</span>
          <span>&copy; {new Date().getFullYear()} Rentify - Your Room, Your Way. All rights reserved.</span>
        </div>'''

    if old_block in content:
        content = content.replace(old_block, new_block)
    else:
        # handle line endings
        content = content.replace(old_block.replace('\n', '\r\n'), new_block.replace('\n', '\r\n'))

    with open(footer_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated src/components/Footer.tsx successfully.")

if __name__ == '__main__':
    update_home_page()
    update_hotels_page()
    update_footer()

