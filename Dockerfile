FROM node:16.18-slim
RUN apt-get update -y && \
    apt-get install -y openssl


# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

# Bundle app source
COPY . .

ARG DATABASE_URL
ARG SESSION_SECRET
ARG CORS_ORIGIN

ENV DATABASE_URL=$DATABASE_URL
ENV SESSION_SECRET=$SESSION_SECRET
ENV CORS_ORIGIN=$CORS_ORIGIN

RUN npm run build

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node