FROM    docker.io/library/rust:1.96 AS test
WORKDIR /app
COPY    apps/indexer/Cargo.toml apps/indexer/Cargo.toml
COPY    apps/indexer/Cargo.lock apps/indexer/Cargo.lock
COPY    apps/indexer/src apps/indexer/src
COPY    apps/indexer/tests apps/indexer/tests
RUN     cargo test --locked --manifest-path apps/indexer/Cargo.toml

FROM    docker.io/library/rust:1.96 AS builder
WORKDIR /app
COPY    apps/indexer/Cargo.toml apps/indexer/Cargo.toml
COPY    apps/indexer/Cargo.lock apps/indexer/Cargo.lock
COPY    apps/indexer/src apps/indexer/src
RUN     cargo build --locked --release --manifest-path apps/indexer/Cargo.toml

FROM    docker.io/library/debian:bookworm-slim AS runner
WORKDIR /app
RUN     apt-get update \
        && apt-get install --yes --no-install-recommends ca-certificates \
        && rm -rf /var/lib/apt/lists/*
COPY    --from=builder /app/apps/indexer/target/release/sentinel-indexer /usr/local/bin/sentinel-indexer
CMD     ["sentinel-indexer"]
