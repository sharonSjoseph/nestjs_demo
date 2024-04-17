FROM node:14
WORKDIR /usr/src/app
COPY /dist .
COPY .env .
COPY package.json .
RUN npm install
RUN npm install --save-dev @babel/core
EXPOSE 80
CMD ["node","main.js"]