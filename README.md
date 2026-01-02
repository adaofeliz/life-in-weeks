# Your Life in Weeks

A beautiful visual representation of a 90-year human life where each box is one week. Inspired by Tim Urban's famous [Wait But Why](https://waitbutwhy.com/2014/05/life-weeks.html) post.

![Life in Weeks Preview](https://raw.githubusercontent.com/adaofeliz/life-in-weeks/refs/heads/main/docs/images/life-in-weeks-preview.png)

## Features

- **Interactive visualization** - Hover over any week to see which year and week it represents
- **Real-time stats** - See weeks lived, weeks remaining, and percentage of life
- **Download as PNG** - Save your personalized life chart as a high-quality image
- **Responsive design** - Works beautifully on all devices
- **API endpoint** - Get your life stats as JSON

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

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - Visualization rendering

## Credits

- Concept inspired by Tim Urban's [Your Life in Weeks](https://waitbutwhy.com/2014/05/life-weeks.html) post on Wait But Why
- Quote by Jack Kornfield

## License

MIT
