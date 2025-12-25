# Future Improvements

This document outlines the two major feature areas planned to complete the Landfall experience: an AI-powered conversational design flow and an MCP-based build orchestration system.

---

## 1. Conversational Design Assistant

### The Vision

Transform the landing page design process from manual clicking and form-filling into a natural conversation. Users should be able to "talk their landing page into existence" through a chat interface that understands the application's capabilities and edits the configuration directly.

### Current State

Today, users navigate through a 7-step wizard:
1. Style - manually pick colors, fonts, keywords
2. Tone - manually select tone keywords, write guidelines
3. Sitemap - manually add pages
4. Sections - manually add sections, pick templates, write instructions
5. Navigation - manually configure navbar/footer
6. Preview - review wireframes
7. Build - generate prompts

Each step requires direct manipulation of UI elements. While this works, it can be slow and requires users to know what they want upfront.

### Proposed Solution

Add a persistent chat panel (right sidebar) that acts as a design assistant:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ┌─────────────────────────────────┬─────────────────────────────┐ │
│   │                                 │  Design Assistant           │ │
│   │                                 │  ─────────────────────────  │ │
│   │     Current Step UI             │                             │ │
│   │     (Style, Sections, etc.)     │  You: I want a more         │ │
│   │                                 │  professional look, maybe   │ │
│   │                                 │  navy blue and gold         │ │
│   │                                 │                             │ │
│   │                                 │  Assistant: I've updated    │ │
│   │                                 │  your color palette to a    │ │
│   │                                 │  navy (#1e3a5f) primary     │ │
│   │                                 │  with gold (#d4af37)        │ │
│   │                                 │  accents. The preview on    │ │
│   │                                 │  the left reflects this.    │ │
│   │                                 │  Want me to adjust the      │ │
│   │                                 │  typography to match?       │ │
│   │                                 │                             │ │
│   │                                 │  [Type a message...]        │ │
│   └─────────────────────────────────┴─────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Context Awareness**: The assistant knows which step the user is on and what can be edited
2. **Direct JSON Manipulation**: When the user requests changes, the AI edits the underlying JSON configuration files directly
3. **Real-time Reflection**: Changes to JSON immediately reflect in the UI (already works this way)
4. **Guided Flow**: The assistant can guide users through the process, asking clarifying questions

### Technical Approach

```
User Message
    ↓
AI understands intent + current context (step, existing config)
    ↓
AI generates JSON edits (style.json, tone.json, pages/*.json, etc.)
    ↓
API saves updated JSON
    ↓
React context reloads → UI updates
    ↓
AI confirms changes to user
```

### Capabilities the Assistant Should Have

| Category | Examples |
|----------|----------|
| **Style** | "Make it more minimalist", "Use warmer colors", "I like the Apple website aesthetic" |
| **Tone** | "We're targeting enterprise customers", "Make it friendlier", "More urgent/action-oriented" |
| **Sections** | "Add a testimonials section", "I need a pricing table with 3 tiers", "Remove the FAQ" |
| **Content** | "The hero should emphasize speed", "Add a section about security features" |
| **Navigation** | "Add a link to our blog", "I want a sticky navbar" |
| **General** | "Show me what we have so far", "What's missing?", "I'm done with colors, what's next?" |

### AI-Powered Visual Suggestions

Beyond editing, the assistant should proactively help users with visual and creative decisions. When a user is working on a visual element (hero image, section imagery, icons, illustrations), the AI can generate contextual suggestions based on the entire project.

**How it works:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   User selects "Hero Image" element                                 │
│                                                                     │
│   ┌─────────────────────────────────┬─────────────────────────────┐ │
│   │                                 │  Visual Suggestions         │ │
│   │   [Hero Section Editor]         │  ─────────────────────────  │ │
│   │                                 │                             │ │
│   │   Hero Image: [empty]           │  Based on your project:     │ │
│   │   [Click to add]                │  • Fintech SaaS             │ │
│   │                                 │  • Professional tone        │ │
│   │                                 │  • Navy & gold palette      │ │
│   │                                 │                             │ │
│   │                                 │  I suggest:                 │ │
│   │                                 │                             │ │
│   │                                 │  1. Abstract dashboard      │ │
│   │                                 │     mockup with charts      │ │
│   │                                 │                             │ │
│   │                                 │  2. Professional team       │ │
│   │                                 │     collaborating           │ │
│   │                                 │                             │ │
│   │                                 │  3. Minimalist geometric    │ │
│   │                                 │     pattern with brand      │ │
│   │                                 │     colors                  │ │
│   │                                 │                             │ │
│   │                                 │  [Generate with AI]         │ │
│   │                                 │  [Search stock photos]      │ │
│   │                                 │  [Describe your own idea]   │ │
│   └─────────────────────────────────┴─────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Context the AI uses for suggestions:**

| Context | How it influences suggestions |
|---------|------------------------------|
| **Industry/Product** | A fintech app gets dashboard imagery; a bakery gets warm, appetizing photos |
| **Tone keywords** | "Professional" → clean, corporate imagery; "Playful" → illustrations, bright colors |
| **Color palette** | Suggests images that complement the chosen brand colors |
| **Section type** | Hero → impactful, attention-grabbing; Testimonials → human faces; Features → icons or abstract |
| **Other sections** | Maintains visual consistency across the page |
| **Target audience** | Enterprise → professional settings; Consumers → lifestyle imagery |

**Types of visual suggestions:**

1. **Image descriptions** - Detailed prompts the user can use with AI image generators (Midjourney, DALL-E, etc.)
2. **Stock photo search terms** - Optimized keywords for Unsplash, Pexels, Shutterstock
3. **Icon recommendations** - Specific icon names from popular libraries (Lucide, Heroicons)
4. **Illustration style guidance** - "Flat illustration with 2-3 brand colors" or "Isometric 3D style"
5. **Layout suggestions** - "For this section, consider placing the image on the left with text overlay"

**Example user interactions:**

```
User: "I need an image for the features section"