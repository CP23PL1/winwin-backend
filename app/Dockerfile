FROM node:lts-alpine AS build
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build 
CMD ["yarn", "start:prod"]
