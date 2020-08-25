FROM node:12-alpine
LABEL name "DiscordJS Util Bot"
LABEL version "0.0.0"
LABEL maintainer "almostSouji <https://github.com/almostSouji>"
ENV TOKEN=\
	OWNER=\
	PREFIX=\
	GITHUB_API_KEY=\
	PGHOST=\
	PGPORT=\
	PGDATABASE=\
	PGUSER=\
	PGPASSWORD=\
	FORCE_COLOR=1
WORKDIR /usr/djs-utils
COPY package.json ./
RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& npm i \
&& apk del .build-deps
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]