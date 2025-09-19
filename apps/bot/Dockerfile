FROM node:18-alpine

WORKDIR /usr/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY apps/bot/package.json apps/bot/
COPY packages/*/package.json packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build --filter=@matrus/bot

CMD ["node", "apps/bot/dist/index.js"]