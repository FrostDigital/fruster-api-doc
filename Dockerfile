FROM mhart/alpine-node:12

ARG SOURCE_VERSION=na
ENV SOURCE_VERSION=$SOURCE_VERSION

RUN apk add --update bash && rm -rf /var/cache/apk/*

WORKDIR /app
ADD . .

RUN \
  npm install; \
  npm run-script docker;

EXPOSE 4000

cmd ["node", "dist/server.js"]
