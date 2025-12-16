# LandFall Specification

> A CLI tool that spawns a local web app for creating structured landing page specifications, generating AI-ready prompts for any coding tool.

---

## 1. Vision & Problem Statement

### The Problem
When developers ask AI coding tools to "build me a landing page," they get inconsistent, generic results. The AI lacks context about style preferences, content structure, visual inspiration, and the overall vision. This leads to multiple back-and-forth iterations and subpar outcomes.

### The Solution
LandFall provides a structured specification process that captures all the context an AI needs before writing a single line of code. Instead of one-shot prompts, users go through a guided flow to define:
- Visual style and inspirations
- Tone of voice
- Site structure and navigation
- Page layouts with wireframe precision
- Section-by-section instructions with visual references

The output is a sequence of focused prompts that reference the complete specification, enabling any AI coding tool to generate high-quality, consistent landing pages.

### Target Users
- Developers using AI coding tools (Cursor, Claude Code, Windsurf, etc.)
- Technical PMs who spec out projects for AI-assisted development

### Target Output
- Next.js landing pages with Tailwind CSS

---

## 2. Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Project                        │
├─────────────────────────────────────────────────────────────┤
│  /your-project                                               │
│  ├── landfall/                  ← Created by `landfall init` │
│  │   ├── config.json            ← Global config              │
│  │   ├── style.json             ← Style definitions          │
│  │   ├── tone.json              ← Tone of voice              │
│  │   ├── sitemap.json           ← Pages and structure        │
│  │   ├── navigation.json        ← Navbar and footer          │
│  │   ├── pages/                                              │
│  │   │   ├── home.json                                       │
│  │   │   ├── pricing.json                                    │
│  │   │   └── about.json                                      │
│  │   ├── assets/                                             │
│  │   │   ├── style-inspirations/                             │
│  │   │   └── section-inspirations/                           │
│  │   └── prompts/               ← Generated prompts          │
│  │       └── build-sequence.json                             │
│  └── src/                       ← Your Next.js app           │
└─────────────────────────────────────────────────────────────┘
```

### CLI Commands

```bash
# Initialize LandFall in current directory
npx landfall init

# Start the web app (default: http://localhost:3333)
npx landfall dev

# Start on custom port
npx landfall dev --port 4000

