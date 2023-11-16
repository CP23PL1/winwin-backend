# BUILD
FROM node:lts-alpine as build
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

# PRODUCTION
FROM node:lts-alpine as production
ENV NODE_ENV=production
COPY --chown=node:node --from=build /app/dist /app/dist
COPY --chown=node:node --from=build /app/node_modules /app/node_modules

WORKDIR /app
ENTRYPOINT [ "node", "dist/main.js" ]

USER node
