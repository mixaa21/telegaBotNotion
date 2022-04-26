FROM node:12

WORKDIR /app
COPY ./package.json ./package-lock.json* /app/
RUN npm i
COPY ./ /app
CMD node index.js