# Generate prompts without opening web UI
npx landfall build
```

### Technology Stack

**CLI & Web App:**
- Node.js CLI with Commander.js
- Next.js web application (embedded in CLI package)
- React + Tailwind CSS for UI
- JSON file storage (no database)

**Generated Output:**
- Next.js 14+ with App Router
- Tailwind CSS
- TypeScript

---

## 3. User Flow

The web app guides users through a linear (but editable) flow:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  1. STYLE          2. TONE         3. SITEMAP       4. NAV       │
│  ━━━━━━━━━━        ────────        ────────         ────────     │
│                                                                  │
│  5. PAGES & SECTIONS              6. WIREFRAME PREVIEW           │
│  ────────────────────             ────────────────────           │
│                                                                  │
│  7. BUILD IT                                                     │
│  ────────────                                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Step 1: Style Definition
Users define the visual identity:
- **Color palette**: Primary, secondary, accent, neutrals, background, text colors
- **Typography**: Font families (headings, body), size scale preferences
- **Style keywords**: Modern, minimal, bold, playful, corporate, etc.
- **Border radius**: Sharp, slightly rounded, rounded, pill
- **Shadows**: None, subtle, medium, dramatic
- **Inspirations**: Upload images or provide URLs of websites they like

### Step 2: Tone of Voice
Users define how copy should sound:
- **Tone keywords**: Professional, casual, friendly, authoritative, playful, technical
- **Brand personality**: 3-5 adjectives describing the brand
- **Audience**: Who they're speaking to
- **Do's and Don'ts**: Specific guidance (e.g., "Use contractions", "Avoid jargon")
- **Example phrases**: Sample copy that captures the desired voice

### Step 3: Sitemap
Users define the pages:
- Add/remove/reorder pages
- For each page: name, slug, meta title, meta description
- Mark which page is the homepage

### Step 4: Navigation
Users define global navigation:

**Navbar:**
- Logo (upload or text)
- Navigation links (label, target page or external URL)
- CTA button(s) (label, target, style: primary/secondary)

**Footer:**
- Column structure (1-4 columns)
- Per column: heading, list of links
- Social links
- Copyright text
- Additional elements (newsletter signup, etc.)

### Step 5: Pages & Sections
For each page, users build a list of sections:
- Add sections from a library of section types
- Reorder sections via drag-and-drop
- For each section:
  - Select section type
  - Select layout variant
  - Add copy instructions (what the text should communicate)
  - Add visual instructions (what images/graphics should show)
  - Upload visual inspirations (reference images)

### Step 6: Wireframe Preview
A visual preview of the entire site:
- Shows all pages with their sections
- Each section displayed as a wireframe based on selected layout
- Placeholder text and image boxes
- Annotations visible (copy and visual instructions)
- Not interactive, just a visual representation

### Step 7: Build It
Generates the prompt sequence:
- Reviews all inputs
- Generates ordered list of prompts
- Each prompt references the relevant JSON files
- User can copy prompts one by one into their AI tool

---

## 4. Data Model

### 4.1 config.json
```json
{
  "version": "1.0.0",
  "projectName": "My Landing Page",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z",
  "targetFramework": "nextjs",
  "currentStep": 3
}
```

### 4.2 style.json
```json
{
  "colors": {
    "primary": "#2563eb",
    "primaryLight": "#3b82f6",
    "primaryDark": "#1d4ed8",
    "secondary": "#7c3aed",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "backgroundAlt": "#f8fafc",
    "text": "#1e293b",
    "textMuted": "#64748b",
    "border": "#e2e8f0",
    "success": "#22c55e",
    "error": "#ef4444"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "scale": "default"
  },
  "styleKeywords": ["modern", "minimal", "clean"],
  "borderRadius": "rounded",
  "shadows": "subtle",
  "inspirations": [
    {
      "id": "insp_001",
      "type": "image",
      "path": "assets/style-inspirations/stripe-homepage.png",
      "notes": "Love the gradient backgrounds and clean typography"
    },
    {
      "id": "insp_002",
      "type": "url",
      "url": "https://linear.app",
      "notes": "Dark mode done right, great use of purple accents"
    }
  ]
}
```

### 4.3 tone.json
```json
{
  "toneKeywords": ["professional", "friendly", "confident"],
  "brandPersonality": ["innovative", "trustworthy", "approachable"],
  "targetAudience": "Technical founders and developers building SaaS products",
  "guidelines": {
    "do": [
      "Use active voice",
      "Be direct and concise",
      "Use 'you' to address the reader"
    ],
    "dont": [
      "Use buzzwords like 'synergy' or 'leverage'",
      "Be overly formal",
      "Use passive voice"
    ]
  },
  "examplePhrases": [
    "Ship faster, not harder.",
    "Built for developers who value their time.",
    "No fluff. Just results."
  ]
}
```

### 4.4 sitemap.json
```json
{
  "pages": [
    {
      "id": "page_home",
      "name": "Home",
      "slug": "/",
      "isHomepage": true,
      "metaTitle": "Acme - Ship Faster",
      "metaDescription": "The developer platform that helps you ship faster."
    },
    {
      "id": "page_pricing",
      "name": "Pricing",
      "slug": "/pricing",
      "isHomepage": false,
      "metaTitle": "Pricing - Acme",
      "metaDescription": "Simple, transparent pricing for teams of all sizes."
    },
    {
      "id": "page_about",
      "name": "About",
      "slug": "/about",
      "isHomepage": false,
      "metaTitle": "About Us - Acme",
      "metaDescription": "Meet the team behind Acme."
    }
  ]
}
```

### 4.5 navigation.json
```json
{
  "navbar": {
    "logo": {
      "type": "text",
      "value": "Acme",
      "imagePath": null
    },
    "links": [
      { "label": "Features", "target": "/#features", "type": "anchor" },
      { "label": "Pricing", "target": "/pricing", "type": "internal" },
      { "label": "About", "target": "/about", "type": "internal" },
      { "label": "Docs", "target": "https://docs.acme.com", "type": "external" }
    ],
    "cta": [
      { "label": "Sign In", "target": "/login", "style": "secondary" },
      { "label": "Get Started", "target": "/signup", "style": "primary" }
    ]
  },
  "footer": {
    "columns": [
      {
        "heading": "Product",
        "links": [
          { "label": "Features", "target": "/#features" },
          { "label": "Pricing", "target": "/pricing" },
          { "label": "Changelog", "target": "/changelog" }
        ]
      },
      {
        "heading": "Company",
        "links": [
          { "label": "About", "target": "/about" },
          { "label": "Blog", "target": "/blog" },
          { "label": "Careers", "target": "/careers" }
        ]
      },
      {
        "heading": "Legal",
        "links": [
          { "label": "Privacy", "target": "/privacy" },
          { "label": "Terms", "target": "/terms" }
        ]
      }
    ],
    "social": [
      { "platform": "twitter", "url": "https://twitter.com/acme" },
      { "platform": "github", "url": "https://github.com/acme" },
      { "platform": "linkedin", "url": "https://linkedin.com/company/acme" }
    ],
    "copyright": "© 2024 Acme Inc. All rights reserved.",
    "newsletter": {
      "enabled": true,
      "heading": "Stay updated",
      "placeholder": "Enter your email",
      "buttonText": "Subscribe"
    }
  }
}
```

### 4.6 pages/[page-slug].json
Example: `pages/home.json`
```json
{
  "pageId": "page_home",
  "sections": [
    {
      "id": "section_001",
      "type": "hero",
      "layoutVariant": "hero-centered-image-right",
      "order": 1,
      "copyInstructions": "Main headline should emphasize speed and developer experience. Subheadline should mention the key benefit: shipping faster. Include a primary CTA for signup and secondary for demo.",
      "visualInstructions": "Show a clean dashboard interface or code editor. Should feel modern and technical but not cluttered.",
      "inspirations": [
        {
          "id": "insp_h_001",
          "path": "assets/section-inspirations/home/hero-ref-1.png",
          "notes": "Like this layout with the floating UI elements"
        }
      ]
    },
    {
      "id": "section_002",
      "type": "logos",
      "layoutVariant": "logos-simple-row",
      "order": 2,
      "copyInstructions": "Headline: 'Trusted by teams at' - keep it simple",
      "visualInstructions": "Show 5-6 recognizable tech company logos in grayscale",
      "inspirations": []
    },
    {
      "id": "section_003",
      "type": "features",
      "layoutVariant": "features-three-column-cards",
      "order": 3,
      "copyInstructions": "3 key features: 1) Speed - how we make development faster, 2) Reliability - uptime and stability, 3) Developer Experience - great DX with docs and tooling. Each should have a short headline and 2-sentence description.",
      "visualInstructions": "Use simple, clean icons for each feature. Consider using Lucide icons.",
      "inspirations": [
        {
          "id": "insp_f_001",
          "path": "assets/section-inspirations/home/features-ref-1.png",
          "notes": "Like these card styles with the subtle shadows"
        }
      ]
    },
    {
      "id": "section_004",
      "type": "how-it-works",
      "layoutVariant": "how-it-works-numbered-steps",
      "order": 4,
      "copyInstructions": "3 steps: 1) Connect your repo, 2) Configure your settings, 3) Deploy. Each step should feel simple and achievable.",
      "visualInstructions": "Show screenshots or illustrations for each step. Could be actual UI mockups.",
      "inspirations": []
    },
    {
      "id": "section_005",
      "type": "testimonials",
      "layoutVariant": "testimonials-three-cards",
      "order": 5,
      "copyInstructions": "3 testimonials from technical users. Should mention specific benefits: time saved, reliability, ease of use. Include name, role, company.",
      "visualInstructions": "Avatar photos for each person. Company logos optional.",
      "inspirations": []
    },
    {
      "id": "section_006",
      "type": "cta",
      "layoutVariant": "cta-centered-simple",
      "order": 6,
      "copyInstructions": "Final push to sign up. Headline should create urgency without being pushy. Mention it's free to start.",
      "visualInstructions": "Could have subtle background pattern or gradient. Keep it clean.",
      "inspirations": []
    }
  ]
}
```

---

## 5. Section Types & Layout Variants

### Section Type: Hero
The main banner section at the top of a page.

| Variant ID | Name | Description |
|------------|------|-------------|
| `hero-centered` | Centered | Centered text, CTA buttons below, optional background image |
| `hero-centered-image-right` | Centered + Image Right | Centered-left text with image/graphic on right |
| `hero-split-50-50` | Split 50/50 | Equal columns: text left, image right |
| `hero-fullwidth-bg` | Full Width Background | Full-width background image with overlay text |
| `hero-video-bg` | Video Background | Video background with overlay text and CTA |

**Wireframe Components:** Heading, Subheading, Body text, Button (primary), Button (secondary), Image placeholder

---

### Section Type: Logos (Social Proof)
Display of partner/client/press logos.

| Variant ID | Name | Description |
|------------|------|-------------|
| `logos-simple-row` | Simple Row | Single row of logos, horizontally centered |
| `logos-with-heading` | With Heading | "Trusted by" heading above logo row |
| `logos-marquee` | Marquee/Carousel | Scrolling logo carousel |
| `logos-grid` | Grid | 2-row grid of logos |
| `logos-featured` | Featured | One large featured logo + row of smaller ones |

**Wireframe Components:** Heading, Logo placeholder (×6)

---

### Section Type: Features
Highlight product features or benefits.

| Variant ID | Name | Description |
|------------|------|-------------|
| `features-three-column-cards` | Three Column Cards | 3 feature cards in a row |
| `features-two-column-cards` | Two Column Cards | 2 larger feature cards |
| `features-list-with-icons` | List with Icons | Vertical list with icons |
| `features-alternating` | Alternating | Alternating image-left/image-right sections |
| `features-bento-grid` | Bento Grid | Asymmetric grid layout |

**Wireframe Components:** Heading, Subheading, Card (×3-6), Icon placeholder, Body text

---

### Section Type: How It Works
Step-by-step explanation of process.

| Variant ID | Name | Description |
|------------|------|-------------|
| `how-it-works-numbered-steps` | Numbered Steps | Horizontal numbered steps with descriptions |
| `how-it-works-vertical-timeline` | Vertical Timeline | Vertical timeline with alternating content |
| `how-it-works-cards` | Cards | Step cards in a row |
| `how-it-works-with-screenshots` | With Screenshots | Steps with accompanying screenshots |
| `how-it-works-interactive` | Interactive | Tabbed or clickable steps |

**Wireframe Components:** Heading, Subheading, Badge/Tag (step numbers), Body text, Image placeholder, Icon placeholder

---

### Section Type: Testimonials
Customer quotes and social proof.

| Variant ID | Name | Description |
|------------|------|-------------|
| `testimonials-single-featured` | Single Featured | One large, prominent testimonial |
| `testimonials-three-cards` | Three Cards | Three testimonial cards in a row |
| `testimonials-carousel` | Carousel | Sliding carousel of testimonials |
| `testimonials-grid` | Grid | 2×2 or 2×3 grid of testimonials |
| `testimonials-with-logos` | With Company Logos | Testimonials prominently featuring company logos |

**Wireframe Components:** Heading, Body text (quote), Avatar, Subheading (name/role), Logo placeholder

---

### Section Type: Pricing
Pricing plans and options.

| Variant ID | Name | Description |
|------------|------|-------------|
| `pricing-three-tiers` | Three Tiers | Classic 3-column pricing table |
| `pricing-two-tiers` | Two Tiers | Simple 2-plan comparison |
| `pricing-comparison-table` | Comparison Table | Detailed feature comparison matrix |
| `pricing-toggle-monthly-annual` | With Toggle | Monthly/annual toggle pricing |
| `pricing-single-plan` | Single Plan | One plan with feature list |

**Wireframe Components:** Heading, Subheading, Card, Badge/Tag (popular/recommended), List items, Button (primary), Button (secondary), Divider

---

### Section Type: FAQ
Frequently asked questions.

| Variant ID | Name | Description |
|------------|------|-------------|
| `faq-accordion` | Accordion | Expandable accordion style |
| `faq-two-column` | Two Column | Questions split into two columns |
| `faq-categorized` | Categorized | FAQs grouped by category |
| `faq-simple-list` | Simple List | Plain list of Q&As |
| `faq-with-search` | With Search | Searchable FAQ section |

**Wireframe Components:** Heading, Subheading, Body text (question), Body text (answer), Icon placeholder (expand/collapse)

---

### Section Type: CTA (Call to Action)
Conversion-focused sections.

| Variant ID | Name | Description |
|------------|------|-------------|
| `cta-centered-simple` | Centered Simple | Centered headline + CTA button |
| `cta-with-form` | With Form | CTA with email capture form |
| `cta-split-with-image` | Split with Image | Text on one side, image on other |
| `cta-banner` | Banner | Full-width colored banner |
| `cta-card` | Card | Contained card-style CTA |

**Wireframe Components:** Heading, Subheading, Button (primary), Button (secondary), Form (email), Image placeholder

---

### Section Type: Team
Team member showcase.

| Variant ID | Name | Description |
|------------|------|-------------|
| `team-grid` | Grid | Grid of team member cards |
| `team-carousel` | Carousel | Sliding carousel of team members |
| `team-featured-leadership` | Featured Leadership | Larger cards for leadership, grid for others |
| `team-simple-list` | Simple List | Minimal list with names and roles |
| `team-with-bios` | With Bios | Detailed cards with bios |

**Wireframe Components:** Heading, Subheading, Avatar, Body text (name), Body text (role), Body text (bio), Icon placeholder (social links)

---

### Section Type: Stats/Numbers
Impressive numbers and metrics.

| Variant ID | Name | Description |
|------------|------|-------------|
| `stats-row` | Row | Horizontal row of stats |
| `stats-cards` | Cards | Stats in individual cards |
| `stats-with-icons` | With Icons | Stats with accompanying icons |
| `stats-large-numbers` | Large Numbers | Oversized number display |
| `stats-with-context` | With Context | Stats with explanatory text |

**Wireframe Components:** Heading, Body text (number), Body text (label), Icon placeholder

---

### Section Type: Contact/Form
Contact information and forms.

| Variant ID | Name | Description |
|------------|------|-------------|
| `contact-simple-form` | Simple Form | Basic contact form |
| `contact-split-info-form` | Split Info + Form | Contact info on left, form on right |
| `contact-with-map` | With Map | Form with embedded map |
| `contact-cards` | Cards | Multiple contact method cards |
| `contact-minimal` | Minimal | Just email and social links |

**Wireframe Components:** Heading, Subheading, Form (full contact), Body text, Icon placeholder, Image placeholder (map)

---

### Section Type: Content/Blog
Content preview sections.

| Variant ID | Name | Description |
|------------|------|-------------|
| `content-three-cards` | Three Cards | Three blog post cards |
| `content-featured-plus-grid` | Featured + Grid | One large featured post + smaller grid |
| `content-list` | List | Vertical list of posts |
| `content-carousel` | Carousel | Sliding post carousel |
| `content-categorized` | Categorized | Posts grouped by category |

**Wireframe Components:** Heading, Subheading, Card, Image placeholder, Body text (title), Body text (excerpt), Badge/Tag (category), Body text (date)

---

## 6. Wireframe Component Library

These are the building blocks used to construct wireframe previews:

| Component | Description | Visual Representation |
|-----------|-------------|----------------------|
| **Heading** | Primary text (H1-H2) | Large text placeholder bar |
| **Subheading** | Secondary text (H3-H4) | Medium text placeholder bar |
| **Body Text** | Paragraph text | Multiple small text placeholder lines |
| **Button (Primary)** | Main CTA button | Filled rounded rectangle |
| **Button (Secondary)** | Secondary action | Outlined rounded rectangle |
| **Image Placeholder** | Image container | Rectangle with X and "Image" label |
| **Video Placeholder** | Video container | Rectangle with play icon |
| **Icon Placeholder** | Icon container | Small square or circle |
| **Form (Email)** | Email input + button | Input field + button |
| **Form (Full Contact)** | Multi-field form | Multiple input fields + textarea + button |
| **List Items** | Bulleted/numbered list | Lines with bullet/number prefixes |
| **Grid Container** | Grid layout wrapper | Dashed border container |
| **Card** | Contained content block | Rounded rectangle with shadow |
| **Avatar** | Profile photo placeholder | Circle with user icon |
| **Logo Placeholder** | Company logo space | Rounded rectangle with "Logo" |
| **Badge/Tag** | Label or tag | Small pill-shaped element |
| **Divider** | Horizontal separator | Thin horizontal line |

---

## 7. Prompt Generation System

### Prompt Sequence

When the user clicks "Build It," LandFall generates a sequence of prompts saved to `landfall/prompts/build-sequence.json`:

```json
{
  "generatedAt": "2024-01-15T14:30:00Z",
  "totalPrompts": 12,
  "prompts": [
    {
      "step": 1,
      "name": "Setup Style System",
      "description": "Implement global styles, colors, typography",
      "prompt": "..."
    },
    {
      "step": 2,
      "name": "Create Sitemap & Layout",
      "description": "Setup pages and shared layout components",
      "prompt": "..."
    },
    // ... more prompts
  ]
}
```

### Prompt Templates

#### Prompt 1: Setup Style System
```markdown
# Task: Setup Style System for Landing Page

