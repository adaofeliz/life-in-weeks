# Your Life in Weeks

A beautiful visual representation of a 90-year human life where each box is one week. Inspired by Tim Urban's famous [Wait But Why](https://waitbutwhy.com/2014/05/life-weeks.html) post.

![Life in Weeks Preview](https://raw.githubusercontent.com/adaofeliz/life-in-weeks/refs/heads/main/docs/images/life-in-weeks-preview.png)

## Features

- **Interactive visualization** - Hover over any week to see which year and week it represents
- **Current week indicator** - Visual highlighting of the week you're currently living
- **Fading timeline effect** - Older weeks gradually fade, creating a visual sense of time passing
- **Real-time stats** - See weeks lived, weeks remaining, percentage of life, and years lived
- **Progress bar** - Visual progress bar showing your life progression
- **Download as PNG** - Save your personalized life chart as a high-quality image
- **Shareable links** - Copy and share your personalized life chart URL with others
- **iOS Wallpaper automation** - Set up automatic daily wallpaper updates on your iPhone lock screen
- **Custom image generation** - Generate wallpaper images for any iPhone model (iPhone 14-17 series, SE)
- **Responsive design** - Works beautifully on all devices
- **API endpoints** - Get your life stats as JSON or generate custom-sized images

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

The easiest way to deploy this app is with [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/adaofeliz/life-in-weeks)

Or deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## API Usage

### Get Life Stats

```
GET /api/stats?birth_date=1990-01-15
```

**Response:**

```json
{
  "birth_date": "1990-01-15",
  "current_date": "2024-01-15",
  "total_weeks_in_90_years": 4680,
  "weeks_lived": 1774,
  "weeks_remaining": 2906,
  "percentage_lived": 37.91,
  "years_lived": 34.0,
  "days_lived": 12419,
  "days_remaining": 20431
}
```

### Generate Life Chart Image

Generate a custom-sized PNG image of your life in weeks, perfect for wallpapers.

```
GET /api/image?birthDate=1990-01-15&width=1179&height=2556
```

**Parameters:**
- `birthDate` (required) - Your birth date in YYYY-MM-DD format
- `width` (optional) - Image width in pixels (default: 1170)
- `height` (optional) - Image height in pixels (default: 2532)

**Supported iPhone Sizes:**
| Model | Width | Height |
|-------|-------|--------|
| iPhone 17 Pro Max | 1320 | 2868 |
| iPhone 17 Pro | 1206 | 2622 |
| iPhone 16 Pro Max | 1320 | 2868 |
| iPhone 16 Pro | 1206 | 2622 |
| iPhone 16 Plus | 1290 | 2796 |
| iPhone 16 | 1179 | 2556 |
| iPhone 15 Pro Max | 1290 | 2796 |
| iPhone 15 Pro | 1179 | 2556 |
| iPhone SE (3rd gen) | 750 | 1334 |

### Shareable URLs

Share your personalized life chart with others using URL parameters:

```
https://your-domain.com/?birthDate=1990-01-15
```

## iOS Lock Screen Wallpaper

Set up an iOS Shortcut automation to automatically update your lock screen wallpaper daily:

1. Open the app and enter your birth date
2. Click the phone icon to open the iOS Wallpaper Setup modal
3. Select your iPhone model
4. Follow the step-by-step instructions to create a Shortcuts automation

The automation will fetch a fresh image from the API at midnight each day, keeping your lock screen updated with your life progress.

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - Interactive visualization rendering
- [@vercel/og](https://vercel.com/docs/functions/og-image-generation) - Dynamic image generation for wallpapers

## Credits

- Concept inspired by Tim Urban's [Your Life in Weeks](https://waitbutwhy.com/2014/05/life-weeks.html) post on Wait But Why
- Quote by Jack Kornfield

## License

MIT
