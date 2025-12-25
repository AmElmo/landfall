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
Assistant: Your features section highlights 4 key capabilities. Based on your
"Professional" tone and tech product focus, I suggest:

1. **Abstract icons**: Clean, geometric icons in your navy/gold palette
   - Midjourney prompt: "Minimal geometric icon, single color, representing [feature],
     flat design, navy blue on white background"

2. **Isometric illustrations**: 3D-style illustrations showing each feature
   - Search terms: "isometric technology illustration [feature name]"

3. **Screenshot mockups**: If you have a product, stylized screenshots work well

Want me to generate specific prompts for each of your 4 features?

User: "Yes, generate prompts for all features"
Assistant: Here are Midjourney prompts for each feature:

**Feature 1 - Analytics Dashboard**
"Minimal isometric 3D icon of a bar chart with upward trend, navy blue (#1e3a5f)
and gold (#d4af37) accent, white background, clean corporate style"

**Feature 2 - Team Collaboration**
"Minimal isometric 3D icon of connected nodes or people silhouettes,
navy blue primary, gold highlights, white background, professional tech aesthetic"

[...continues for each feature...]

I've saved these to your project. You can copy them directly into Midjourney or DALL-E.
```

### Implementation Considerations

- **AI Provider**: Could use Claude API (Sonnet for speed, Opus for complex requests)
- **Function Calling**: Define tools for each type of edit (updateStyle, addSection, updateTone, etc.)
- **Streaming**: Stream responses for better UX on longer generations
- **Validation**: AI-generated JSON must be validated before saving
- **Undo/History**: Track changes so users can say "undo that" or "go back to the previous colors"
- **Hybrid Mode**: Users can still use manual UI controls; chat is additive, not replacement

### User Experience Goals

1. **Lower barrier to entry**: Users who don't know design terminology can describe what they want
2. **Faster iteration**: "Make it bluer" is faster than finding the color picker
3. **Discovery**: Assistant can suggest features users didn't know existed
4. **Confidence**: Users can ask "does this look professional?" and get feedback
5. **Creative support**: Visual suggestions remove the "blank canvas" problem

---

## 2. MCP Build Orchestration

### The Vision

Once the landing page is designed, users need to actually build it. Rather than forcing users to copy-paste prompts manually into their AI coding tool, we provide an MCP (Model Context Protocol) server that orchestrates the build process. Users can use any MCP-compatible tool (Claude Code, Cursor, Windsurf, Claude Desktop) to execute the build with full progress tracking.

### Current State

Today, the Build step:
1. Generates a sequence of prompts (style system → layout → sections)
2. Displays them in an accordion UI
3. User must manually copy each prompt into their AI coding tool
4. No tracking of what's been completed
5. No connection back to Landfall

This is cumbersome and error-prone.

### Proposed Solution

An MCP server that:
1. Exposes the generated prompts as tools
2. Tracks completion status
3. Reports progress back to the Landfall app
4. Works with any MCP-compatible AI coding tool

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Landfall App (Cloud)                                           │
│   ┌────────────────────────────────────────────────────────────┐ │
│   │  Build Progress                                            │ │
│   │  ════════════════════════════════════════                  │ │
│   │                                                            │ │
│   │  ████████████████░░░░░░░░  62%                            │ │
│   │                                                            │ │
│   │  ✓ Style system created                                    │ │
│   │  ✓ Layout & navigation done                                │ │
│   │  ✓ Hero section complete                                   │ │
│   │  ◉ Features section (in progress via Claude Code)          │ │
│   │  ○ Pricing section                                         │ │
│   │  ○ FAQ section                                             │ │
│   │                                                            │ │
│   └────────────────────────────────────────────────────────────┘ │
│                          ↑                                       │
│                          │ Progress updates                      │
│                          │                                       │
└──────────────────────────│───────────────────────────────────────┘
                           │
                           │ API calls
                           │
┌──────────────────────────│───────────────────────────────────────┐
│                          │                                       │
│   User's Machine         ↓                                       │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Landfall MCP Server                                    │   │
│   │  (npm install -g landfall-mcp)                          │   │
│   │                                                         │   │
│   │  Tools exposed:                                         │   │
│   │  - landfall_get_project_info()                          │   │
│   │  - landfall_get_next_prompt()                           │   │
│   │  - landfall_mark_complete(step)                         │   │
│   │  - landfall_get_status()                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          ↑                                       │
│                          │ MCP Protocol                          │
│                          ↓                                       │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Claude Code / Cursor / Windsurf                        │   │
│   │  (User's AI coding tool of choice)                      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### MCP Server Tools

```typescript
// Get project overview
landfall_get_project_info()
// Returns: { name, pages, sections, totalSteps, completedSteps }

// Get the next prompt to execute
landfall_get_next_prompt()
// Returns: { step, name, description, prompt, isLast }

// Get a specific prompt by step number
landfall_get_prompt(step: number)
// Returns: { step, name, description, prompt }

// Mark a step as complete
landfall_mark_complete(step: number, notes?: string)
// Returns: { success, nextStep }

// Get overall build status
landfall_get_status()
// Returns: { totalSteps, completedSteps, currentStep, percentComplete }

// Report an error or issue
landfall_report_issue(step: number, error: string)
// Returns: { logged: true }
```

### User Flow

1. User completes design in Landfall web app
2. Clicks "Connect AI Tool" → gets a project token
3. Configures MCP in their tool of choice:
   ```json
   {
     "mcpServers": {
       "landfall": {
         "command": "npx",
         "args": ["landfall-mcp"],
         "env": {
           "LANDFALL_PROJECT_ID": "proj_abc123",
           "LANDFALL_API_KEY": "sk_..."
         }
       }
     }
   }
   ```
4. In their AI tool, they say: "Build my Landfall project"
5. AI tool calls `landfall_get_next_prompt()`, executes, calls `landfall_mark_complete()`
6. Landfall app shows real-time progress
7. User can watch progress, pause, or intervene if needed

### API Endpoints Required

```
POST /api/mcp/auth
  → Validate project token, return project access

GET /api/mcp/project/:id
  → Return project info and prompt list

GET /api/mcp/project/:id/prompt/:step
  → Return specific prompt

POST /api/mcp/project/:id/progress
  → Update step completion status

GET /api/mcp/project/:id/status
  → Return current build status
```

### Benefits

1. **Use any AI tool**: Not locked into a specific provider
2. **Leverage existing subscriptions**: Users use their own Cursor/Claude Code
3. **Progress visibility**: Watch the build happen in real-time
4. **Resilience**: Can pause and resume, pick up where left off
5. **Quality control**: User can review each step before proceeding
6. **Analytics**: We learn which steps fail, which take longest

### Implementation Phases

**Phase 1: Local MCP (MVP)**
- MCP server reads from local `landfall/prompts/` folder
- No cloud connection
- Simple step tracking in local file

**Phase 2: Connected MCP**
- Cloud-synced progress
- Real-time dashboard in web app
- Project tokens and authentication

**Phase 3: Smart Orchestration**
- AI decides when to proceed vs ask for review
- Automatic retry on failures
- Parallel execution where possible

---

## Summary

| Feature | Purpose | User Benefit |
|---------|---------|--------------|
| **Conversational Design** | Natural language design input | Faster, more intuitive design process |
| **Visual Suggestions** | AI-powered imagery recommendations | Removes creative blocks, ensures consistency |
| **MCP Orchestration** | Automated build execution | No copy-paste, use preferred AI tool, track progress |

Together, these features complete the vision: **talk your landing page into existence, then watch it get built automatically**.

---

## Open Questions

### Conversational Design
- Should the chat be always visible or toggleable?
- How do we handle ambiguous requests? (Ask for clarification vs best guess)
- Should there be a "design from scratch" mode that's purely conversational?
- Should visual suggestions be automatic or on-demand?

### MCP Orchestration
- Should we support fully offline mode (no cloud connection)?
- How do we handle build failures gracefully?
- Should users be able to edit prompts before execution?
- Do we want to support webhooks for CI/CD integration?

---

*Last updated: December 2024*
