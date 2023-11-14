# BUILDER
FROM node:lts-alpine as builder
WORKDIR /app
COPY . .
RUN yarn --frozen-lockfile

# DEVELOPMENT
FROM builder as development
ENV NODE_ENV=development
CMD [""]

# PRODUCTION BUILD
FROM builder as production-build
RUN yarn build

# PRODUCTION
FROM node:lts-alpine as production
ENV NODE_ENV=production
COPY --chown=node:node --from=production-build /app/dist /app/dist
COPY --chown=node:node --from=production-build /app/node_modules /app/node_modules
COPY --chown=node:node --from=production-build /app/.env /app/.env

WORKDIR /app
ENTRYPOINT [ "node", "dist/main.js" ]
CMD ["yarn", "migration:run"]

USER node
