OUTER LINE — UNIFORM MODEL PHOTO SET

Canvas standard
- 1200 × 1500 pixels
- 4:5 portrait aspect ratio
- sRGB PNG

What was corrected
- All 35 generated portrait/model assets now use the same canvas dimensions.
- Full bodies, faces, clothing, and garment artwork were preserved without generative changes.
- Narrow source canvases were widened using their existing studio-background edge pixels, avoiding subject cropping and artificial side bars.
- The four 16:9 website hero images were intentionally excluded.

Identification
- contact-sheet.jpg visually identifies images 001–035.
- manifest.csv maps each contact-sheet number and normalized file to its original generated filename and dimensions.
- upload-aliases.csv records the supplied UUID filename that matches one generated source pixel-for-pixel.

Recommended product-card CSS
aspect-ratio: 4 / 5;
width: 100%;
height: auto;
object-fit: cover;
object-position: center;

