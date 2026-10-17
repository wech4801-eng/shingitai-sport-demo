// Copies and converts the real Shingitai visuals used by the mockup into public/img.
// Sources: the Flutter app assets, the live site assets and the 1170x2532 app captures.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
// Paths are relative to this project folder; override them with env vars if the folders move.
const APP = process.env.APP_ASSETS ?? '../../app sport/fitapp_flutter/assets/images';
const SITE = process.env.SITE_ASSETS ?? '../shingitai-sport-hostinger/public/assets';
const CAP = process.env.APP_CAPTURES ?? 'captures';
const out = name => `public/img/${name}.webp`;
await mkdir('public/img/ex', { recursive: true });
const jobs = [
  [`${APP}/running/city.png`, 'scene-city', 1920], [`${APP}/running/stadium.png`, 'scene-stadium', 1920],
  [`${APP}/running/bridge.png`, 'scene-bridge', 1400], [`${APP}/running/park.png`, 'scene-park', 1400],
  [`${APP}/sessions/full.png`, 'athlete-full', 1400], [`${APP}/sessions/season.png`, 'athlete-season', 1400],
  [`${CAP}/app-home.png`, 'screen-muscu', 720], [`${CAP}/profil-top.png`, 'screen-profil', 720],
  [`${CAP}/profil-trophees.png`, 'screen-trophees', 720], [`${CAP}/run-history.png`, 'screen-runs', 720],
  [`${CAP}/share-card-1080.png`, 'share-run', 720],
  [`${SITE}/screen-course-demo.webp`, 'screen-course', 720], [`${SITE}/screen-nutrition-demo.webp`, 'screen-nutrition', 720],
  [`${SITE}/screen-strength.webp`, 'screen-strength', 720],
];
for (const [src, name, w] of jobs) await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out(name));
for (const id of ['squat_goblet', 'bench_bar', 'row_cable', 'deadlift', 'pullup', 'lunge_db', 'shoulder_db', 'hip_thrust', 'plank'])
  await sharp(`${SITE}/exercices/thumbs/${id}.webp`).toFile(`public/img/ex/${id}.webp`);
console.log('ok');
