# LandFall v1 Implementation Plan

## Overview

Build a CLI tool that spawns a local web app for creating structured landing page specifications, generating AI-ready prompts.

---

## Phase 1: Project Setup & CLI Foundation

### 1.1 Initialize the monorepo structure
- Create package.json with CLI entry point
- Set up TypeScript configuration
- Configure ESLint and Prettier
- Set up the directory structure:
  ```
  landfall/
  ├── bin/
  │   └── cli.ts
  ├── src/
  │   ├── cli/
  │   │   ├── init.ts
  │   │   ├── dev.ts
  │   │   └── build.ts
  │   ├── app/           # Next.js web app
  │   ├── templates/     # JSON templates for init
  │   └── lib/           # Shared utilities
  ├── package.json
  └── tsconfig.json
  ```

### 1.2 Implement CLI commands with Commander.js
- `landfall init` - Create landfall/ directory with default JSON files
- `landfall dev [--port]` - Start the Next.js web app
- `landfall build` - Generate prompts without UI

### 1.3 Create JSON templates
- config.json template
- style.json template (with defaults from Appendix A)
- tone.json template (with defaults from Appendix A)
- sitemap.json template (single Home page)
- navigation.json template (minimal navbar/footer)
- pages/home.json template (empty sections)

---

## Phase 2: Next.js Web App Foundation

### 2.1 Set up embedded Next.js app
- Initialize Next.js 14+ with App Router inside src/app/
- Configure Tailwind CSS
- Set up the app to read/write from the user's landfall/ directory

### 2.2 Create the layout and navigation
- Sidebar with 7 steps: Style, Tone, Sitemap, Navigation, Pages & Sections, Preview, Build
- Progress indicator showing completion status
- Step navigation (linear but editable)

### 2.3 Implement API routes for file operations
- `GET /api/config/[filename]` - Read any config file
- `PUT /api/config/[filename]` - Update any config file
- `POST /api/assets/upload` - Handle image uploads
- `DELETE /api/assets/[...path]` - Delete uploaded asset
- `POST /api/build` - Generate prompts

### 2.4 Set up state management
- Use SWR or React Query for server state
- Auto-save on changes (debounced)
- File watching for external changes

---

## Phase 3: Step Pages Implementation

### 3.1 Style Page (Step 1)
- Color picker grid for all color slots (12 colors)
- Typography selectors (font family dropdowns)
- Style keyword tags (selectable chips)
- Border radius visual selector (4 options)
- Shadow intensity selector (4 options)
- Inspiration upload zone (drag & drop images)
- URL input for website inspirations

### 3.2 Tone Page (Step 2)
- Tone keyword selector (chips)
- Brand personality input (tags)
- Target audience textarea
- Do's and Don'ts lists (editable lists)
- Example phrases textarea

### 3.3 Sitemap Page (Step 3)
- Page list with add/remove/reorder (drag-and-drop)
- Page detail editor (name, slug, meta title, meta description)
- Homepage toggle
- Visual sitemap tree preview

### 3.4 Navigation Page (Step 4)
- Navbar configurator:
  - Logo upload or text toggle
  - Navigation links list editor
  - CTA button configurator (label, target, style)
- Footer configurator:
  - Column manager (1-4 columns)
  - Per-column heading and links
  - Social links editor
  - Copyright text
  - Newsletter toggle and settings

### 3.5 Pages & Sections Page (Step 5)
- Page selector tabs (from sitemap)
- Section list for selected page
- Drag-and-drop section reordering
- Add section from library modal
- Section editor panel:
  - Section type selector (dropdown)
  - Layout variant picker (visual thumbnails)
  - Copy instructions textarea
  - Visual instructions textarea
  - Inspiration upload zone

### 3.6 Preview Page (Step 6)
- Wireframe preview of all pages
- Page tabs at top
- Sections rendered as wireframe blocks
- Annotations overlay (copy/visual instructions)
- Responsive preview toggles (desktop/tablet/mobile)

### 3.7 Build Page (Step 7)
- Summary of all inputs
- Validation warnings if incomplete
- "Generate Prompts" button
- Generated prompt list with individual copy buttons
- Export options (copy all, download as markdown)

---

## Phase 4: Section Types & Wireframes

