FROM mhart/alpine-node:7

RUN apk add --update bash git && rm -rf /var/cache/apk/*

WORKDIR /app
ADD . .

RUN \
  npm install; \
  npm run-script docker;

EXPOSE 4000
cmd ["cd dist", "node", "server.js"]