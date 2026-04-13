FROM    docker.io/oven/bun:1.3.12 AS deps
WORKDIR /app
COPY    package.json bun.lock tsconfig.base.json tsconfig.json ./
COPY    apps/dashboard/package.json apps/dashboard/package.json
COPY    packages/shared-types/package.json packages/shared-types/package.json
RUN     bun install

FROM    deps AS build
ARG     SENTINEL_BUILD_COMMIT
ARG     SENTINEL_BUILD_DIRTY
ARG     SENTINEL_BUILD_REPOSITORY_URL
ARG     SENTINEL_BUILD_RELEASE_TAG
ENV     SENTINEL_BUILD_COMMIT=${SENTINEL_BUILD_COMMIT}
ENV     SENTINEL_BUILD_DIRTY=${SENTINEL_BUILD_DIRTY}
ENV     SENTINEL_BUILD_REPOSITORY_URL=${SENTINEL_BUILD_REPOSITORY_URL}
ENV     SENTINEL_BUILD_RELEASE_TAG=${SENTINEL_BUILD_RELEASE_TAG}
COPY    . .
RUN     bun run --filter @sentinel/dashboard build

FROM    docker.io/oven/bun:1.3.12 AS runner
WORKDIR /app
COPY    --from=build /app /app
EXPOSE  5173
USER    bun
CMD     ["bun", "apps/dashboard/server.ts"]
