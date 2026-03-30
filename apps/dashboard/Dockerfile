FROM    docker.io/oven/bun:1.3.11 AS deps
WORKDIR /app
COPY    package.json tsconfig.base.json tsconfig.json ./
COPY    apps/dashboard/package.json apps/dashboard/package.json
COPY    packages/shared-types/package.json packages/shared-types/package.json
RUN     bun install

FROM    deps AS build
COPY    . .
RUN     bun run --filter @sentinel/dashboard build

FROM    docker.io/oven/bun:1.3.11 AS runner
WORKDIR /app
COPY    --from=build /app /app
EXPOSE  5173
USER    bun
CMD     ["bun", "apps/dashboard/server.ts"]
