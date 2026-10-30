#!/bin/sh
# Makes Governmint's icons from the Eurth coin (src/assets/eurth-coin.svg) with headless Chrome:
# the favicon (SVG, and an .ico with 16, 32 and 48 pixel images) and the app icons for phones
# (the coin on Eurth blue: apple-touch-icon.png, icon-192.png, icon-512.png). Run from the repo:
#   sh scripts/make-icons.sh
set -e
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
coin="$PWD/src/assets/eurth-coin.svg"
work=$(mktemp -d)

# render NAME SIZE BACKGROUND COIN_SIZE: the coin centred on a square, transparent if BACKGROUND is "none".
render() {
  if [ "$3" = none ]; then bg=transparent; flag=--default-background-color=00000000; else bg="$3"; flag=; fi
  pad=$(( ($2 - $4) / 2 ))
  printf '<!doctype html><body style="margin:0;background:%s"><img src="file://%s" style="display:block;margin:%spx;width:%spx;height:%spx"></body>' \
    "$bg" "$coin" "$pad" "$4" "$4" > "$work/$1.html"
  "$chrome" --headless=new --hide-scrollbars --disable-gpu --allow-file-access-from-files $flag \
    --window-size="$2,$2" --screenshot="$work/$1.png" "file://$work/$1.html" >/dev/null 2>&1
}

cp "$coin" public/favicon.svg
for size in 16 32 48; do render "favicon-$size" "$size" none "$size"; done
render apple-touch-icon 180 '#2698d4' 140
render icon-192 192 '#2698d4' 136
render icon-512 512 '#2698d4' 360
cp "$work/apple-touch-icon.png" "$work/icon-192.png" "$work/icon-512.png" public/

# Pack the three small PNGs into one .ico (an .ico may hold PNG images as they are).
python3 -I - "$work" <<'PY'
import struct, sys
work = sys.argv[1]
images = [(size, open(f'{work}/favicon-{size}.png', 'rb').read()) for size in (16, 32, 48)]
header = struct.pack('<HHH', 0, 1, len(images))
offset = 6 + 16 * len(images)
entries, data = b'', b''
for size, png in images:
    entries += struct.pack('<BBBBHHII', size, size, 0, 0, 1, 32, len(png), offset + len(data))
    data += png
open('public/favicon.ico', 'wb').write(header + entries + data)
PY
rm -r "$work"
echo "Icons made: public/favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png"
