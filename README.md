# Restaurant L'endroit_parfait — Restaurant Website

A beautiful, multilingual React website for **Restaurant L'endroit_parfait**, welcoming guests and families. Available in **English**, **French**, and **Arabic** (with RTL support).

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Add your media

Copy your files into `public/assets/`:

| Your file | Save as |
|-----------|---------|
| Logo | `public/assets/logo.png` (or keep `logo.svg`) |
| Restaurant photo | `public/assets/restaurant.jpg` |
| Video 1 | `public/assets/videos/video1.mp4` |
| Video 2 | `public/assets/videos/video2.mp4` |
| Video 3 | `public/assets/videos/video3.mp4` |

Refresh the browser after adding files.

## Build for production

```bash
npm run build
npm run preview
```

Deploy the `dist` folder to Netlify, Vercel, or any static host.

## Features

- Hero with background video (falls back to photo)
- About section with your restaurant image
- Video gallery (hover to play)
- Family & dining experience highlights
- Reservation contact form
- Language switcher: EN / FR / ع (Arabic RTL)
