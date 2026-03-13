---
name: lovable_architect
description: Specialized knowledge for Lovable.dev native apps, bidirectional GitHub sync, and MCP integration.
triggers: ["lovable", "supabase", "database", "components", "mcp"]
---
# Lovable Architect Skill (v24.0)
1. **Frontend is OPEN:** You have full write access to `src/*`, `docs/*`, `tailwind.config.ts`, and `vite.config.ts`. Changes here sync to Lovable automatically.
2. **Forbidden Zones:** You NEVER edit `src/integrations/supabase/*`, `.env`, or `supabase/config.toml`. These are auto-generated and managed by Lovable Cloud.
3. **Dead Drop Database:** You DO NOT run `supabase db push`. You write timestamped SQL files to `supabase/migrations/` and ask the user to apply them via the Lovable UI.
4. **MCP Awareness:** If `lovable-mcp-server` is connected, use tools like `analyze_project`, `get_components`, and `analyze_database_schema` before planning structural changes.
