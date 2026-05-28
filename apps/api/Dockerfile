FROM    docker.io/oven/bun:1.3.14 AS deps
WORKDIR /app
COPY    package.json bun.lock tsconfig.base.json tsconfig.json ./
COPY    apps/api/package.json apps/api/package.json
COPY    packages/shared-types/package.json packages/shared-types/package.json
RUN     bun install

FROM    deps AS build
COPY    . .
RUN     bun run --filter @sentinel/api test

FROM    docker.io/oven/bun:1.3.14 AS runner
WORKDIR /app
COPY    --from=build /app /app
ENV     PORT=3001
EXPOSE  3001
USER    bun
CMD     ["bun", "apps/api/src/server.ts"]
