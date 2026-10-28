#!/usr/bin/env bash
# Re-generates site/assets/frames from the source clips in videos/.
# Only needed if the source videos change. Requires ffmpeg on PATH.
set -e
ROOT="C:/Users/DC/Desktop/Diego3dwebsites/Diego3DWebsites/Relyc contractor"
PROJ="$(cd "$(dirname "$0")/../.." && pwd)"
V1="$ROOT/videos/Building_construction_transforma…_202609051807.mp4"
V2="$ROOT/videos/Creating_home_renovation_transfo…_202609051807.mp4"
V3="$ROOT/videos/Technicians_repairing_and_mainta…_202609051808.mp4"
OUT="$PROJ/assets/frames"

# Source clips are 640x360. Act I is denoised + lanczos-upscaled + sharpened to
# 1280x720 (desktop) / 640x360 (mobile) to hide compression blocking; film.js sizes
# its canvas from the frames, so a sharper source only needs new sizes here.
CLEAN="hqdn3d=1.2:1.2:4:4"
EQ="eq=contrast=1.06:saturation=0.88:gamma=0.97"

# act | src | desktop_fps | desktop_count | mobile_fps | mobile_count | [desktop WxH] [mobile WxH] [dq] [mq]
run () {
  local act="$1" src="$2" dfps="$3" dn="$4" mfps="$5" mn="$6"
  local dsz="${7:-800:450}" msz="${8:-480:270}" dq="${9:-68}" mq="${10:-62}"
  mkdir -p "$OUT/$act/w" "$OUT/$act/m"
  rm -f "$OUT/$act/w"/*.webp "$OUT/$act/m"/*.webp
  ffmpeg -v error -y -i "$src" -vf "fps=$dfps,scale=800:450:flags=lanczos,eq=contrast=1.06:saturation=0.88:gamma=0.97" \
    -frames:v "$dn" -fps_mode passthrough -c:v libwebp -f image2 -quality 68 -compression_level 5 "$OUT/$act/w/%03d.webp"
  ffmpeg -v error -y -i "$src" -vf "fps=$mfps,scale=480:270:flags=lanczos,eq=contrast=1.06:saturation=0.88:gamma=0.97" \
    -frames:v "$mn" -fps_mode passthrough -c:v libwebp -f image2 -quality 62 -compression_level 5 "$OUT/$act/m/%03d.webp"
  echo "$act -> w:$(ls "$OUT/$act/w"|wc -l) ($(du -sk "$OUT/$act/w"|cut -f1)KB)  m:$(ls "$OUT/$act/m"|wc -l) ($(du -sk "$OUT/$act/m"|cut -f1)KB)"
}

run act1 "$V1" 8    80 4.8 48 1280:720 640:360 74 70
run act2 "$V2" 6.4  64 4   40
run act3 "$V3" 6.4  64 4   40

# Posters (instant paint before frames decode) - first frame of each act
for a in 1 2 3; do
  src=$(eval echo \$V$a)
  ffmpeg -v error -y -i "$src" -vf "$CLEAN,scale=1280:720:flags=lanczos,unsharp=5:5:0.55:5:5:0,$EQ" -frames:v 1 -q:v 3 "$PROJ/assets/img/act${a}-poster.jpg"
done
echo "POSTERS: $(ls "$PROJ/assets/img"/act*-poster.jpg | wc -l)"
echo "TOTAL FRAMES DIR: $(du -sh "$OUT" | cut -f1)"
echo DONE
