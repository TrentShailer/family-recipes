FROM node:18.12.1
WORKDIR /usr/src/app

RUN corepack enable
RUN corepack prepare yarn@stable --activate

# copy code
COPY . .

RUN yarn install --immutable
RUN yarn build

EXPOSE 8080

CMD ["yarn", "start"]
