# landfall-mcp

MCP (Model Context Protocol) server for Landfall - orchestrate AI-powered landing page builds.

This package allows AI coding tools like Claude Code, Cursor, and Windsurf to execute Landfall build prompts automatically.

## Installation

```bash
npm install -g landfall-mcp
```

Or use directly with npx:

```bash
npx landfall-mcp
```

## Setup

### Claude Code

Add to your MCP settings (`~/.claude/claude_desktop_config.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "landfall": {
      "command": "npx",
      "args": ["landfall-mcp"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "landfall": {
      "command": "npx",
      "args": ["landfall-mcp"]
    }
  }
}
```

## Available Tools

### `landfall_get_project_info`

Get overview of the current Landfall project.

**Returns:**
- `projectName` - Name of the project
- `projectPath` - Path to the project root
- `pages` - Number of pages in the sitemap
- `totalSteps` - Total number of build steps
- `completedSteps` - Number of completed steps
- `generatedAt` - When prompts were generated

### `landfall_get_next_prompt`

Get the next unexecuted build prompt.

**Returns:**
- `step` - Step number
- `name` - Step name (e.g., "Setup Style System")
- `description` - Brief description
- `prompt` - Full prompt text to execute
- `isLastStep` - Whether this is the final step
- `totalSteps` - Total number of steps
- `completedSteps` - Number completed so far

### `landfall_get_prompt`

Get a specific build prompt by step number.

**Parameters:**
- `step` (number, required) - The step number to retrieve

**Returns:** Same as `landfall_get_next_prompt` plus `isComplete` flag.

### `landfall_mark_complete`

Mark a build step as complete.

**Parameters:**
- `step` (number, required) - The step number to mark complete
- `notes` (string, optional) - Notes about the implementation

**Returns:**
- `step` - The step that was marked complete
- `markedAt` - Timestamp
- `notes` - Any notes provided
- `nextStep` - Info about the next step (or null if done)
- `totalSteps` - Total number of steps
- `completedSteps` - Number now completed
- `percentComplete` - Completion percentage

### `landfall_get_status`

Get the current build status.

**Returns:**
- `totalSteps` - Total number of build steps
- `completedSteps` - Number completed
- `currentStep` - Next step to work on (or null if done)
- `percentComplete` - Completion percentage
- `isComplete` - Whether all steps are done
- `startedAt` - When the build started
- `lastUpdatedAt` - Last progress update
- `completedStepNumbers` - Array of completed step numbers

## Usage Examples

### Check project status

Ask your AI: "What Landfall project am I in?"

The AI will call `landfall_get_project_info` and tell you about your project.

### Start building

Ask: "What's the first step to build my Landfall project?"

The AI will call `landfall_get_next_prompt` and show you the first task.

### Execute and continue

Ask: "Execute the next Landfall build step"

The AI will:
1. Get the next prompt
2. Implement it
3. Call `landfall_mark_complete`
4. Move to the next step

### Build everything

Ask: "Build my entire Landfall project"

The AI will iterate through all prompts until complete.

## Local Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Link locally for testing
npm link

# Run in development mode
npm run dev
```

## Progress Tracking

Progress is stored in `landfall/prompts/.progress.json` in your project directory. This file persists across sessions, so you can resume interrupted builds.

## Requirements

- Node.js 18+
- A Landfall project with generated build prompts (`landfall/prompts/build-sequence.json`)
