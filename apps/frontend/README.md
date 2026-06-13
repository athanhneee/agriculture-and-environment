This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses standard system fonts to optimize performance and ensure stable builds without remote font dependencies.

## Rendering Strategies

To optimize performance and user experience, this application leverages three different Next.js rendering strategies:

### 1. Server-Side Rendering (SSR) & Dynamic Rendering
- **Location**: `src/app/dashboard/**`
- **Why**: The dashboard contains personalized user data (authentication/cookies) and real-time sensor metrics via WebSockets. Because this data changes constantly and requires user session validation on every request, the dashboard layout is configured with `export const dynamic = "force-dynamic"`. This ensures the content is always fresh and secure.

### 2. Static Site Generation (SSG)
- **Location**: `src/app/farm-guide/[slug]/page.tsx`
- **Why**: Detailed guide contents do not change frequently and do not depend on the user's authentication state. By using `generateStaticParams()`, these pages are pre-built into static HTML files at build time. This provides instantaneous page loads and optimal SEO.

### 3. Incremental Static Regeneration (ISR)
- **Location**: `src/app/farm-guide/page.tsx` and `src/app/farm-guide/[slug]/page.tsx`
- **Why**: While the guides are static, we might want them to update periodically if new content is published without requiring a full rebuild. We use `export const revalidate = 3600` (1 hour) so Next.js automatically regenerates these pages in the background after the cache expires.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
