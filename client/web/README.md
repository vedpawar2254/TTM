This is a [Next.js](https://nextjs.org) project for the TalktoMe web frontend.

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+ (for backend services)
- Backend services running (see main README.md)

### Development

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The page auto-updates as you edit files.

#### 3. Backend Services
Make sure the following services are running:
- ATE Service on port 8001
- Crisis Service on port 8002
- Emotion Service on port 8003
- Filter Service on port 8004

See the main [README.md](../../README.md) for full setup instructions.

## Building for Production

```bash
npm run build
npm run start
```

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `components/` - Reusable React components
- `public/` - Static assets

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
