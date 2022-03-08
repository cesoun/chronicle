# STAGE 0: Build (./dist/**)
FROM node:lts

WORKDIR /chronicle

COPY package.json ./
COPY tsconfig.json ./

COPY app.ts ./
COPY src ./src

RUN ls -a
RUN npm i
RUN npm run build

# STAGE 1: Prod & Run
FROM node:lts

WORKDIR /chronicle

COPY bin ./bin
COPY package.json ./
# COPY .env ./

RUN ls -a
RUN npm i --only=prod

COPY --from=0 /chronicle/dist ./dist
RUN npm i pm2 -g

# Determine if we need to expose a port?
EXPOSE 3000

CMD ["pm2-runtime", "bin/www" ]
