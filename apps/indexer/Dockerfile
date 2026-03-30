FROM    docker.io/library/rust:1.94 AS builder
WORKDIR /app
COPY    apps/indexer/Cargo.toml apps/indexer/Cargo.toml
COPY    apps/indexer/src apps/indexer/src
COPY    apps/indexer/tests apps/indexer/tests
RUN     cargo test --manifest-path apps/indexer/Cargo.toml

FROM    docker.io/library/rust:1.94-slim AS runner
WORKDIR /app
COPY    --from=builder /app/apps/indexer/target/debug/frontier-sentinel-indexer /usr/local/bin/frontier-sentinel-indexer
CMD     ["frontier-sentinel-indexer"]
