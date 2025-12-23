// Configuration Types
export interface Config {
  version: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  targetFramework: string;
  currentStep: number;
}

// Style Types
export interface StyleColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  error: string;
}

export interface StyleTypography {
  headingFont: string;
  bodyFont: string;
  scale: 'compact' | 'default' | 'spacious';
}

export interface StyleInspiration {
  id: string;
  type: 'image' | 'url';
  path?: string;
  url?: string;
  notes: string;
}

export interface Style {
  colors: StyleColors;
  typography: StyleTypography;
  styleKeywords: string[];
  borderRadius: 'sharp' | 'slightly-rounded' | 'rounded' | 'pill';
  shadows: 'none' | 'subtle' | 'medium' | 'dramatic';
  inspirations: StyleInspiration[];
}

// Tone Types
export interface ToneGuidelines {
  do: string[];
  dont: string[];
}

export interface ToneInspiration {
  id: string;
  type: 'image' | 'url';
  path?: string;
  url?: string;
  notes: string;
}

export interface Tone {
  toneKeywords: string[];
  brandPersonality: string[];
  targetAudience: string;
  guidelines: ToneGuidelines;
  examplePhrases: string[];
  inspirations: ToneInspiration[];
}

// Sitemap Types
export interface Page {
  id: string;
  name: string;
  slug: string;
  isHomepage: boolean;
  metaTitle: string;
  metaDescription: string;
}

export interface Sitemap {
  pages: Page[];
}

// Navigation Types
export interface NavbarLogo {
  type: 'text' | 'image';
  value: string;
  imagePath: string | null;
}

export interface NavLink {
  label: string;
  target: string;
  type: 'internal' | 'external' | 'anchor';
}

export interface NavCta {
  label: string;
  target: string;
  style: 'primary' | 'secondary';
}

export type NavbarLayout = 'logo-left-links-right' | 'logo-left-links-center' | 'minimal';

export interface Navbar {
  layout: NavbarLayout;
  logo: NavbarLogo;
  links: NavLink[];
  cta: NavCta[];
}

