## Stack

- NestJS on TypeScript ESM (`"type": "module"`, `"module": "nodenext"`).
- TypeORM + PostgreSQL (with the `citext` extension for case-insensitive strings).
- `@nestjs/config` for configuration, Multer for file uploads.
- Vitest for tests, oxlint for linting.
- Dependency versions in `package.json` are pinned exact (no `^`/`~`), in both
  `dependencies` and `devDependencies`. When adding a package, install the latest
  version, then strip the caret (e.g. `"@nestjs/jwt": "12.0.2"`).

## Commands

```
npm run start:dev    # start in watch mode
npm run build        # production build
npm run test         # vitest
npm run lint         # oxlint
npx tsc --noEmit     # typecheck
```

Run typecheck, lint, test and build with 0 errors before considering any change done.

## Guardrails

- Do not run `git` commands (add, commit, push, ...) unless explicitly asked.
- Do not edit `README.md` unless asked.
- Keep the modules/files from the original base code (e.g. `TodosModule`) working.

## Project structure

```
src/
  config/       configuration.ts (config factory: read, validate, cast env values)
  database/     entities, seeds, SQL schema, and the offline fallback module/controller
  features/     one folder per REST domain module: auth/, users/, snippets/, tags/, ...
```

- All business REST modules go under `src/features/`.
- All database-related code goes under `src/database/`, including the offline fallback.
  Don't leave controllers/modules for offline mode scattered elsewhere.

## Configuration rules

- Use `@nestjs/config` with the custom factory in `src/config/configuration.ts`.
- Env files: `.env.development` (local) and `.env.production`. `ConfigModule` loads:
  ```ts
  envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env']
  ```
- Never read `process.env` directly in controllers/services — inject `ConfigService`.
- **Offline mode**: `DB_ENABLED=false` must let the app boot without connecting to
  PostgreSQL. Load `DatabaseModule` / `OfflineDatabaseModule` via
  `ConditionalModule.registerWhen(...)`; the offline module reports the DB is unavailable
  for DB-backed endpoints.

## TypeORM / ESM rules

- Avoid circular imports in entities: for bidirectional relations use type-only imports
  with `Relation<T>`, and reference entities by string name in decorators.
  ```ts
  import type { User } from '...'

  @ManyToOne('User', 'snippets', { onDelete: 'CASCADE' })
  user!: Relation<User>;
  ```
- Use `citext` for case-insensitive string columns (`email`, `username`).

## Avatar upload

- Use Multer `FileInterceptor` with disk storage, saving to `public/avatars/`.
- Generate a random UUID file name with a `.webp` (or equivalent) extension.
- When a user uploads a new avatar, delete the old file from disk.
