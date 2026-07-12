# Financial Twin AI

Financial Twin AI is a premium FinTech simulation app that creates a digital financial twin for a user and predicts how future decisions affect cash flow, savings, debt, risk, investments, financial health, and goals.

Lazyweb design report: https://www.lazyweb.com/report/lazyweb/439109ff-1df8-4af5-aee3-621756f52764/?source=create

## Demo Login

- Email: `ahmed@example.com`
- Password: `password123`

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS and shadcn-style local UI primitives
- Framer Motion, Recharts, Lucide Icons
- React Hook Form, Zod, TanStack Query
- NextAuth credentials auth
- Prisma schema and SQLite demo database
- OpenAI SDK with deterministic recommendations by default

## Pages

- `/` landing page with pricing, testimonials, FAQ, and interactive mock dashboard
- `/login`, `/signup`, `/forgot-password`
- `/onboarding`
- `/dashboard`
- `/simulations`
- `/investments`
- `/goals`
- `/reports`
- `/settings`

## Local Setup

```bash
npm install
npx prisma generate
npm run db:demo
npm run dev
```

Open `http://localhost:3000`.

`npm run db:demo` creates and seeds `prisma/dev.db` using Node 24's built-in SQLite module. The Prisma schema is still included at `prisma/schema.prisma`; on environments where Prisma's schema engine runs normally, you can also use:

```bash
npm run db:push
npm run db:seed
```

## Verification

```bash
npm test
npm run build
```

The test suite covers the financial twin engine, scenario comparison, investment projection, and deterministic Monte Carlo simulation.

## Notes

- Demo data is Saudi-focused and uses SAR.
- AI recommendations remain deterministic unless both `OPENAI_API_KEY` is set and `AI_ADVISOR_ENABLED=true`. The paid path uses a bounded per-user limiter intended only for the documented single persistent-process deployment. Keep paid AI disabled in horizontally scaled or serverless deployments until a shared rate-limit/quota store is configured.
- This is a launch-ready prototype, not a regulated financial service. A production financial deployment still requires encrypted financial fields, audit logs, KMS-backed secrets, stronger auth policies, formal compliance review, and institution-grade data retention controls.
