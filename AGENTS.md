# Repo Instructions

- Use `pnpm` for package installation, scripts, and dependency management in this project.
- Keep `docs/project-plan.md` as the top-level source of truth for current project direction, agreed decisions, roadmap, and open questions.
- Use linked supporting docs for deeper detail:
  `docs/domain-model.md` for domain modeling,
  `docs/decision-log.md` for dated decision history,
  and `docs/backlog.md` for parked ideas and future work.
- Use `init.md` only for high-level project context, not for evolving architecture decisions.
- Prefer clear local imports over inline `typeof import("...")` type expressions when both options are equivalent.
- When explaining technical choices, emphasize why they are structured that way and how a learner could reason toward the same conclusion themselves.
- Keep explanations short: give the gist first, use at most one or two examples, and avoid over-explaining beyond the user's actual question.