### 4.1 Implement section type library
Create components for each section type with their variants:
- Hero (5 variants)
- Logos (5 variants)
- Features (5 variants)
- How It Works (5 variants)
- Testimonials (5 variants)
- Pricing (5 variants)
- FAQ (5 variants)
- CTA (5 variants)
- Team (5 variants)
- Stats (5 variants)
- Contact (5 variants)
- Content/Blog (5 variants)

### 4.2 Create wireframe component library
- Heading, Subheading, Body Text
- Buttons (Primary, Secondary)
- Image/Video/Icon Placeholders
- Forms (Email, Full Contact)
- List Items, Cards, Avatars
- Logo Placeholder, Badge/Tag, Divider

### 4.3 Build wireframe renderer
- Render sections based on type and variant
- Show placeholder content
- Display annotations from instructions

---

## Phase 5: Prompt Generation

### 5.1 Implement prompt generator
- Read all JSON configuration files
- Generate ordered sequence of prompts
- Follow the build sequence logic:
  1. Style System prompt
  2. Sitemap & Layout prompt
  3. Section prompts (one per section, ordered by page then section order)

### 5.2 Create prompt templates
- Style System template
- Sitemap & Layout template
- Section template (parameterized by type, variant, instructions)

### 5.3 Save and export prompts
- Save to landfall/prompts/build-sequence.json
- Support copy-to-clipboard for each prompt
- Support export as markdown file

---

## Phase 6: Polish & Testing

### 6.1 Error handling and validation
- Validate JSON schemas
- Handle file read/write errors
- Show helpful error messages

### 6.2 UX improvements
- Loading states
- Toast notifications for saves
- Keyboard shortcuts
- Responsive design for the web app itself

### 6.3 Testing
- Test CLI commands
- Test file operations
- Test prompt generation
- Manual end-to-end testing

---

## Technology Stack

- **CLI**: Node.js, Commander.js, TypeScript
- **Web App**: Next.js 14+ (App Router), React, Tailwind CSS
- **State**: SWR or TanStack Query
- **File Operations**: Node.js fs module via API routes
- **Drag & Drop**: @dnd-kit/core or react-beautiful-dnd
- **Color Picker**: react-colorful
- **Icons**: Lucide React

---

## Estimated Prompt Count per Component

| Component | Prompts |
|-----------|---------|
| Phase 1: CLI & Setup | 3-4 |
| Phase 2: Web App Foundation | 4-5 |
| Phase 3: Step Pages | 7 (one per page) |
| Phase 4: Sections & Wireframes | 3-4 |
| Phase 5: Prompt Generation | 2-3 |
| Phase 6: Polish | 2-3 |
| **Total** | ~20-25 |

---

## File Structure After Implementation

```
landfall/
├── bin/
│   └── cli.ts
├── src/
│   ├── cli/
│   │   ├── init.ts
│   │   ├── dev.ts
│   │   └── build.ts
│   ├── app/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── api/
│   │   │   │   ├── config/[filename]/route.ts
│   │   │   │   ├── assets/upload/route.ts
│   │   │   │   └── build/route.ts
│   │   │   ├── style/page.tsx
│   │   │   ├── tone/page.tsx
│   │   │   ├── sitemap/page.tsx
│   │   │   ├── navigation/page.tsx
│   │   │   ├── pages/page.tsx
│   │   │   ├── preview/page.tsx
│   │   │   └── build/page.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── StepIndicator.tsx
│   │   │   ├── ui/
│   │   │   │   ├── ColorPicker.tsx
│   │   │   │   ├── TagInput.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   └── ...
│   │   │   ├── sections/
│   │   │   │   ├── HeroWireframe.tsx
│   │   │   │   ├── FeaturesWireframe.tsx
│   │   │   │   └── ...
│   │   │   └── wireframe/
│   │   │       ├── Heading.tsx
│   │   │       ├── Button.tsx
│   │   │       └── ...
│   │   └── lib/
│   │       ├── api.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   ├── templates/
│   │   ├── config.json
│   │   ├── style.json
│   │   ├── tone.json
│   │   ├── sitemap.json
│   │   ├── navigation.json
│   │   └── pages/
│   │       └── home.json
│   └── lib/
│       ├── file-operations.ts
│       └── prompt-generator.ts
├── package.json
├── tsconfig.json
└── README.md
```
