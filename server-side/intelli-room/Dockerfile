# our node base image
FROM node:22

# goes to our app directory (cd in a way)
# app is a dir in our docker image
WORKDIR /app

# copy package.json and package-lock
COPY package*.json ./

# install app dependencies (for building we use run)
RUN npm install

# copy the code to the image
COPY . .

# expose port
EXPOSE 9000

# run the app (to start the app after building)
CMD ["npm","start"]