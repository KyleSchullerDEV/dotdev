# Project Roadmap: kyleschuller.dev

A personal blog and portfolio site with a custom CMS layer, designed to demonstrate software engineering practices and serve as a platform for documenting learning.

## Tech Stack

| Layer      | Technology                                  | Rationale                                                           |
| ---------- | ------------------------------------------- | ------------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router)                     | Industry standard, excellent DX, familiar from Vibeset              |
| Language   | TypeScript (strict mode)                    | Type safety, better tooling, professional standard                  |
| Styling    | Tailwind CSS v4                             | CSS-first config, rapid development, consistent design system       |
| Backend    | Convex                                      | Real-time sync, TypeScript-first, learning investment for tarot app |
| Auth       | WorkOS AuthKit                              | Enterprise-grade auth, SSO-ready, clean Convex integration          |
| Testing    | Vitest + React Testing Library + Playwright | Modern, fast, comprehensive coverage                                |
| Deployment | Vercel                                      | Optimal Next.js integration, preview deployments                    |
| Analytics  | PostHog                                     | Event tracking, extensible to session replay later                  |
| Media      | UploadThing (or Convex file storage)        | Simple file uploads, good DX                                        |

---

## Phase 1: Foundation (v0.1)

**Goal**: Repository setup and data layer. No UI beyond a placeholder page. Everything configured correctly from day one.

### Deliverables

- [ ] Repository initialised with Next.js 15, TypeScript strict mode
- [ ] `tsconfig.json` with `strict: true`, `noUncheckedIndexedAccess: true`
- [ ] ESLint flat config (`eslint.config.mjs`) with `next/core-web-vitals`, `next/typescript`, Prettier integration
- [ ] Prettier configured with Tailwind plugin
- [ ] Husky + lint-staged for pre-commit hooks
- [ ] GitHub Actions CI pipeline (lint, typecheck, test, format check)
- [ ] Environment variable validation module (`src/lib/env.ts`) using Zod to fail fast on missing/invalid config
- [ ] Minimal error boundary wrapping the Convex provider to prevent full-page crashes on network failures
- [ ] Convex project initialised and connected
- [ ] Database schema defined (posts, users, post_revisions)
- [ ] Core queries implemented:
  - `posts.getPublished` — public, returns published posts by date (using index range expression on status)
  - `posts.getBySlug` — public, returns single post
  - `posts.getAll` — admin, returns all posts with status
  - `posts.getById` — admin, returns single post for editing
- [ ] Core mutations implemented:
  - `posts.create` — admin, creates new draft
  - `posts.update` — admin, updates post and creates revision
  - `posts.remove` — admin, deletes post
  - `posts.updateStatus` — admin, transitions post between draft/published/archived
  - `users.syncFromWorkOS` — creates/updates user on auth (validates JWT identity server-side)
  - `users.current` — returns authenticated user
- [ ] Auth helper: `requireAdmin()` function for mutation guards
- [ ] Tests for all queries and mutations
- [ ] `.env.example` with required variables documented

### Schema

```typescript
// convex/schema.ts

posts: defineTable({
  title: v.string(),
  slug: v.string(),
  body: v.string(),
  excerpt: v.string(),
  status: v.union(
    v.literal("draft"),
    v.literal("published"),
    v.literal("archived")
  ),
  publishedAt: v.optional(v.number()),
  firstPublishedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  authorId: v.id("users"),
  tags: v.optional(v.array(v.string())),
  coverImage: v.optional(v.string()),
})
  .index("by_slug", ["slug"])
  .index("by_status_date", ["status", "publishedAt"])
  .index("by_author", ["authorId", "createdAt"]),

users: defineTable({
  workosId: v.string(),
  email: v.string(),
  name: v.optional(v.string()),
  role: v.union(v.literal("admin"), v.literal("user")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workos_id", ["workosId"])
  .index("by_email", ["email"]),

post_revisions: defineTable({
  postId: v.id("posts"),
  title: v.string(),
  body: v.string(),
  excerpt: v.string(),
  tags: v.optional(v.array(v.string())),
  coverImage: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
  savedAt: v.number(),
  savedBy: v.id("users"),
})
  .index("by_post", ["postId", "savedAt"]),
```

### Key Design Decisions

