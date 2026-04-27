# Improvement Plan

## High Priority — Correctness & Runtime Safety

### H-1. Upgrade stale dependencies
- Upgrade `typescript` `^3.7.3` → `5.x`
- Upgrade `redis` `^2.8.0` → `4.x` (v2 is EOL; v4 has native async/await)
- Upgrade `@types/node` `^12` → `22.x`
- Remove `readline` from `package.json` — it is a Node.js built-in, not an npm package

### H-2. Enable TypeScript strict mode
- Add `"strict": true` to `tsconfig.json` `compilerOptions`
- Move `outDir: "bin"` from the `npm start` CLI flag into `tsconfig.json` so the config is self-contained

### H-3. Rewrite `DbClient` for redis v4 and fix the singleton
- Remove the `util.promisify` shim — redis v4 methods return `Promise` natively
- Replace `client: any` and `getAsync: any` with properly typed members
- Fix the singleton: `return instance` inside a constructor is unsound TypeScript. Replace with a module-level export function or use dependency injection (pass one `DbClient` instance into `Task` via constructor)

### H-4. Guard `argc[2]` accesses in `taskExecutor`
- `task add` with no argument throws `TypeError: Cannot read properties of undefined` because `argc[2]` is accessed without a bounds check
- Add presence checks before accessing `argc[2]` in the `ADD`, `CHECK`, and `DELETE` branches

### H-5. Fix implicit-`undefined` return in validators
- `isValidArgument`, `isValidTaskArgument`, and `isValidNumber` implicitly return `undefined` on failure instead of `false`
- Annotate each with `: boolean` return type and replace each implicit return with `return false`

---

## Medium Priority — Design & Type Correctness

### M-1. Replace stateful setter pattern on solver classes
- All four solvers (`FizzBuzz`, `LeapYear`, `PrimeNumber`, `StairCase`) use a mutable `set num()` setter before calling the getter, making them stateful and error-prone
- Replace with direct method arguments: `getFizzBuzz(n: number)`, `getLeapYear(year: number)`, etc.
- Remove the private `_num` field and `set num()` setters from each class
- Remove the empty `constructor() {}` bodies

### M-2. Fix hardcoded Redis key and missing types in `task.ts`
- `add()` on line 17 hardcodes the string `'Task'` — change to `DbKey.TASK` (already imported)
- Add parameter types to `check(task)` and `del(task)`: both should be `(taskNumber: number): Promise<void>`
- Add a `TaskItem` interface `{ task: string; completed: boolean }` and use it in place of `any[]`

### M-3. Remove dead code
- Delete `src/task-jason-write.ts` — it is not imported anywhere and also imports `DbClient` without using it
- Remove `Main._dbClient` in `main.ts` — it is instantiated but never accessed (`Task` manages its own connection)

### M-4. Fix confused command routing in `taskExecutor`
- `taskExecutor` handles `CommandType.HELP` and `CommandType.EXIT` as `task` sub-commands
- `task exit` silently terminates the process — this is a bug
- Remove these two cases from `taskExecutor`; let unknown sub-commands fall to the `default` error message

### M-5. Fix typo and double-print bug in `StairCase.generateStairs`
- `let staris = []` — rename to `stairs`
- `console.log(...)` inside `generateStairs` causes every staircase 3.5 row to print twice (once during generation, once during the caller's iteration loop)
- Remove the `console.log` from `generateStairs`

### M-6. Extract ANSI escape codes into constants
- 21 raw `\x1b[...m` strings are scattered across `command-argument.ts`, `task.ts`, and `main.ts`
- Create `src/colors.ts` with named exports (`Colors.red`, `Colors.green`, etc.)
- Replace all inline escape strings with the named constants

---

## Low Priority — Tooling & Developer Experience

### L-1. Add ESLint with TypeScript support
- Install `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
- Add `.eslintrc.json` extending `plugin:@typescript-eslint/recommended`
- Add `"lint": "eslint src/**/*.ts"` script to `package.json`
- Do this after H-2/H-5 are done to avoid fighting a large initial violation count

### L-2. Add Jest + ts-jest for unit testing
- Install `jest`, `ts-jest`, `@types/jest`
- Add `jest.config.js` with `preset: 'ts-jest'`
- Add `"test": "jest"` script to `package.json`
- Write tests for the four solver classes — after M-1 they are pure functions with no dependencies
- Defer `Task` and `DbClient` tests to a second pass (requires Redis mock)

### L-3. Add `clean` and `build` scripts
- Add `"clean": "rm -rf bin"`, `"build": "tsc"`, `"prebuild": "npm run clean"` to `package.json`
- Update `"start"` to `"npm run build && TypeScript-Assignment"`
- Without a clean step, deleted source files leave stale `.js` files in `bin/` that are still executed

### L-4. Update README
- Replace dead redis Windows download link with current installation instructions
- Document the `npm link` step (currently missing)
- Add Node.js version requirement (Node 22 LTS recommended)
- Fix CLI example code blocks (language hint should be `bash`, not `javascript`)

---

## Recommended Execution Order

```
H-2  →  H-4, H-5        strict mode first; it surfaces what H-4/H-5 fix
H-1  →  H-3  →  M-2     upgrade deps, rewrite DbClient, then update Task
M-1  →  L-2              stateless solvers unlock clean unit tests
M-3, M-4, M-5            independent; do any time
M-6  (after M-3)         avoid touching the deleted file
L-1  (after H-2, H-5)    less lint noise to fight through
L-3, L-4                 last
```

## Summary

| ID  | Item                                              | Priority | Effort  |
|-----|---------------------------------------------------|----------|---------|
| H-1 | Upgrade deps; remove `readline` npm package       | High     | Small   |
| H-2 | Enable `strict`; move `outDir` to tsconfig        | High     | Small   |
| H-3 | Rewrite `DbClient` for redis v4, fix singleton    | High     | Medium  |
| H-4 | Guard `argc[2]` accesses in `taskExecutor`        | High     | Small   |
| H-5 | Fix implicit-`undefined` validators → `: boolean` | High     | Trivial |
| M-1 | Stateless solver methods, remove empty ctors      | Medium   | Small   |
| M-2 | Fix hardcoded `'Task'` key, type `check`/`del`    | Medium   | Small   |
| M-3 | Delete dead code (`task-jason-write.ts`, `_dbClient`) | Medium | Trivial |
| M-4 | Remove `help`/`exit` from `taskExecutor` routing  | Medium   | Small   |
| M-5 | Fix `staris` typo and double-print in staircase   | Medium   | Trivial |
| M-6 | Extract ANSI codes to `src/colors.ts`             | Medium   | Small   |
| L-1 | Add ESLint + `@typescript-eslint`                 | Low      | Small   |
| L-2 | Add Jest + ts-jest, test pure solvers             | Low      | Medium  |
| L-3 | Add `clean`/`build`/`prebuild` scripts            | Low      | Trivial |
| L-4 | Update README                                     | Low      | Trivial |
