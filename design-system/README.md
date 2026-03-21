# Design System Setup

This directory holds the source-of-truth design system assets for Sanocare.

## Files
- design-system/tokens/design-tokens.json: canonical design tokens.
- design-system/tokens/component-recipes.json: component-level token recipes.
- design_system.md: human-readable brand and design system guide.
- scripts/build-design-tokens.mjs: token build script.
- src/design-system/tokens.css: generated CSS custom properties.
- src/design-system/tokens.generated.js: generated JS token object.

## Commands
- npm run tokens:build
- npm run tokens:sync

## Workflow
1. Update values in design-system/tokens/design-tokens.json.
2. Run npm run tokens:build.
3. Use generated CSS variables in styles and global theme mapping.
4. Keep components token-driven and avoid hardcoded visual values.

## Notes
- src/app/globals.css imports src/design-system/tokens.css and maps app theme variables to token variables.
- Ops theme values are also mapped from design tokens.
