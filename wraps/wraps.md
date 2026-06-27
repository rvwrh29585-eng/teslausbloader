# Custom vehicle wraps

Add PNG wrap designs here, organized by **vehicle model folder**. They appear on the site after you push and the site redeploys.

## Folder layout

Use the same model slugs as [Tesla’s custom-wrap templates](https://github.com/teslamotors/custom-wraps):

```
wraps/
  modely/                 # Model Y (pre-2025)
  modely-2025-base/       # Model Y (2025+) Standard
  modely-2025-premium/    # Model Y (2025+) Premium
  model3/                 # Model 3
  cybertruck/             # Cybertruck
  ...
```

Put one or more wrap files inside the folder for the model they target.

## File requirements (Tesla)

| Requirement | Value |
|-------------|--------|
| Format | **PNG** (not JPG) |
| Resolution | 512×512 to 1024×1024 px |
| File size | Under 1 MB |
| Filename | Alphanumeric, `_`, `-`, spaces only; max 30 characters |

## USB drive (in the car)

This repo folder is `wraps/` (lowercase). On your **USB drive**, create a folder named **`Wraps`** (capital W) at the root and copy your PNG files there.

1. Format USB as exFAT or FAT32 (not NTFS)
2. Create `Wraps/` at the root of the drive
3. Copy your `.png` file(s) into `Wraps/`
4. Plug into Tesla (centre console USB port for Paint Shop)
5. Apply: **Toybox → Paint Shop → Wraps**

Up to 10 wrap images at a time. Do not put map or firmware update files on the same drive.

## Adding a new wrap

1. Download the template for your model from [teslamotors/custom-wraps](https://github.com/teslamotors/custom-wraps)
2. Edit and export as PNG meeting the requirements above
3. Save under `wraps/{model-id}/YourWrapName.png`
4. Push — the build picks it up automatically