Read the style configuration at `landfall/style.json` and implement the following:

1. **Tailwind Configuration**: Update `tailwind.config.js` with:
   - Custom color palette from the colors object
   - Typography settings (font families)
   - Border radius scale based on borderRadius setting
   - Box shadow scale based on shadows setting

2. **Global Styles**: Create/update `app/globals.css` with:
   - CSS custom properties for colors
   - Base typography styles
   - Any custom utility classes needed

3. **Font Setup**: Configure the specified fonts using next/font

Reference the style inspirations in `landfall/assets/style-inspirations/` for visual guidance on the intended aesthetic.

The style keywords are: [extracted from style.json]

Do not create any pages or components yet - just the style foundation.
```

#### Prompt 2: Create Sitemap & Layout
```markdown
# Task: Create Sitemap and Layout Structure

Read the following configuration files:
- `landfall/sitemap.json` - Page definitions
- `landfall/navigation.json` - Navbar and footer structure

Implement:

1. **App Router Pages**: Create the page structure in `app/`:
   - Create a folder/page.tsx for each page in the sitemap
   - Set up metadata (title, description) for each page
   - Pages should be placeholder shells for now

2. **Layout Component** (`app/layout.tsx`):
   - Wrap all pages with consistent layout
   - Include Navbar and Footer components