- **Status enum over boolean**: Using `status: "draft" | "published" | "archived"` instead of `published: boolean` avoids a painful migration when adding states like "archived" or "scheduled" later. The small upfront complexity pays for itself immediately — every query reads more clearly (`q.eq("status", "published")` vs `q.eq("published", true)`).
- **`firstPublishedAt` field**: Separate from `publishedAt` to preserve original publication date across status transitions. `publishedAt` reflects the most recent publish action; `firstPublishedAt` is set once and never cleared.
- **Server-side identity validation in `syncFromWorkOS`**: The mutation verifies `identity.subject === args.workosId` to prevent spoofing. User data is derived from the JWT identity, not blindly trusted from client args.
- **Admin seeding**: The "first user is admin" pattern is acceptable for a single-author blog but documented as a known simplification. For production multi-user systems, admin would be seeded via a setup script. Note: this is safe from TOCTOU race conditions because Convex mutations are fully serialised and transactional — the `collect()` check and subsequent `insert()` execute atomically.
- **Index range expressions**: `getPublished` uses `.withIndex("by_status_date", q => q.eq("status", "published"))` rather than `.filter()` after `.withIndex()`, ensuring Convex reads only the relevant index range. The subsequent `.order("desc")` reverses the index order, giving posts sorted by `publishedAt` descending (not `_creationTime`).
- **Pagination from day one**: Public and admin listing queries use Convex's `.paginate()` with `paginationOptsValidator` rather than `.collect()`. This avoids loading all posts into memory and prevents a costly UI retrofit later.
- **Full revision snapshots**: `post_revisions` captures all mutable fields (title, body, excerpt, tags, coverImage, status), not just title and body. Partial snapshots would make future revision restore functionality incomplete.
- **Revision snapshots capture pre-edit state**: The `update` mutation snapshots the post's current state _before_ applying changes. This creates an audit trail of "what the post looked like before each edit" rather than "what it was changed to." This is a deliberate choice — it means the current post document always represents the latest state, and the revision history shows the trail of previous states. When building the Phase 8 "restore previous version" UI, restore will apply a revision's fields to the current post. See ADR-006.
- **Slug immutability after publish**: The `update` mutation prevents slug changes once `firstPublishedAt` is set. This protects published URLs from silent breakage. Redirect tables are a Phase 8 concern.
- **Author join in queries**: `getBySlug` returns `authorName` via a server-side join rather than denormalizing onto the post. Correct for a single-author blog; denormalization becomes appropriate if multiple authors are added later.
- **`by_author` index**: Zero-cost to add now, required later for admin "posts by author" views and the Phase 8 multi-admin feature.
- **`UserSync` component pattern**: The official Convex + WorkOS Next.js docs use `ctx.auth.getUserIdentity()` directly in Convex functions without a dedicated users table. This project uses a `UserSync` component that writes to a `users` table on sign-in because the role-based access control system requires a persistent `role` field that isn't present in the WorkOS JWT. This divergence is documented in ADR-007.
- **Environment validation at startup**: A Zod-based `src/lib/env.ts` module validates all required environment variables at import time. Missing or malformed variables produce a clear error message instead of cryptic runtime failures deep in provider code.

### Not in Scope

- Any UI components beyond a placeholder page
- Authentication UI
- MDX rendering
- Styling beyond Tailwind setup

### Success Criteria

- `npm run lint` passes
- `npm run typecheck` passes
- `npm run test` passes with all data layer tests green
- GitHub Action runs successfully on PR
- Can manually create/query posts via Convex dashboard

---

## Phase 2: Authentication (v0.2)

**Goal**: Working auth flow with role-based access control.

### Deliverables

- [ ] WorkOS project configured (AuthKit enabled, CORS, redirect URI)
- [ ] Environment variables set for WorkOS (local and Convex dashboard)
- [ ] Auth callback handler (`/callback`)
- [ ] Sign-in route (`/sign-in`)
- [ ] Sign-out functionality
- [ ] Session management via WorkOS AuthKit middleware
- [ ] User sync to Convex on successful auth (via `UserSync` component)
- [ ] First user automatically granted admin role
- [ ] `useCurrentUser()` hook exposing user and `isAdmin` boolean
- [ ] Middleware protecting `/admin/*` routes
- [ ] Convex auth integration (JWT validation via `auth.config.ts`)
- [ ] Manual testing checklist completed

### Testing Checklist

- [ ] Can sign in via WorkOS
- [ ] User created in Convex with correct role
- [ ] Session persists across page refresh
- [ ] Can sign out, session cleared
- [ ] Unauthenticated user redirected from `/admin`
- [ ] Authenticated non-admin cannot call admin mutations
- [ ] Authenticated admin can call admin mutations

### Not in Scope

- Password reset flows (WorkOS handles this)
- Multiple auth providers
- User management UI

### Success Criteria

- Complete auth flow working end-to-end
- Role-based access control verified manually
- No auth-related console errors

---

