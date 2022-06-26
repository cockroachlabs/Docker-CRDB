FROM node:17.7


WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .

CMD ["node", "."]
