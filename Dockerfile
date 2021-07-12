FROM node:10
WORKDIR /rpg

# if package.json changes. Docker deploys auto-update
COPY package.json /rpg
RUN npm install
RUN npm build
COPY . ./rpg

EXPOSE 9999
CMD ["npm", "start"]