## Phase 3: Public Blog (v0.3)

**Goal**: Visitors can read blog posts. Fully styled, accessible, performant. Instrumented from day one.

> **Repository visibility**: Make the repository public at the start of this phase. A clean git history with well-named PRs per phase is more impressive to hiring managers than a polished final result appearing out of nowhere. Progression is the signal.

### Deliverables

- [ ] Layout component with header, footer, navigation
- [ ] Homepage (`/`) with hero section and recent posts
- [ ] Blog listing page (`/blog`) with all published posts
- [ ] Individual post page (`/blog/[slug]`)
- [ ] MDX rendering with `next-mdx-remote`
- [ ] Custom MDX components:
  - `Code` — syntax highlighting with Shiki or Prism
  - `Callout` — info/warning/error callout boxes
  - `Image` — optimised images with captions
- [ ] Code block features:
  - Syntax highlighting
  - Copy button
  - Line numbers
  - Line highlighting (optional lines)
- [ ] SEO implementation:
  - Dynamic meta tags per page
  - Open Graph tags
  - Canonical URLs
  - Sitemap generation
  - robots.txt
- [ ] PostHog integration (basic):
  - Page view tracking
  - PostHog provider configured
  - User identification for admins
  - Custom event for post read (scroll depth or time on page)
- [ ] 404 page
- [ ] Loading states (skeletons)
- [ ] Responsive design (mobile-first)
- [ ] Accessibility audit:
  - Semantic HTML throughout
  - Heading hierarchy
  - Focus states
  - Skip link
  - Colour contrast
  - Reduced motion support
- [ ] Lighthouse score 90+ on all metrics
- [ ] Playwright E2E smoke test for critical path:
  - Visit homepage
  - Navigate to blog listing
  - Click a post
  - Verify post content renders

### Pages

```
/                     Homepage
/blog                 All posts listing
/blog/[slug]          Individual post
/sign-in              Authentication
/404                  Not found
```

### Not in Scope

- Comments
- Admin UI
- Contact page
- Interactive code blocks

### Success Criteria

- Can navigate full public site
- Posts render correctly with all MDX features
- Lighthouse 90+ on Performance, Accessibility, Best Practices, SEO
- Works on mobile, tablet, desktop
- Screen reader navigable
- PostHog receiving page view events
- Playwright E2E smoke test passing in CI

---

## Phase 4: Admin Foundation (v0.4)

**Goal**: Can create, edit, and manage posts through a custom admin interface.

### Deliverables

- [ ] Admin layout (distinct from public layout)
- [ ] Admin dashboard (`/admin`) with:
  - Draft count
  - Published count
  - Recent activity
- [ ] Posts management (`/admin/posts`):
  - Table/list of all posts
  - Status badges (draft/published)
  - Sort by date
  - Quick actions (edit, delete, publish/archive)
- [ ] Create post (`/admin/posts/new`):
  - Title input
  - Slug input (auto-generated from title, editable)
  - Excerpt textarea
  - Body textarea (MDX)
  - Live preview panel
  - Save as draft button
  - Publish button
- [ ] Edit post (`/admin/posts/[id]`):
  - Same fields as create
  - Current status indicator
  - Last saved indicator
  - Unsaved changes warning
- [ ] Delete confirmation modal
- [ ] Revision auto-save (creates revision on every save, no UI yet)
- [ ] Slug uniqueness validation
- [ ] Form validation with error messages
- [ ] Toast notifications for actions
- [ ] Optimistic updates where appropriate

### Admin Routes

```
/admin                Dashboard
/admin/posts          Posts list
/admin/posts/new      Create post
/admin/posts/[id]     Edit post
```

### Not in Scope

- Revision history viewing/restoring UI
- Image upload within editor
- Rich text editor (Lexical) — textarea only
- Tags management UI
- User management

### Success Criteria

- Can create a new post and see it on public site
- Can edit existing post, changes reflected immediately
- Can publish/unpublish/archive posts
- Can delete posts
- Revisions being saved (verify in Convex dashboard)
- All admin routes protected from non-admin users

---

## Phase 5: Polish & Launch (v1.0)

**Goal**: Production-ready. Documented. Deployable. Interview-ready.

### Deliverables

- [ ] Contact page (`/contact`):
  - Contact form (name, email, message)
  - Form submission to Convex or email service
  - Success/error states
  - Spam prevention (honeypot field)
- [ ] Error handling:
  - Global error boundary
  - Graceful MDX parse failure handling
  - Network error states
  - Session expiry handling
- [ ] PostHog enhancements (advanced events, building on Phase 3 foundation):
  - Custom events (contact form submit, admin actions)
  - Conversion funnels (homepage → blog → post read)
  - User properties for segmentation