export interface FooterColumn {
  heading: string;
  links: { label: string; target: string }[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Newsletter {
  enabled: boolean;
  heading: string;
  placeholder: string;
  buttonText: string;
}

export type FooterLayout = 'columns-simple' | 'columns-with-logo' | 'centered-minimal' | 'stacked';

export interface Footer {
  layout: FooterLayout;
  columns: FooterColumn[];
  social: SocialLink[];
  copyright: string;
  newsletter: Newsletter;
}

export interface Navigation {
  navbar: Navbar;
  footer: Footer;
}

// Section Types
export type SectionType =
  | 'hero'
  | 'logos'
  | 'features'
  | 'how-it-works'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'team'
  | 'stats'
  | 'contact'
  | 'content';

export interface SectionInspiration {
  id: string;
  type: 'image' | 'url';
  path?: string;
  url?: string;
  notes: string;
}

// Inspiration for a specific image element within a section
export interface ImageInspiration {
  id: string;
  elementRole: string;      // The role from wireframe element (e.g., "hero-image", "background-image")
  type: 'image' | 'url';
  path?: string;            // Path to uploaded reference image
  url?: string;             // URL to reference image
  description: string;      // Text description of what this image should show
}

export interface Section {
  id: string;
  type: SectionType | 'custom';
  customType?: string; // For custom section types defined by user
  layoutVariant: string; // Legacy - keeping for backwards compatibility
  layoutTemplateId?: string; // New wireframe-based layout template
  order: number;
  copyInstructions: string;
  visualInstructions: string;
  inspirations: SectionInspiration[];
  imageInspirations?: ImageInspiration[]; // Per-image inspiration/instructions
}

export interface PageSections {
  pageId: string;
  sections: Section[];
}

// Build Types
export interface BuildPrompt {
  step: number;
  name: string;
  description: string;
  prompt: string;
}

export interface BuildSequence {
  generatedAt: string;
  totalPrompts: number;
  prompts: BuildPrompt[];
}

// Step definitions
// Navigation comes after Sections so users can select from sitemap pages and section anchors
export const STEPS = [
  { id: 1, name: 'Style', slug: 'style', description: 'Define your visual identity' },
  { id: 2, name: 'Tone', slug: 'tone', description: 'Set your voice and messaging' },
  { id: 3, name: 'Sitemap', slug: 'sitemap', description: 'Plan your pages' },
  { id: 4, name: 'Sections', slug: 'sections', description: 'Build your page layouts' },
  { id: 5, name: 'Navigation', slug: 'navigation', description: 'Configure navbar and footer' },
  { id: 6, name: 'Preview', slug: 'preview', description: 'Review your wireframes' },
  { id: 7, name: 'Build', slug: 'build', description: 'Generate your prompts' },
] as const;

export type StepSlug = typeof STEPS[number]['slug'];

// Section type definitions with variants
export const SECTION_TYPES = {
  hero: {
    name: 'Hero',
    description: 'Main banner section at the top of a page',
    variants: [
      { id: 'hero-centered', name: 'Centered', description: 'Centered text, CTA buttons below' },
      { id: 'hero-centered-image-right', name: 'Centered + Image Right', description: 'Text left with image on right' },
      { id: 'hero-split-50-50', name: 'Split 50/50', description: 'Equal columns: text left, image right' },
      { id: 'hero-fullwidth-bg', name: 'Full Width Background', description: 'Full-width background image with overlay text' },
      { id: 'hero-video-bg', name: 'Video Background', description: 'Video background with overlay text' },
    ]
  },
  logos: {
    name: 'Logos',
    description: 'Display of partner/client/press logos',
    variants: [
      { id: 'logos-simple-row', name: 'Simple Row', description: 'Single row of logos' },
      { id: 'logos-with-heading', name: 'With Heading', description: '"Trusted by" heading above logo row' },
      { id: 'logos-marquee', name: 'Marquee', description: 'Scrolling logo carousel' },
      { id: 'logos-grid', name: 'Grid', description: '2-row grid of logos' },
      { id: 'logos-featured', name: 'Featured', description: 'One large featured logo + row of smaller ones' },
    ]
  },
  features: {
    name: 'Features',
    description: 'Highlight product features or benefits',
    variants: [
      { id: 'features-three-column-cards', name: 'Three Column Cards', description: '3 feature cards in a row' },
      { id: 'features-two-column-cards', name: 'Two Column Cards', description: '2 larger feature cards' },
      { id: 'features-list-with-icons', name: 'List with Icons', description: 'Vertical list with icons' },
      { id: 'features-alternating', name: 'Alternating', description: 'Alternating image-left/image-right sections' },
      { id: 'features-bento-grid', name: 'Bento Grid', description: 'Asymmetric grid layout' },
    ]
  },
  'how-it-works': {
    name: 'How It Works',
    description: 'Step-by-step explanation of process',
    variants: [
      { id: 'how-it-works-numbered-steps', name: 'Numbered Steps', description: 'Horizontal numbered steps' },
      { id: 'how-it-works-vertical-timeline', name: 'Vertical Timeline', description: 'Vertical timeline with alternating content' },
      { id: 'how-it-works-cards', name: 'Cards', description: 'Step cards in a row' },
      { id: 'how-it-works-with-screenshots', name: 'With Screenshots', description: 'Steps with accompanying screenshots' },
      { id: 'how-it-works-interactive', name: 'Interactive', description: 'Tabbed or clickable steps' },
    ]
  },
  testimonials: {
    name: 'Testimonials',
    description: 'Customer quotes and social proof',
    variants: [
      { id: 'testimonials-single-featured', name: 'Single Featured', description: 'One large, prominent testimonial' },
      { id: 'testimonials-three-cards', name: 'Three Cards', description: 'Three testimonial cards in a row' },
      { id: 'testimonials-carousel', name: 'Carousel', description: 'Sliding carousel of testimonials' },
      { id: 'testimonials-grid', name: 'Grid', description: '2×2 or 2×3 grid of testimonials' },
      { id: 'testimonials-with-logos', name: 'With Logos', description: 'Testimonials with company logos' },
    ]
  },
  pricing: {
    name: 'Pricing',
    description: 'Pricing plans and options',
    variants: [
      { id: 'pricing-three-tiers', name: 'Three Tiers', description: 'Classic 3-column pricing table' },
      { id: 'pricing-two-tiers', name: 'Two Tiers', description: 'Simple 2-plan comparison' },
      { id: 'pricing-comparison-table', name: 'Comparison Table', description: 'Detailed feature comparison matrix' },
      { id: 'pricing-toggle-monthly-annual', name: 'With Toggle', description: 'Monthly/annual toggle pricing' },
      { id: 'pricing-single-plan', name: 'Single Plan', description: 'One plan with feature list' },
    ]
  },
  faq: {
    name: 'FAQ',
    description: 'Frequently asked questions',
    variants: [
      { id: 'faq-accordion', name: 'Accordion', description: 'Expandable accordion style' },
      { id: 'faq-two-column', name: 'Two Column', description: 'Questions split into two columns' },
      { id: 'faq-categorized', name: 'Categorized', description: 'FAQs grouped by category' },
      { id: 'faq-simple-list', name: 'Simple List', description: 'Plain list of Q&As' },
      { id: 'faq-with-search', name: 'With Search', description: 'Searchable FAQ section' },
    ]
  },
  cta: {
    name: 'CTA',
    description: 'Conversion-focused sections',
    variants: [
      { id: 'cta-centered-simple', name: 'Centered Simple', description: 'Centered headline + CTA button' },
      { id: 'cta-with-form', name: 'With Form', description: 'CTA with email capture form' },
      { id: 'cta-split-with-image', name: 'Split with Image', description: 'Text on one side, image on other' },
      { id: 'cta-banner', name: 'Banner', description: 'Full-width colored banner' },
      { id: 'cta-card', name: 'Card', description: 'Contained card-style CTA' },
    ]
  },
  team: {
    name: 'Team',
    description: 'Team member showcase',
    variants: [
      { id: 'team-grid', name: 'Grid', description: 'Grid of team member cards' },
      { id: 'team-carousel', name: 'Carousel', description: 'Sliding carousel of team members' },
      { id: 'team-featured-leadership', name: 'Featured Leadership', description: 'Larger cards for leadership' },
      { id: 'team-simple-list', name: 'Simple List', description: 'Minimal list with names and roles' },
      { id: 'team-with-bios', name: 'With Bios', description: 'Detailed cards with bios' },
    ]
  },
  stats: {
    name: 'Stats',
    description: 'Impressive numbers and metrics',
    variants: [
      { id: 'stats-row', name: 'Row', description: 'Horizontal row of stats' },
      { id: 'stats-cards', name: 'Cards', description: 'Stats in individual cards' },
      { id: 'stats-with-icons', name: 'With Icons', description: 'Stats with accompanying icons' },
      { id: 'stats-large-numbers', name: 'Large Numbers', description: 'Oversized number display' },
      { id: 'stats-with-context', name: 'With Context', description: 'Stats with explanatory text' },
    ]
  },
  contact: {
    name: 'Contact',
    description: 'Contact information and forms',
    variants: [
      { id: 'contact-simple-form', name: 'Simple Form', description: 'Basic contact form' },
      { id: 'contact-split-info-form', name: 'Split Info + Form', description: 'Contact info on left, form on right' },
      { id: 'contact-with-map', name: 'With Map', description: 'Form with embedded map' },
      { id: 'contact-cards', name: 'Cards', description: 'Multiple contact method cards' },
      { id: 'contact-minimal', name: 'Minimal', description: 'Just email and social links' },
    ]
  },
  content: {
    name: 'Content/Blog',
    description: 'Content preview sections',
    variants: [
      { id: 'content-three-cards', name: 'Three Cards', description: 'Three blog post cards' },
      { id: 'content-featured-plus-grid', name: 'Featured + Grid', description: 'One large featured post + smaller grid' },
      { id: 'content-list', name: 'List', description: 'Vertical list of posts' },
      { id: 'content-carousel', name: 'Carousel', description: 'Sliding post carousel' },
      { id: 'content-categorized', name: 'Categorized', description: 'Posts grouped by category' },
    ]
  },
} as const;

// Wireframe Element Types
export type WireframeElementType =
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'label'
  | 'button-primary'
  | 'button-secondary'
  | 'image'
  | 'video'
  | 'input'
  | 'icon'
  | 'avatar'
  | 'logo'
  | 'list'
  | 'card';

export type WireframeElementSize = 'small' | 'medium' | 'large';
export type WireframeElementAlign = 'left' | 'center' | 'right';

export interface WireframeElement {
  type: WireframeElementType;
  size?: WireframeElementSize;
  align?: WireframeElementAlign;
  role?: string; // Semantic role for prompt generation (e.g., "title", "subtitle", "feature-description")
  repeat?: number; // For repeating elements (e.g., 3 feature cards)
  children?: WireframeElement[]; // For container elements like cards
}

export interface LayoutTemplate {
  id: string;
  name: string;
  sectionType: SectionType;
  description: string;
  structure: string; // e.g., "3-column-grid", "alternating-rows", "centered-stack"
  elements: WireframeElement[];
}

export interface LayoutTemplateCategory {
  sectionType: SectionType;
  templates: LayoutTemplate[];
}
