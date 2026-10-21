# fsgui GPUI Demo App

A basic, clean GPUI demonstration app showing how `@fractaldesign/fsgui` tokens and styling conventions are used in a real GPUI window.

## Features Shown

1. **Window Background & Layout**: Uses `theme.bg`, `theme.bg_surface`, and `SPACE_LG`.
2. **Header Bar**: Displays status badges with semantic colors (`theme.success_bg`, `theme.info_bg`).
3. **Card Container**: Uses `theme.bg_surface`, `theme.border_subtle`, and `RADIUS_MODERN` (4px).
4. **Button Variants**: Primary button (`theme.brand`, `theme.brand_alt` hover) and Secondary button (`theme.bg_raised`, `theme.state_hover` hover).
5. **Semantic Intent Badges**: Success, Warning, Danger, and Info tags.
6. **Fractal Geometry Scale**: Visual demonstration of radii strictly adhering to the 4px / 8px limit (`RADIUS_SQUARE` = 0px, `RADIUS_MIN` = 2px, `RADIUS_MODERN` = 4px, `RADIUS_CURVED` = 8px).

## How to Run

From the `packages/fsgui` directory:

```sh
# 1. Generate the latest tokens from fsgui TypeScript config
npm run demo:generate

# 2. Check compilation
npm run demo:check

# 3. Launch the GPUI window
npm run demo:run
# or simply:
npm run demo
```
