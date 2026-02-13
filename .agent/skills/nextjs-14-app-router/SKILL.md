---
name: Next.js 14 App Router Best Practices
description: Complete guide to Next.js 14 App Router with server actions, streaming, layouts, and modern routing patterns
---

# Next.js 14 App Router Best Practices

This skill provides comprehensive guidance on Next.js 14's App Router, including server actions, file-based routing, layouts, data fetching, caching strategies, and deployment best practices.

## Table of Contents

1. [App Router Fundamentals](#app-router-fundamentals)
2. [File-Based Routing](#file-based-routing)
3. [Layouts & Templates](#layouts--templates)
4. [Server Actions](#server-actions)
5. [Data Fetching & Caching](#data-fetching--caching)
6. [Streaming & Loading States](#streaming--loading-states)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)

## App Router Fundamentals

### Directory Structure

The App Router uses the `app/` directory with special files:

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx           # Home page
├── loading.tsx        # Loading UI
├── error.tsx          # Error boundary
├── not-found.tsx      # 404 page
├── global.css         # Global styles
│
├── (auth)/            # Route group (doesn't affect URL)
│   ├── login/
│   │   └── page.tsx   # /login
│   └── register/
│       └── page.tsx   # /register
│
├── dashboard/
│   ├── layout.tsx     # Layout for dashboard/*
│   ├── page.tsx       # /dashboard
│   └── settings/
│       └── page.tsx   # /dashboard/settings
│
└── api/               # API routes
    └── users/
        └── route.ts   # /api/users
```

### Server vs Client Components

By default, all components in `app/` are Server Components:

```tsx
// ✅ Server Component (default)
async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ Client Component (opt-in)
("use client");

import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

## File-Based Routing

### Special Files

| File            | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| `layout.tsx`    | Shared UI for segment and children                   |
| `page.tsx`      | Unique UI for route, makes route publicly accessible |
| `loading.tsx`   | Loading UI with automatic Suspense boundary          |
| `error.tsx`     | Error boundary UI                                    |
| `not-found.tsx` | 404 UI                                               |
| `route.ts`      | API endpoint                                         |
| `template.tsx`  | Re-rendered layout (new instance on navigation)      |
| `default.tsx`   | Fallback for parallel routes                         |

### Dynamic Routes

```
app/
├── blog/
│   └── [slug]/
│       └── page.tsx        # /blog/hello-world
│
├── shop/
│   └── [...category]/
│       └── page.tsx        # /shop/a, /shop/a/b, /shop/a/b/c
│
└── docs/
    └── [[...slug]]/
        └── page.tsx        # /docs, /docs/a, /docs/a/b (optional catch-all)
```

```tsx
// app/blog/[slug]/page.tsx
interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BlogPost({ params, searchParams }: PageProps) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}

// Generate static paths at build time
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### Route Groups

Organize routes without affecting URL structure:

```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx        # /about
│   └── contact/
│       └── page.tsx        # /contact
│
└── (shop)/
    ├── products/
    │   └── page.tsx        # /products
    └── cart/
        └── page.tsx        # /cart
```

### Private Folders

Prefix with `_` to exclude from routing:

```
app/
├── _components/            # Not routable
│   ├── Header.tsx
│   └── Footer.tsx
├── _lib/                  # Not routable
│   └── utils.ts
└── page.tsx               # /
```

### Parallel Routes

Render multiple pages in the same layout simultaneously:

```
app/
├── @analytics/
│   └── page.tsx
├── @team/
│   └── page.tsx
├── layout.tsx
└── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <>
      {children}
      {analytics}
      {team}
    </>
  );
}
```

## Layouts & Templates

### Root Layout (Required)

```tsx
// app/layout.tsx
export const metadata = {
  title: "My App",
  description: "App description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### Nested Layouts

Layouts persist across navigation and don't re-render:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">{children}</div>
    </div>
  );
}
```

### Layout Best Practices

**✅ DO:**

- Share UI across multiple routes
- Keep layouts data-fetching minimal
- Use layouts for persistent navigation
- Nest layouts for composition

**❌ DON'T:**

- Fetch data in every layout (waterfall risk)
- Pass state between parent and child layouts
- Use layouts for UI that should re-render

### Templates vs Layouts

Templates re-render on navigation (new instance):

```tsx
// app/template.tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-in">{children}</div>;
}
```

## Server Actions

### Defining Server Actions

Server Actions are async functions that run on the server:

```tsx
// app/todo/page.tsx
export default function TodoPage() {
  async function createTodo(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    await db.todo.create({ data: { title } });
    revalidatePath("/todo");
  }

  return (
    <form action={createTodo}>
      <input name="title" required />
      <button type="submit">Add Todo</button>
    </form>
  );
}
```

### Server Actions in Separate Files

```tsx
// app/actions/todo.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTodo(formData: FormData) {
  const title = formData.get("title") as string;

  const todo = await db.todo.create({
    data: { title },
  });

  revalidatePath("/todo");
  return { success: true, todo };
}

export async function deleteTodo(id: string) {
  await db.todo.delete({ where: { id } });
  revalidatePath("/todo");
}
```

```tsx
// app/todo/page.tsx
import { createTodo, deleteTodo } from "../actions/todo";

export default function TodoPage() {
  return (
    <form action={createTodo}>
      <input name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

### Using Server Actions in Client Components

```tsx
"use client";

import { createTodo } from "../actions/todo";
import { useFormStatus, useFormState } from "react-dom";

export function TodoForm() {
  const [state, formAction] = useFormState(createTodo, null);

  return (
    <form action={formAction}>
      <input name="title" required />
      <SubmitButton />
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add Todo"}
    </button>
  );
}
```

### Server Action Best Practices

**✅ DO:**

- Validate inputs thoroughly (use Zod, Yup, etc.)
- Return typed payloads
- Use `revalidatePath` or `revalidateTag` after mutations
- Handle errors gracefully

```tsx
"use server";

import { z } from "zod";

const todoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
});

export async function createTodo(formData: FormData) {
  // Validate input
  const validatedFields = todoSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description } = validatedFields.data;

  try {
    const todo = await db.todo.create({
      data: { title, description },
    });

    revalidatePath("/todo");
    return { success: true, todo };
  } catch (error) {
    return { error: "Failed to create todo" };
  }
}
```

## Data Fetching & Caching

### Fetch API with Caching

Next.js extends the native `fetch` API with caching:

```tsx
// ✅ Cache by default (force-cache)
async function getCachedData() {
  const res = await fetch("https://api.example.com/data");
  return res.json();
}

// 🔄 Revalidate every 60 seconds
async function getRevalidatedData() {
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 },
  });
  return res.json();
}

// 🚫 Never cache (no-store)
async function getFreshData() {
  const res = await fetch("https://api.example.com/data", {
    cache: "no-store",
  });
  return res.json();
}
```

### Cache Strategies

| Strategy                | Behavior                              | Use Case                      |
| ----------------------- | ------------------------------------- | ----------------------------- |
| `force-cache` (default) | Cache indefinitely                    | Static data                   |
| `{ revalidate: 60 }`    | Cache for 60 seconds, then revalidate | Frequently updated data       |
| `no-store`              | Never cache, always fetch fresh       | Real-time data, user-specific |
| `{ tags: ['posts'] }`   | Cache with revalidation by tag        | Granular cache control        |

### Request Memoization

Automatic deduplication within the same render:

```tsx
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

async function Page() {
  // These three calls are automatically deduplicated
  const user1 = await getUser("123");
  const user2 = await getUser("123");
  const user3 = await getUser("123");

  // Only one network request is made!
  return <div>{user1.name}</div>;
}
```

### Revalidation

#### On-Demand Revalidation

```tsx
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function updatePost(id: string, data: any) {
  await db.post.update({ where: { id }, data });

  // Revalidate specific path
  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);

  // Or revalidate by tag
  revalidateTag("posts");
}
```

#### Time-Based Revalidation

```tsx
// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Page() {
  const data = await getData();
  return <div>{data}</div>;
}
```

### Parallel Data Fetching

```tsx
async function Page() {
  // Fetch in parallel
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
      <CommentList comments={comments} />
    </div>
  );
}
```

## Streaming & Loading States

### Loading UI with `loading.tsx`

Automatically wraps page in Suspense:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}

// Equivalent to:
// <Suspense fallback={<Loading />}>
//   <Page />
// </Suspense>
```

### Granular Streaming with Suspense

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      {/* Content above loads immediately */}
      <Header />

      {/* Independent streaming sections */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>

      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>
    </div>
  );
}

async function Posts() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}

async function Comments() {
  const comments = await getComments();
  return <CommentList comments={comments} />;
}
```

### Instant Loading States

Use `useFormStatus` for pending states:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </button>
  );
}
```

## Error Handling

### Error Boundaries with `error.tsx`

```tsx
// app/dashboard/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Global Error Handling

