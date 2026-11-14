# UI verification

Checked locally on 14 November 2026 using Chromium and a Python HTTP server. This is implementation evidence, not a WCAG certification. External service availability, real-device keyboards, screen readers, Lighthouse and field Web Vitals were not measured.

## Design decisions

Reading: a personal portfolio for recruiters and collaborators, with personal gallery and timetable pages. ENERGY 2 / RHYTHM 2 / MOTION 1.

- Color: DESIGN.md neutrals and one blue accent distinguish actions from content. Filled actions use a separate dark blue to keep white labels legible in both themes.
- Typography: system fonts follow the supplied SF direction without downloading proprietary fonts. Body is 17px; secondary information is generally 14px.
- Composition: portrait, editorial text, experience rows and the real project screenshot provide distinct content hierarchies.
- Spacing: 48px narrow-screen sections and 80px desktop sections connect related content without viewport-sized gaps.
- Cards: photos and actionable sessions retain containers; skills and biography use flat text groups.
- Assets: existing photos, logo and Minecraft illustrations are preserved. Visible captions identify Minecraft as illustration. No new identities, images or factual claims were added.
- Icons: existing navigation, calendar, location and close glyphs identify controls; sparkles and repeated CTA arrows were removed from visible presentation.
- Motion: hover/press and scrolling feedback remain. Reveal, tilt and perpetual orbit effects were removed.
- Timeline hatch: the UNILA pattern distinguishes campus tracks without requiring color perception.

## Recorded interactions

- Portfolio menu: opens, Escape closes, and all four section links navigate and close the menu. Clicking a replaced icon no longer bubbles into the outside-click close handler.
- Project details: opens the native dialog; close button and Escape close it; focus returns to the trigger.
- Gallery card: a native button opens the lightbox with Enter or click; close and Escape work; focus returns to the button.
- Timetable: both campus controls, daily and weekly modes, all seven days and Today work.
- Day navigation: ArrowRight and End move selection and keyboard focus correctly.
- Session details: opens from a session; Escape closes it and restores focus.
- Weekly shared breaks: disclosure opens and a day button updates the selected day.
- Theme: toggles on all four pages, including the archive.
- Gallery states: empty JSON yields zero memories and no stale date/location; failed JSON uses fallback; with fallback absent, retry recovers after the response becomes available.
- Blocked storage: theme and campus controls remain usable.
- JavaScript disabled: portfolio content and gallery fallback instructions remain visible.
- External demo, social, email and Drive destinations retain their existing hrefs. Remote availability and email-client behavior were not tested.

## Checks

- PASS: 12/12 Node timetable tests, including WIB boundaries, overlap, shared breaks and hidden-route invariants.
- PASS: ESLint and strict TypeScript checkJs, using the README commands.
- PASS: all four pages at 320, 375, 400, 640, 768, 1024 and 1440px in light and dark themes, without document horizontal overflow.
- PASS: text resized to 200% at 320px with reduced motion on portfolio, gallery and timetable, without document overflow.
- PASS: no page exceptions during the normal interaction checks.
- PASS: screenshot review of the portfolio and mobile gallery/timetable. Media is lazy below the fold, so a screenshot taken before scrolling may show a reserved photo area.
- PASS: action contrast is 5.57:1 normally and 7.29:1 on hover. Muted text is at least 5.31:1 on light surfaces; dark muted text is 6.80:1 on the muted surface; dark links are 4.87:1 or higher.

## Delivery Gate

- R-02 PASS: authored UI copy uses no em dash.
- R-03 PASS: viewport/resize checks above; shared icon buttons are 44px; narrow day buttons reflow into rows.
- R-17, R-18 PASS: no new statistics or testimonials; maintenance percentage removed; gallery totals derive from loaded data.
- R-23 PASS: no new visual assets; navigation changes follow the approved plan.
- R-24 PASS: existing section and page destinations preserved.
- R-25 PASS for implemented tokens: ratios recorded above; focus uses separate contrasting tokens.
- R-26 PASS for local flows: interaction evidence above; external integrations retain their existing destinations.
- R-27 PASS: gallery loading/empty/error/retry and local timetable initialization/error/empty states are present.
- R-28 PASS: no FAQ introduced.
- R-32 PASS for tested keyboard flows: native controls, skip links, focus indicators, Escape and focus restoration.
- R-33 PASS: changes made directly in source, with no source-rewriting helper scripts.
- R-34 PASS: both themes checked at every listed width.
- R-35 PASS: site served and exercised in Chromium; recorded actions above. No build step exists.
- R-36, R-38 PASS: facts remain from existing content; no fabricated performance or compliance claims.
- R-37 PASS: DESIGN.md direction and approved contextual adaptation used.
- R-39 PASS by source inspection and tested flows: native gallery trigger, names, labels, image alternatives, cursor rules and reduced motion. Full assistive-technology testing remains outside this evidence.
- R-40 PASS by source inspection: portrait is eager/high priority, photo areas reserve dimensions/aspect ratios, no new head-blocking third-party script, no invented metrics.
- Purpose gates PASS: reasons for palette, font, layout, cards, icons, surfaces and motion are recorded above. Blur is confined to headers, shadows are disabled, and the only CSS pattern identifies campus data.
- Liveliness PASS by visual review: declared dials, portrait/name focal point, restrained accent, structural whitespace and repeated illustration/editorial identity.
- Craftsmanship and quality locks PASS within tested coverage: actual content drives layout, native interactions work, both themes reflow, and typography/radii share tokens. This report does not claim remote-service or real-device verification.

## Unchanged contracts

No runtime dependencies, backend, migrations, data or calculation changes. The theme and schedule storage keys, `portfolio:render`, session IDs, Vercel rewrites, noindex and sitemap exclusions are preserved. DESIGN.md was already untracked and is intentionally not part of this implementation commit.
