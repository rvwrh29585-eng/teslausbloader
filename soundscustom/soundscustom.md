# Custom lock sounds

Add your own `.wav` files here. They will appear on the site after you push and the site redeploys.

## Naming convention

Use this format so the sound card shows the right **category** and **title**:

```
{category}_{descriptive-name}.wav
```

- **Category**: One word (or short tag) before the first `_`. Shown on the card as the category label (e.g. `90s`, `movies`, `games`).
- **Rest**: Everything after the first `_`. Use hyphens between words. The site turns hyphens into spaces and title-cases the text for the display name.

**Examples**

| Filename | Category | Display name on card |
|----------|----------|----------------------|
| `90s_vanilla-ice_ice-ice-baby-outro.wav` | 90s | Vanilla Ice Ice Ice Baby Outro |
| `movies_darth-vader-breathing.wav` | movies | Darth Vader Breathing |
| `games_pac-man-chomp.wav` | games | Pac Man Chomp |

Use WAV format. No manifest or config needed—just add the file and push.
