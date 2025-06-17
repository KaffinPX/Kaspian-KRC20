# Stage 1: Build the application
FROM oven/bun:1 AS builder
WORKDIR /app

# Install unzip for wasm setup script
RUN apt-get update && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY scripts/ ./scripts/
# Only copy lockfile if present
# COPY bun.lockb ./

RUN bun install

COPY . .
RUN bun run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
