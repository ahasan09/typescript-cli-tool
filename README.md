# TypeScript CLI Tool

A command-line interface (CLI) application built with TypeScript. Combines a Redis-backed task manager with several algorithm problem solvers — all accessible from a single interactive CLI.

## Features

- **Task Manager** — add, check off, delete, and list tasks (stored in Redis)
- **FizzBuzz** — classic FizzBuzz up to N
- **Leap Year** — check if a given year is a leap year
- **Prime Numbers** — print all primes up to N
- **Staircase** — print a staircase pattern

## Tech Stack

- TypeScript
- Node.js
- Redis (for task persistence)

## Prerequisites

- [Node.js](https://nodejs.org/) v14+
- [Redis](https://redis.io/) running locally

### Installing Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo service redis-server start
```

**Windows:** Download from [redis.io](https://redis.io/download) and run `redis-server.exe`.

## Getting Started

```bash
git clone https://github.com/ahasan09/typescript-cli-tool
cd typescript-cli-tool
npm install
npm link       # registers the CLI globally
npm start      # starts the interactive CLI
```

Once started, type `TypeScript-Assignment` to enter the CLI, or run commands directly.

## Commands

| Command | Description |
|---------|-------------|
| `help` | Show all available commands |
| `task` | List all tasks |
| `task add "your task"` | Add a new task |
| `task check <number>` | Mark a task as done |
| `task del <number>` | Delete a task |
| `fizzbuzz [n]` | Run FizzBuzz up to n (default: 100) |
| `leapyear <year>` | Check if a year is a leap year |
| `prime <n>` | Print all prime numbers up to n |
| `staircase <n>` | Print a staircase of height n |
| `exit` | Exit the CLI |

## Examples

```bash
# Task manager
task add "Need to solve fizzbuzz problem"
task check 1
task del 1
task

# Algorithm solvers
fizzbuzz
fizzbuzz 50
leapyear 2024
prime 20
staircase 5
```

## Project Structure

```
src/
├── main.ts              # CLI entry point and command dispatcher
├── task.ts              # Task model
├── db-client.ts         # Redis client
├── task-jason-write.ts  # Task persistence helpers
├── fizz-buzz.ts         # FizzBuzz implementation
├── leap-year.ts         # Leap year checker
├── prime-number.ts      # Prime number generator
├── stair-case.ts        # Staircase printer
├── command-argument.ts  # CLI argument parsing
└── enum.ts              # Command enumerations
```
