FROM node:18.12.1
WORKDIR /usr/src/app

RUN corepack enable
RUN corepack prepare yarn@stable --activate

# copy code
COPY . .

RUN yarn install

# RUN yarn build

# RUN mkdir packages/backend/build/frontend
# RUN mv packages/frontend/dist/* packages/backend/build/frontend

EXPOSE 8080

CMD ["yarn", "start"]
