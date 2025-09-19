FROM node:18-alpine

WORKDIR /usr/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/*/package.json packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build --filter=@matrus/web

EXPOSE 3000

CMD ["pnpm", "start", "--filter=@matrus/web"]