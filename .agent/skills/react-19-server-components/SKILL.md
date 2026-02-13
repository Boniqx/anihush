---
name: React 19 Server Components Best Practices
description: Modern patterns for React 19 Server Components with streaming, Suspense, and optimal client-server boundaries
---

# React 19 Server Components Best Practices

This skill provides comprehensive guidance on using React 19 Server Components (RSC), streaming, Suspense, and establishing proper client-server boundaries for optimal performance.

## Table of Contents

1. [Server Components Fundamentals](#server-components-fundamentals)
2. [Streaming & Suspense](#streaming--suspense)
3. [Data Fetching Patterns](#data-fetching-patterns)
4. [Client vs Server Components](#client-vs-server-components)
5. [Performance Optimization](#performance-optimization)
6. [Common Patterns](#common-patterns)

## Server Components Fundamentals

### What Are Server Components?

Server Components execute **only** on the server or during build time. They never send JavaScript to the client, resulting in:

- Smaller client-side bundles
- Faster initial page loads
- Direct access to server-side APIs and databases
- Better security (sensitive logic stays on server)

### Default Behavior in React 19

```jsx
// ✅ Server Component (default in React 19)
// No "use server" directive needed
async function UserProfile({ id }) {
  // Direct database access
  const user = await db.user.findUnique({ where: { id } });

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Key Characteristics

- Can use `async/await` directly in component body
- Cannot use hooks (`useState`, `useEffect`, etc.)
- Cannot handle browser events
- Cannot access browser APIs
- Props must be serializable

## Streaming & Suspense

### Why Streaming Matters

Streaming allows parts of your UI to be sent to the client progressively as they become ready, rather than waiting for the entire page to render.

### Suspense as Progress Boundaries

Think of `<Suspense>` as "progress boundaries" not just loading spinners:

```jsx
export default function Page() {
  return (
    <>
      {/* Critical above-the-fold content loads first */}
      <Header />

      {/* Wrap independent data islands in Suspense */}
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader userId="123" />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId="123" />
      </Suspense>

      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
    </>
  );
}
```

### Nested Suspense for Granular Control

```jsx
function ProductPage({ id }) {
  return (
    <div>
      {/* Main content loads immediately */}
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails id={id} />

        {/* Reviews can load independently */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviews id={id} />
        </Suspense>

        {/* Recommendations load separately */}
        <Suspense fallback={<RecommendationsSkeleton />}>
          <RecommendedProducts id={id} />
        </Suspense>
      </Suspense>
    </div>
  );
}
```

### Fallback Best Practices

**✅ DO:**

- Match fallback size to final content (prevent layout shift)
- Use skeleton screens that mirror the structure
- Keep fallbacks honest (don't show huge skeleton for tiny content)

**❌ DON'T:**

- Use generic spinners for large content areas
- Create jarring layout shifts
- Over-promise with elaborate skeletons

```jsx
// ✅ GOOD: Skeleton matches final layout
function PostCardSkeleton() {
  return (
    <div className="post-card">
      <div className="skeleton-title" />
      <div className="skeleton-text" />
      <div className="skeleton-text short" />
    </div>
  );
}

// ❌ BAD: Generic spinner
function BadFallback() {
  return <div className="spinner" />;
}
```

## Data Fetching Patterns

### The `use` Hook

React 19 introduces the `use` hook for unwrapping promises:

```jsx
// Server Component
async function UserProfile({ userPromise }) {
  const user = use(userPromise);

  return <div>{user.name}</div>;
}

// Parent component
async function Page() {
  // Start fetching early
  const userPromise = fetchUser("123");

  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

### Component-Level Data Fetching

Make components responsible for their own data:

```jsx
// ✅ GOOD: Component fetches its own data
async function UserPosts({ userId }) {
  const posts = await db.post.findMany({
    where: { userId },
  });

  return <PostList posts={posts} />;
}

// ❌ BAD: Props drilling fetched data
function UserPosts({ posts }) {
  return <PostList posts={posts} />;
}
```

### Parallel Data Fetching

Fetch independent data in parallel:

```jsx
async function DashboardPage() {
  // Start all fetches in parallel
  const [user, posts, stats] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchStats(),
  ]);

  return (
    <div>
      <UserInfo user={user} />
      <PostList posts={posts} />
      <StatsDashboard stats={stats} />
    </div>
  );
}
```

### Request Deduplication with Cache

Use React's caching to deduplicate requests:

```jsx
import { cache } from "react";

// Automatically deduplicated within same render
const getUser = cache(async (id) => {
  return await db.user.findUnique({ where: { id } });
});

async function UserProfile({ id }) {
  const user = await getUser(id); // First call
  return <ProfileCard user={user} />;
}

async function UserPosts({ id }) {
  const user = await getUser(id); // Deduplicated!
  return <PostsList authorName={user.name} />;
}
```

## Client vs Server Components

### When to Use Server Components (Default)

**✅ Use Server Components for:**

- Data fetching
- Backend resource access (database, file system, APIs)
- Sensitive information (API keys, tokens)
- Large dependencies that stay on server
- Static content

```jsx
// Server Component
async function ProductList() {
  const products = await db.product.findMany();

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### When to Use Client Components

**✅ Use Client Components for:**

- Interactivity (event handlers)
- State management (`useState`, `useReducer`)
- Effects (`useEffect`)
- Browser APIs (localStorage, geolocation)
- Custom hooks
- React Context providers/consumers

```jsx
"use client";

import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>;
}
```

### Drawing Thin Client Boundaries

**Minimize client-side JavaScript by keeping client boundaries small:**

```jsx
// ❌ BAD: Entire component tree is client-side
"use client";

function ProductPage({ product }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <ProductHeader product={product} />
      <ProductDetails product={product} />
      <ProductReviews product={product} />
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Details</button>
    </div>
  );
}

// ✅ GOOD: Only interactive part is client-side
function ProductPage({ product }) {
  // Server Component
  return (
    <div>
      <ProductHeader product={product} />
      <ProductDetails product={product} />
      <ProductReviews product={product} />
      <ToggleButton /> {/* Only this is client */}
    </div>
  );
}

("use client");
function ToggleButton() {
  const [isOpen, setIsOpen] = useState(false);
  return <button onClick={() => setIsOpen(!isOpen)}>Toggle Details</button>;
}
```

### Composing Server and Client Components

You can pass Server Components as children to Client Components:

```jsx
// Client Component
"use client";

function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <TabButtons onTabChange={setActiveTab} />
      {children[activeTab]}
    </div>
  );
}

// Server Component
async function Page() {
  const posts = await fetchPosts();
  const stats = await fetchStats();

  return (
    <Tabs>
      <PostsList posts={posts} /> {/* Server Component */}
      <StatsView stats={stats} /> {/* Server Component */}
    </Tabs>
  );
}
```

## Performance Optimization

### Selective Hydration

Only hydrate interactive components:

```jsx
// ✅ Most content renders as static HTML
function Page() {
  return (
    <div>
      {/* Static server-rendered content */}
      <Header />
      <ArticleContent />
      {/* Only this hydrates on client */}
      <CommentSection /> {/* Client Component */}
    </div>
  );
}
```

### Progressive Enhancement

Design components to work before JavaScript loads:

```jsx
// Server Component renders working form
function ContactForm() {
  async function handleSubmit(formData) {
    "use server";

    const name = formData.get("name");
    const email = formData.get("email");

    await saveContact({ name, email });
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Lazy Loading Client Components

Defer loading of non-critical client components:

```jsx
import { lazy, Suspense } from "react";

const HeavyChart = lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <div>
      <MainContent />

      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

### Avoiding Waterfall Requests

**❌ BAD: Sequential waterfalls**

```jsx
async function BadExample() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id); // Waits for user
  const comments = await fetchComments(posts[0].id); // Waits for posts

  return <Dashboard user={user} posts={posts} comments={comments} />;
}
```

**✅ GOOD: Parallel fetching with streaming**

```jsx
async function GoodExample() {
  // Fetch user immediately
  const user = await fetchUser();

  return (
    <div>
      <UserHeader user={user} />

      {/* Posts and comments fetch in parallel */}
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={user.id} />
      </Suspense>

      <Suspense fallback={<CommentsSkeleton />}>
        <RecentComments userId={user.id} />
      </Suspense>
    </div>
  );
}
```

## Common Patterns

### Data Islands Pattern

Each independent section fetches and streams its own data:

```jsx
function HomePage() {
  return (
    <main>
      {/* Each island is independent */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<ProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>
    </main>
  );
}

// Each component manages its own data
async function FeaturedProducts() {
  const products = await fetchFeaturedProducts();
  return <ProductGrid products={products} />;
}
```

### Server Actions for Mutations

Use Server Actions for form submissions and mutations:

```jsx
async function TodoList() {
  const todos = await getTodos();

  async function addTodo(formData) {
    "use server";

    const text = formData.get("text");
    await db.todo.create({ data: { text } });
    revalidatePath("/todos");
  }

  return (
    <div>
      <form action={addTodo}>
        <input name="text" />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Error Boundaries with Suspense

Combine error boundaries with Suspense for robust error handling:

```jsx
import { ErrorBoundary } from "react-error-boundary";

function Page() {
  return (
    <ErrorBoundary fallback={<ErrorMessage />}>
      <Suspense fallback={<LoadingSkeleton />}>
        <DataFetchingComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Context with Server Components

Provide context from Server Components:

```jsx
// Server Component
async function Layout({ children }) {
  const theme = await getUserTheme();

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

// Client Component (provider)
("use client");

import { createContext, useContext } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ theme, children }) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

## Quick Reference

### Server Component Checklist

- [ ] Use for data fetching by default
- [ ] Access backend resources directly
- [ ] Keep sensitive logic on server
- [ ] Make components fetch their own data
- [ ] Use parallel fetching with Promise.all
- [ ] Wrap in Suspense for streaming

### Client Component Checklist

- [ ] Only use when interactivity needed
- [ ] Draw smallest possible boundaries
- [ ] Use `'use client'` at top of file
- [ ] Can import Server Components as children
- [ ] Lazy load when possible

### Suspense Best Practices

- [ ] Nest boundaries for granular control
- [ ] Match fallback size to content
- [ ] Prioritize above-the-fold content
- [ ] Create data islands for independent sections
- [ ] Avoid layout shifts

### Performance Guidelines

- [ ] Default to Server Components
- [ ] Minimize client-side JavaScript
- [ ] Use selective hydration
- [ ] Cache and deduplicate requests
- [ ] Stream independent data islands
- [ ] Optimize for Time to Interactive (TTI)

## Anti-Patterns to Avoid

**❌ Fetching data in Client Components:**

```jsx
"use client";

function BadExample() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <Loading />;
  return <div>{data.content}</div>;
}
```

**✅ Fetch in Server Component instead:**

```jsx
async function GoodExample() {
  const data = await fetchData();
  return <div>{data.content}</div>;
}
```

**❌ Marking entire tree as client:**

```jsx
"use client"; // At top of large component tree

function LargeApp() {
  // Everything below is now client-side
}
```

**✅ Isolate interactivity:**

```jsx
// Most of tree is server components
function App() {
  return (
    <div>
      <StaticHeader />
      <StaticContent />
      <InteractiveWidget /> {/* Only this is 'use client' */}
    </div>
  );
}
```

## Resources

- [React 19 Documentation](https://react.dev/)
- [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Patterns for streaming and Suspense](https://react.dev/reference/react/Suspense)