```tsx
// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
```

### Not Found Pages

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return <Article post={post} />;
}

// app/blog/[slug]/not-found.tsx
export default function NotFound() {
  return <h2>Post not found</h2>;
}
```

## Performance Optimization

### Partial Prerendering (Experimental)

Combine static and dynamic content:

```tsx
// next.config.js
module.exports = {
  experimental: {
    ppr: true,
  },
};

// Static shell renders immediately, dynamic parts stream in
export default function Page() {
  return (
    <div>
      <StaticHeader />

      <Suspense fallback={<Skeleton />}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

### Image Optimization

```tsx
import Image from "next/image";

export default function Page() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={800}
      height={600}
      priority // LCP image
      placeholder="blur"
      blurDataURL="data:image/..." // or import from file
    />
  );
}
```

### Font Optimization

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Route Segment Config

```tsx
// app/dashboard/page.tsx

// Force dynamic rendering
export const dynamic = "force-dynamic";

// OR force static rendering
export const dynamic = "force-static";

// Set revalidation time
export const revalidate = 3600; // 1 hour

// Set runtime environment
export const runtime = "edge"; // or 'nodejs'
```

### Static Exports

```tsx
// next.config.js
module.exports = {
  output: "export",
};

// Cannot use:
// - Server Components with dynamic functions
// - Server Actions
// - Middleware
// - Image Optimization
```

## Project Structure Best Practices

### Recommended Organization

```
app/
├── (auth)/
│   ├── login/
│   └── register/
│
├── (dashboard)/
│   ├── _components/        # Private components
│   │   ├── Sidebar.tsx
│   │   └── Widget.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── settings/
│       └── page.tsx
│
├── _components/            # Global shared components
│   ├── Header.tsx
│   └── Footer.tsx
│
├── _lib/                  # Utilities
│   ├── db.ts
│   └── utils.ts
│
├── actions/               # Server actions
│   ├── auth.ts
│   └── posts.ts
│
├── api/                   # API routes
│   └── webhooks/
│       └── route.ts
│
└── layout.tsx
```

### Colocation Strategy

Keep related files together:

```
app/
└── blog/
    ├── [slug]/
    │   ├── page.tsx
    │   ├── loading.tsx
    │   ├── error.tsx
    │   ├── not-found.tsx
    │   └── _components/
    │       ├── ArticleHeader.tsx
    │       ├── RelatedPosts.tsx
    │       └── ShareButtons.tsx
    └── page.tsx
```

## Deployment & Environment

### Environment Variables

```tsx
// .env.local
DATABASE_URL = "postgresql://...";
NEXT_PUBLIC_API_URL = "https://api.example.com";

// Access in Server Components
const dbUrl = process.env.DATABASE_URL;

// Access in Client Components (must be prefixed with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Metadata API

```tsx
// Static metadata
export const metadata = {
  title: "My App",
  description: "Description",
  openGraph: {
    title: "My App",
    description: "Description",
    images: ["/og-image.jpg"],
  },
};

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.image],
    },
  };
}
```

## Quick Reference

### Routing Checklist

- [ ] Use `app/` directory for App Router
- [ ] `page.tsx` makes routes public
- [ ] `layout.tsx` for shared UI
- [ ] Route groups `(name)` for organization
- [ ] Private folders `_name` for utilities
- [ ] Dynamic routes `[param]`

### Performance Checklist

- [ ] Default to Server Components
- [ ] Use Suspense for streaming
- [ ] Optimize images with `next/image`
- [ ] Use `next/font` for fonts
- [ ] Implement proper caching strategy
- [ ] Use route segment config appropriately

### Data Fetching Checklist

- [ ] Use `fetch` with caching options
- [ ] Implement parallel fetching
- [ ] Use Server Actions for mutations
- [ ] Revalidate after mutations
- [ ] Handle errors with error boundaries

### Best Practices

- [ ] Keep Server Components async
- [ ] Draw thin client boundaries
- [ ] Colocate related files
- [ ] Use TypeScript for type safety
- [ ] Implement proper SEO with metadata
- [ ] Test with `npm run build`

## Common Patterns

### Middleware for Auth

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### API Routes

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

## Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
