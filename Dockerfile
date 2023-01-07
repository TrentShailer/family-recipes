FROM node:18.12.1
WORKDIR /usr/src/app

RUN corepack enable
RUN corepack prepare yarn@stable --activate

# copy code
COPY . .

RUN yarn install --immutable --immutable-cache
# this is just a quick way to get the argon2 binary built with linux bindings
RUN cd packages/backend && yarn remove argon2 && yarn add argon2@0.30.2
RUN yarn build

EXPOSE 8080

CMD ["yarn", "start"]
