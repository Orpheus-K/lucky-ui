# Changelog

## Unreleased
- **Breaking:** Rebuilt `lk-keyboard` as a flat, solid-color panel hosted by `lk-popup`; removed the legacy blur, sound, internal class/style hook props, and per-key class/style fields.
- Changed the keyboard defaults to a headerless layout with overlay enabled, while retaining explicit title, close, and confirm actions.

## 1.0.1（2026-07-12）
- Fixed `lk-segmented` slider measurement when rendered inside modal.
- Improved `lk-tooltip` popup motion and custom content rendering.
- Enhanced `lk-dropdown` with aligned action menus and related transition support.
- Removed local file path references from repository sources.
- Kept docs phone-preview spacing hotfix and segmented `scroll-view` max-width override from main.

## 1.0.0（2026-06-23）
- Added a default Vue plugin export with `install(app)` for public `Lk*` components.
- Added package publishing metadata for the `src/uni_modules/lucky-ui` package.
- Published the npm package under the public name `uni-lucky-ui`.
- Added package-level README, LICENSE, and changelog assets.
- Kept internal demo/debug components out of default plugin registration.
