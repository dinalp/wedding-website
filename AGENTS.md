## Engineering standard

The full team standard is in [https://github.com/dinalp/engineering-standards/blob/main/ENGINEERING.md](https://github.com/dinalp/engineering-standards/blob/main/ENGINEERING.md). Follow that for machines, git, deploys and secrets. A short summary for agents that cannot open GitHub:

- Long Claude Code, Codex and Pi/OpenCode sessions run on the MSI GS65 (`ssh msi`) in named tmux sessions. The MacBook is for review, previews and quick edits.
- Work on feature branches with pull requests. Do not push straight to main unless this repo explicitly allows it.
- Push often so nothing exists only on one machine.
- Auto-deploy to production is ON for this repo: merging to main ships. Confirm with Dinal before destructive database migrations or irreversible production changes.
- Never commit or copy `.env` files between machines. Use `vercel env pull` for a fresh local env.
- Anything that needs sudo, Tailscale, SSH, power or startup changes goes through the IT agent.
