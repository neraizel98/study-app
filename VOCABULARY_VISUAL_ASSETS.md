# Vocabulary illustration assets

Generated using the built-in image generation tool on 2026-11-02. The selected outputs were copied into this repository as optimized 1200×900 WebP assets. No external illustration service or CLI image generation was used. Original generated PNGs are retained outside the repository. The app adds all numbers, leader lines, vocabulary text and pronunciation controls separately; those are not baked into these pictures.

| Topic | Runtime asset |
| --- | --- |
| Plant | assets/vocabulary/plant-v1.webp |
| Body | assets/vocabulary/body-v1.webp |
| Face | assets/vocabulary/face-v1.webp |
| House | assets/vocabulary/house-v1.webp |
| Bicycle | assets/vocabulary/bicycle-v1.webp |

Callout coordinates are authored for these exact images in vocabulary-visual.js. When replacing an image, recheck every numbered endpoint on mobile and desktop. These are illustrative examples, not claims that all plants or buildings have the depicted parts. The generic flowering plant is not identified as a particular species.

## Final generation prompts

### Plant and body: shared prefix

Use case: scientific-educational. Create a finished premium illustrated vocabulary textbook asset. Landscape 4:3 composition, entire subject centered within the middle 65 percent of canvas, generous clear margins on all four sides for interactive callouts to be added in code. Warm solid ivory background #fbf7ef. Consistent modern educational illustration: natural accurately drawn forms, refined soft gouache rendering, clean gently shaded silhouettes, restrained forest green, muted sage, cream and warm tan palette. Moderate detail, clearly more polished than flat vector clipart, but substantially simpler than a photoreal botanical plate. Crisp identifiable parts readable on a phone. No labels, numbers, lettering, arrows, UI, watermark or decorations.

Plant suffix: One upright small flowering plant with a single simple ivory five-petalled open flower at top, a few broad green leaves, a recognizable single main stem, and visible branching roots below a narrow cutaway slice of soil. Roots clearly connected to stem. Very minimal soil detail, no fine leaf vein network, no dense root hair detail. Whole plant including flower and roots visible. Flower near upper center, prominent leaf on right middle, stem center, roots lower center. Scientifically coherent generic flowering plant.

Body suffix: Full-body front view of one friendly school-age child, anatomically correct proportions and hands, standing upright with arms gently away from torso, wearing a simple muted sage short-sleeved shirt, warm tan shorts, bare feet. Head, arms, hands, legs and feet must be clearly distinct and unobstructed. Calm natural small smile, short dark brown hair. Modest ordinary educational body-parts illustration. No props, no extra people, no background scene.

### Face, house and bicycle: shared prefix

Use case: scientific-educational. Finished premium modern illustrated English vocabulary textbook asset, landscape 4:3 canvas, entire subject centered in middle 65 percent with generous blank margins for numbered labels added later. Warm solid ivory #fbf7ef background, refined soft gouache illustration, natural accurate forms, gentle shading, restrained forest green, sage, cream and warm tan. Clean moderate detail clearly readable on phones, not photoreal, not crude vector clipart. No text, labels, numbers, arrows, UI, watermark, scenery or decoration.

Face suffix: Front-facing head portrait of a friendly school-age child with short neat dark brown hair, simple natural face, two clearly visible unobstructed ears, open eyes, recognizable nose and closed gently smiling mouth. Include full head, neck and very top of a plain sage shirt, no torso or hands. Face centered, comfortably large but with blank space around head. Human anatomy correct, calm educational illustration, soft clean simplified skin rendering without photo texture.

House suffix: One small simple house in perfectly front-facing orthographic elevation. Cream plaster wall facade, muted sage pitched roof, ONE short rectangular warm tan brick chimney visibly rising above the RIGHT roof slope, one clear rectangular window on LEFT facade, one wooden closed front door on RIGHT facade, visible unobstructed cream wall between and beside openings. Whole building visible including foundation. No smoke, plants, garden, landscape, people, text or props. Window, door, wall, roof and chimney clearly distinct, modest architectural detail and gentle soft shading.

Bicycle suffix: One mechanically correct ordinary green bicycle, perfectly side-on viewed from its drivetrain RIGHT side, front wheel on RIGHT, rear wheel LEFT. Two equal round complete wheels with lightly drawn spokes, correct diamond frame and rigid front fork, black saddle, upright handlebar with grips at top right, crank with visible near-side pedal, clearly visible chain loop from rear sprocket at rear axle to front chainring near lower middle. Complete bicycle entirely visible, unobscured chain and pedal distinctly separated. Simplified clean refined educational gouache drawing, forest green frame, dark warm gray tires, metallic muted silver components, tan saddle and grips. No training wheels, baskets, people or scenery.

## Verification

- Five locally decoded images, 25 separately rendered labels, US pronunciation callback, unrelated-word cleanup and next-word navigation.
- Chrome mobile emulation at 390×844 and desktop at 1280×900. Physical iPhone not tested.
- All five assets explicitly precached in the service worker.
- No changes to vocabulary pools, quizzes, learning completion or stored learner records.