- [ ] Performance:
  - Image optimisation
  - Font optimisation
  - Bundle analysis
  - Core Web Vitals monitoring
- [ ] Documentation:
  - Comprehensive README
  - Local development setup guide
  - Environment variables documentation
  - Architecture overview
  - At least 5 ADRs (see Decision Log below)
- [ ] Final accessibility audit
- [ ] Final Lighthouse audit
- [ ] Production deployment to Vercel
- [ ] Custom domain configured (kyleschuller.dev)
- [ ] At least 3 real blog posts published, with at least 1 documenting a technical decision or challenge from building this project

### Pages (Complete v1.0)

```
/                     Homepage
/blog                 All posts listing
/blog/[slug]          Individual post
/contact              Contact form
/sign-in              Authentication
/admin                Dashboard
/admin/posts          Posts list
/admin/posts/new      Create post
/admin/posts/[id]     Edit post
```

### Not in Scope

- Comments
- Newsletter
- Portfolio
- Links page
- Sandbox
- Interactive code blocks
- Media library

### Success Criteria

- Site live at kyleschuller.dev
- Full admin workflow functional
- PostHog receiving events (page views from Phase 3 + advanced events)
- README allows someone to run locally in <10 minutes
- Can confidently demo in an interview

---

## Phase 6: Comments (v1.1)

**Goal**: Public engagement through moderated comments.

### Deliverables

- [ ] Comments schema:
  ```typescript
  comments: defineTable({
    postId: v.id("posts"),
    authorName: v.string(),
    authorEmail: v.string(),
    body: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("spam")),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
  })
    .index("by_post_approved", ["postId", "status", "createdAt"])
    .index("by_status", ["status", "createdAt"]),
  ```
- [ ] Public comment form on post pages:
  - Name input
  - Email input (not displayed publicly)
  - Body textarea (plain text)
  - Submit button
  - "Awaiting moderation" message on submit
- [ ] Comment display on posts (approved only)
- [ ] Sanitisation on save and render
- [ ] Admin moderation queue (`/admin/comments`):
  - Pending comments list
  - Approve/reject/spam actions
  - Bulk actions
- [ ] Comment count on post cards
- [ ] Basic rate limiting:
  - IP-based counter stored in Convex (sliding window)
  - Block submissions exceeding threshold (e.g. 5 comments per IP per 10 minutes)
  - User-facing message when rate limited
- [ ] Email notification to admin on new comment (optional)

### Not in Scope

- Comment replies/threading
- Comment editing
- User accounts for commenters
- Markdown formatting in comments

### Success Criteria

- Can submit comment as visitor
- Comment appears after admin approval
- Spam/rejected comments never shown
- XSS attempts safely neutralised
- Rate limiting blocks rapid-fire submissions

---

## Phase 7: Enhanced Features (v1.2)

**Goal**: Richer content experience and portfolio presence.

### Deliverables

- [ ] Interactive code blocks:
  - `<InteractiveDemo>` component accepting parameter definitions
  - Slider, select, toggle controls
  - Code display updates reactively with parameter values
  - Smooth animations on value changes
- [ ] Comment enhancements:
  - Markdown subset support (bold, italic, code, links)
  - Lexical editor for comment input
  - Enhanced rate limiting (fingerprinting, adaptive thresholds)
- [ ] Post engagement metrics:
  - View count (PostHog event → display on post)
  - Like button (stored in Convex, PostHog event)
  - Display counts on post cards
- [ ] Links page (`/links`):
  - Link-in-bio style layout
  - Animated, visually engaging design
  - Social links, key projects
- [ ] Portfolio page (`/portfolio`):
  - Grid of project cards
  - Swiper for multiple screenshots per project
  - Project schema in Convex:
    ```typescript
    projects: defineTable({
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      url: v.string(),
      images: v.array(v.string()),
      technologies: v.array(v.string()),
      featured: v.boolean(),
      order: v.number(),
    }),
    ```
  - Admin UI for managing projects

### Pages Added

```
/links                Link-in-bio page
/portfolio            Project showcase
/admin/projects       Project management (if admin UI included)
```

### Not in Scope

- Portfolio case study pages (just cards linking out)
- Sandbox section
- Media library
- Newsletter

### Success Criteria

- Interactive demos working in at least 2 blog posts
- Portfolio displaying projects attractively
- Links page polished and shareable
- Comment rate limiting upgraded from basic to adaptive

---

## Phase 8: Advanced Features (v1.3+)

**Goal**: Long-term enhancements as time permits.

