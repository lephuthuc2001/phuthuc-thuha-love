# Thu Hà & Phú Thức - Love Story Website

A beautiful, interactive love story website migrated from vanilla JavaScript to Next.js with TypeScript.

## 🎉 Migration Complete

The project has been successfully migrated from the vanilla JS project at `phuthuc-thuha` to this Next.js project.

## ✨ Features

- **Authentication Screen**: Date-based login to access the love story
- **Live Counters**: Real-time countdown showing days, hours, minutes, and seconds together
- **Photo Gallery**: Beautiful Swiper carousel with coverflow effect displaying memories
- **Milestones Tracker**: Visual timeline of relationship milestones
- **Next Milestone Countdown**: Counter showing time until the next anniversary
- **TikTok Integration**: Embedded TikTok profile to follow the journey
- **Animated Background**: Falling hearts animation
- **Music Player**: Background music toggle (add your own music file)
- **Glassmorphism Design**: Modern glass-effect cards with beautiful gradients
- **Responsive Design**: Works perfectly on all devices
- **Custom 404 Page**: Beautiful error page with Vietnamese text

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
my-nextjs-project/
├── app/
│   ├── page.tsx              # Main love story page
│   ├── not-found.tsx         # Custom 404 error page
│   ├── layout.tsx            # Root layout with Font Awesome
│   ├── love-story.css        # Styles for main page
│   ├── error-page.css        # Styles for error page
│   └── globals.css           # Global Tailwind styles
├── public/
│   └── img/                  # All images from original project
│       ├── thuhaphuthuc1.jpg
│       ├── thuhaphuthuc2.jpg
│       └── ... (9 images total)
└── package.json
```

## 🎨 Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Swiper**: Modern touch slider for the gallery
- **Font Awesome**: Icon library
- **Google Fonts**: Dancing Script & Poppins fonts

## 🔑 Login Credentials

The special date to access the website is: **29-06-2025**

## 🎵 Adding Background Music

To add background music:

1. Add your music file to the `public` folder (e.g., `public/love-song.mp3`)
2. Update the audio source in `app/page.tsx`:
```tsx
<audio id="bgMusic" loop>
  <source src="/love-song.mp3" type="audio/mpeg" />
</audio>
```

## 📝 Customization

### Update Dates

Edit the dates in `app/page.tsx`:

```typescript
const startDate = new Date('2025-07-01T00:00:00');
const nextMilestoneDate = new Date('2026-01-01T00:00:00');
```

### Update Login Credential

Change the special date in `app/page.tsx`:

```typescript
const correctCredential = "29-06-2025";
```

### Add More Images

1. Add images to `public/img/`
2. Update the `images` array in `app/page.tsx`

## 🌐 Deployment

This project can be deployed to:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify** (already configured)
- Any platform supporting Next.js

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## 📱 Social Media

Follow the journey on TikTok: [@thucvoihane](https://www.tiktok.com/@thucvoihane)

## ❤️ Made with Love

Created with ❤️ for Thu Hà & Phú Thức's beautiful love story.

---

**Note**: This is a private love story website. The login credential is known only to the couple.