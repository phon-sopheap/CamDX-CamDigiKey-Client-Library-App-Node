FROM node:20-alpine AS base
RUN npm install -g pnpm@9

FROM base AS deps
RUN apk add --no-cache git
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS runner
WORKDIR /usr/src/app
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps --chown=app:app /usr/src/app/node_modules ./node_modules
COPY --chown=app:app . .

ENV NODE_ENV=production
EXPOSE 8000

USER app
CMD ["npm", "start"]