### Potential Features (Unprioritised)

**Media Library**

- Dedicated image upload interface
- Browse/search uploaded images
- Insert images into posts from library
- Image optimisation pipeline

**Revision History UI**

- View previous versions of a post
- Diff view between versions
- Restore previous version (apply revision snapshot fields to current post — see ADR-006)

**Multiple Admin Users**

- User management page
- Promote/demote users
- Invite system (optional)

**Newsletter Integration**

- Email capture form
- Integration with ConvertKit, Resend, or Buttondown
- Subscription management

**Sandbox Section**

- `/sandbox/[experiment]` with pure TSX pages
- Experiment index page
- Tag/categorise experiments

**Advanced Analytics**

- PostHog session replay
- Feature flags for A/B testing
- Conversion funnels

**Search**

- Full-text search across posts
- Search UI with instant results
- Keyboard navigation

**Tags & Categories**

- Tag management admin UI
- Tag pages (`/blog/tag/[tag]`)
- Tag filtering on blog listing

**Scheduled Publishing**

- Future publish date picker
- Background job to publish at scheduled time

**RSS Feed**

- `/feed.xml` with all posts
- Proper RSS formatting

---

## Development Principles

### Git Workflow

- `main` branch is production
- Feature branches for all work
- Pull requests for all merges (even solo)
- Meaningful commit messages (conventional commits)
- No "fix stuff" or "updates" commits
- Squash merge to keep history clean
- **Each phase gets its own PR(s)** to create a readable git history
- **Repository goes public at Phase 3** — progression through phases is a stronger signal than a polished final result

### Testing Strategy

- **Unit tests**: Convex queries/mutations, utility functions
- **Component tests**: React components with React Testing Library
- **E2E tests**: Critical happy-path flows with Playwright (introduced in Phase 3). Prefer 1-2 focused smoke tests over many edge-case E2E tests — integration issues are the target, not exhaustive coverage.
- **Test on every PR**: CI blocks merge if tests fail

### Code Quality

- TypeScript strict mode, no `any` escapes
- ESLint errors block commits
- Prettier formats on save
- No disabled ESLint rules without comment explaining why

### Accessibility

- Semantic HTML always
- WCAG AA compliance minimum
- Keyboard navigation for all interactive elements
- Screen reader tested (VoiceOver/NVDA)
- Reduced motion respected

### Performance

- Lighthouse 90+ maintained
- Core Web Vitals monitored
- No layout shift on load
- Images optimised and lazy loaded

### Documentation

- README kept up to date
- ADRs for significant decisions
- Code comments for non-obvious logic
- JSDoc for public utilities

---

## Milestones

| Milestone | Target  | Description                                        |
| --------- | ------- | -------------------------------------------------- |
| v0.1      | Week 2  | Foundation complete, data layer tested             |
| v0.2      | Week 4  | Auth working end-to-end                            |
| v0.3      | Week 7  | Public blog live, styled, accessible, instrumented |
| v0.4      | Week 9  | Admin UI functional                                |
| v1.0      | Week 11 | Production launch, interview-ready                 |
| v1.1      | Week 13 | Comments system live                               |
| v1.2      | Week 17 | Interactive blocks, portfolio, links               |

_Estimates assume ~10-15 hours/week. Padded from original estimates to account for auth debugging, accessibility auditing, and inevitable yak-shaving._

---

## Out of Scope (Entire Project)

These are explicitly not planned:

- Mobile app
- Multi-language/i18n
- E-commerce/payments
- User-generated content (beyond comments)
- AI-generated content (for the blog itself)
- CMS for non-technical users
- White-label/multi-tenant

---

## Decision Log

Document significant technical decisions as ADRs in `/docs/adr/`.

Required ADRs for v1.0:

1. **ADR-001**: Why Convex over alternatives
2. **ADR-002**: Why WorkOS for auth
3. **ADR-003**: MDX approach and rendering strategy
4. **ADR-004**: Testing strategy and tool choices
5. **ADR-005**: State management approach (if using Zustand or similar)
6. **ADR-006**: Revision snapshot direction — pre-edit state capture vs post-edit snapshots, and implications for restore functionality
7. **ADR-007**: UserSync component pattern — why a dedicated `users` table diverges from the standard Convex + WorkOS integration and why it's necessary for role-based access control

---

## Review Checkpoints

Before moving to the next phase:

1. All deliverables checked off
2. Tests passing
3. No TypeScript errors
4. Lighthouse scores maintained
5. README updated if needed
6. Quick self-review: "Would I be proud to show this in an interview?"

---

_Last updated: February 2025_
