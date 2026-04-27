# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm link           # Create global CLI symlink (run once after install)
npm start          # Compile TypeScript to bin/ and run the program
```

After `npm link`, the CLI is available globally as `TypeScript-Assignment`.

There is no test runner or linter configured in this project.

## Architecture

This is an interactive CLI tool with a command-dispatcher pattern. The entry point is `src/main.ts`, which reads user input via readline and delegates to `CommandArgument`.

**Request flow:**
```
main.ts → CommandArgument → {FizzBuzz, LeapYear, PrimeNumber, StairCase, Task}
```

**Key files:**
- `src/main.ts` — sets up readline loop, parses quoted args with regex, bootstraps `CommandArgument` and `DbClient`
- `src/command-argument.ts` — routes commands to handlers, validates argument counts and types
- `src/enum.ts` — `CommandType` enum (all valid CLI commands) and `DbKey` enum (Redis keys)
- `src/db-client.ts` — singleton Redis wrapper; `getAsync` is promisified via `util.promisify`
- `src/task.ts` — task CRUD backed by Redis; stores JSON array of `{ task: string, completed: boolean }`
- `src/task-jason-write.ts` — unused alternative task implementation using a local `database.json` file (not imported anywhere)

**Problem solvers** (`src/fizz-buzz.ts`, `src/leap-year.ts`, `src/prime-number.ts`, `src/stair-case.ts`) are stateless classes with a single method each.

## Runtime Dependency

Redis must be running locally before starting the app. The `DbClient` singleton connects on construction; connection errors are logged but won't crash the CLI.

## TypeScript Config

- Compiles `src/**/*` to `bin/`
- Target: ES2015, module: CommonJS
- Test files (`**/*.spec.ts`) are excluded from compilation
