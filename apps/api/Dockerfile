FROM node:18-alpine

WORKDIR /usr/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/*/package.json packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/api && pnpm db:generate

# Build the application
RUN pnpm build --filter=@matrus/api

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]