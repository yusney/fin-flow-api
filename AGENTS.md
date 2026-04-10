# Code Review Rules

## Language

- All commits MUST be in English
- All PR titles and descriptions MUST be in English
- Code comments MUST be in English

## Commits

- Use Conventional Commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- Keep subject line under 50 characters
- Use imperative mood: "add feature" not "added feature"
- Separate subject from body with blank line
- Wrap body at 72 characters
- Use body to explain WHAT and WHY, not HOW

## Pull Requests

- PR title follows Conventional Commits format
- Include a clear description of changes
- Reference related issues with `Closes #123` or `Fixes #123`
- Keep PRs focused and small when possible
- Include screenshots for UI changes

## TypeScript

- Use `const` and `let`, never `var`
- Prefer interfaces over types for object shapes
- Avoid `any` - use `unknown` if type is truly unknown
- Use strict mode
- Prefer readonly properties when mutation is not needed

## NestJS

- One module per feature/domain
- Use dependency injection properly
- DTOs for all request/response data
- Use class-validator decorators for validation
- Controllers should be thin - business logic in services
- Use proper HTTP status codes

## General

- No commented-out code
- No console.log in production code (use proper logger)
- Functions should do one thing
- Prefer early returns over nested conditionals
- Write self-documenting code - avoid unnecessary comments