3. **Navbar Component** (`components/Navbar.tsx`):
   - Implement based on navigation.json navbar config
   - Include logo, nav links, and CTA buttons
   - Make it responsive (mobile menu)

4. **Footer Component** (`components/Footer.tsx`):
   - Implement based on navigation.json footer config
   - Include all columns, social links, copyright
   - Newsletter signup if enabled

Use the style system created in the previous step.
```

#### Prompt 3+: Section Prompts (one per section)
```markdown
# Task: Build [Section Type] Section for [Page Name]

Read the section configuration at `landfall/pages/[page-slug].json`, specifically section ID: [section_id]

**Section Details:**
- Type: [section type]
- Layout Variant: [variant id]
- Order: [order number]

**Copy Instructions:**
[Extracted from copyInstructions]

**Visual Instructions:**
[Extracted from visualInstructions]

**Reference Images:**
Review the inspiration images at:
- `landfall/assets/section-inspirations/[page]/[image-files]`
[List any notes from inspirations]

**Tone Guidelines:**
Reference `landfall/tone.json` for voice and messaging guidelines.

**Implementation:**
1. Create the section component at `components/sections/[SectionName].tsx`
2. Follow the [variant id] layout pattern
3. Use placeholder content that matches the copy instructions
4. Apply styles consistent with the style system
5. Make the section responsive

Export the component and add it to the [page-slug] page in the correct order.
```

### Build Sequence Logic

The prompt generator follows this order:

1. **Style System** (1 prompt)
2. **Sitemap & Layout** (1 prompt)
3. **Sections by Page** (1 prompt per section)
   - Process pages in sitemap order
   - Process sections within each page by their `order` field

Example for a site with 2 pages (Home with 6 sections, Pricing with 4 sections):
- Prompt 1: Style System
- Prompt 2: Sitemap & Layout
- Prompt 3: Home - Hero
- Prompt 4: Home - Logos
- Prompt 5: Home - Features
- Prompt 6: Home - How It Works
- Prompt 7: Home - Testimonials
- Prompt 8: Home - CTA
- Prompt 9: Pricing - Hero
- Prompt 10: Pricing - Pricing Table
- Prompt 11: Pricing - FAQ
- Prompt 12: Pricing - CTA

**Total: 12 prompts**

---

## 8. Web App UI Structure

### Navigation
Sidebar navigation with steps:
1. Style
2. Tone
3. Sitemap
4. Navigation
5. Pages & Sections
6. Preview
7. Build

Progress indicator showing completion status of each step.

### Page Layouts

#### Style Page
- Color picker grid for all color slots
- Typography selectors (font dropdowns)
- Style keyword tags (selectable chips)
- Border radius visual selector
- Shadow intensity slider
- Inspiration upload zone (drag & drop)
- URL input for website inspirations

#### Tone Page
- Tone keyword selector (chips)
- Brand personality input (tags)
- Target audience textarea
- Do's and Don'ts lists (editable)
- Example phrases textarea

#### Sitemap Page
- Page list with add/remove/reorder
- Page detail editor (name, slug, meta)
- Visual sitemap tree preview

#### Navigation Page
- Navbar configurator
  - Logo upload/text toggle
  - Link list editor
  - CTA button configurator
- Footer configurator
  - Column manager
  - Social links
  - Copyright and newsletter settings

#### Pages & Sections Page
- Page selector tabs
- Section list for selected page
- Drag-and-drop reordering
- Section editor panel:
  - Type selector
  - Layout variant picker (visual thumbnails)
  - Copy instructions textarea
  - Visual instructions textarea
  - Inspiration upload zone

#### Preview Page
- Full wireframe preview
- Page tabs at top
- Each section rendered as wireframe
- Annotations overlay (copy/visual instructions)
- Responsive preview toggles (desktop/tablet/mobile)

#### Build Page
- Summary of all inputs
- Validation warnings if incomplete
- "Generate Prompts" button
- Generated prompt list with copy buttons
- Export options (copy all, download markdown)

---

## 9. File Operations

### On `landfall init`

```bash
landfall/
├── config.json          # Initialized with defaults
├── style.json           # Initialized with defaults
├── tone.json            # Initialized with defaults
├── sitemap.json         # Initialized with single "Home" page
├── navigation.json      # Initialized with minimal navbar/footer
├── pages/
│   └── home.json        # Initialized with empty sections array
├── assets/
│   ├── style-inspirations/
│   └── section-inspirations/
└── prompts/
```

### File Watching
The web app watches for external changes to JSON files (in case user edits via AI tool) and reloads the UI.

### Image Handling
- Images uploaded via UI are saved to appropriate `assets/` subfolder
- Filenames are sanitized and made unique (UUID prefix if needed)
- Path is stored in relevant JSON file
- Preview in UI uses local file URLs

---

## 10. Technical Specifications

### CLI Package Structure
```
landfall/
├── bin/
│   └── cli.js           # Entry point
├── src/
│   ├── cli/
│   │   ├── init.js      # Init command logic
│   │   ├── dev.js       # Dev server command
│   │   └── build.js     # Prompt generation command
│   ├── app/             # Next.js web app
│   │   ├── app/         # App router pages
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities, file operations
│   └── templates/       # JSON templates for init
├── package.json
└── README.md
```

### API Routes (Internal)
The web app uses Next.js API routes for file operations:

- `GET /api/config` - Read any config file
- `PUT /api/config` - Update any config file
- `POST /api/assets/upload` - Handle image uploads
- `DELETE /api/assets/:path` - Delete uploaded asset
- `POST /api/build` - Generate prompts

### State Management
- React Query or SWR for server state (file contents)
- Local state for UI interactions
- Auto-save on changes (debounced)

---

## 11. Future Considerations

### Potential Enhancements
- **Template Library**: Pre-built landing page templates to start from
- **Component Library**: Save custom section configurations for reuse
- **AI Preview**: Generate actual preview images using AI before building
- **Direct Integration**: Plugin system for direct integration with Cursor, Claude Code
- **Version History**: Git-like versioning of specs
- **Collaboration**: Multi-user editing (would require moving beyond JSON files)
- **Export Formats**: Generate prompts optimized for specific AI tools
- **Custom Section Types**: User-defined section types and layouts

### Out of Scope for V1
- Actual code generation (we generate prompts, not code)
- Deployment
- CMS integration
- Authentication/user accounts
- Cloud storage

---

## 12. Success Metrics

### User Goals
- Reduce time from idea to shipped landing page
- Increase consistency and quality of AI-generated pages
- Eliminate back-and-forth iterations with AI tools

### Measurable Outcomes
- Time to complete specification flow
- Number of prompts needed to achieve desired result
- User satisfaction with generated pages

---

## Appendix A: Default Configuration Values

### style.json defaults
```json
{
  "colors": {
    "primary": "#2563eb",
    "primaryLight": "#3b82f6",
    "primaryDark": "#1d4ed8",
    "secondary": "#7c3aed",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "backgroundAlt": "#f8fafc",
    "text": "#1e293b",
    "textMuted": "#64748b",
    "border": "#e2e8f0",
    "success": "#22c55e",
    "error": "#ef4444"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "scale": "default"
  },
  "styleKeywords": [],
  "borderRadius": "rounded",
  "shadows": "subtle",
  "inspirations": []
}
```

### tone.json defaults
```json
{
  "toneKeywords": [],
  "brandPersonality": [],
  "targetAudience": "",
  "guidelines": {
    "do": [],
    "dont": []
  },
  "examplePhrases": []
}
```

---

## Appendix B: Wireframe Visual Reference

```
┌────────────────────────────────────────────────────────────────┐
│ HERO - Centered + Image Right                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ████████████████████████              ┌──────────────────┐   │
│   ████████████████████████              │                  │   │
│                                         │                  │   │
│   ░░░░░░░░░░░░░░░░░░░░░░░░              │      IMAGE       │   │
│   ░░░░░░░░░░░░░░░░░░░░                  │                  │   │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░            │                  │   │
│                                         └──────────────────┘   │
│   ┌─────────────┐  ┌───────────┐                               │
│   │  PRIMARY    │  │ SECONDARY │                               │
│   └─────────────┘  └───────────┘                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ FEATURES - Three Column Cards                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│              ████████████████████████                          │
│              ░░░░░░░░░░░░░░░░░░░░░░                            │
│                                                                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│   │     ◯        │  │     ◯        │  │     ◯        │        │
│   │              │  │              │  │              │        │
│   │  ██████████  │  │  ██████████  │  │  ██████████  │        │
│   │  ░░░░░░░░░░  │  │  ░░░░░░░░░░  │  │  ░░░░░░░░░░  │        │
│   │  ░░░░░░░░    │  │  ░░░░░░░░    │  │  ░░░░░░░░    │        │
│   └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Legend:
████  = Heading
░░░░  = Body text  
◯     = Icon
┌───┐ = Card/Container
```

---

*End of Specification*
