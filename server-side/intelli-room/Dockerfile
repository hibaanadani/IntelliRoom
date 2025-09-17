# Dockerfile: # our node base image
FROM node:22

# goes to our app directory (cd in a way)
# app is a dir in our docker image
WORKDIR /app

# We copy package.json first for faster rebuilds
# This is a cool trick called layer caching. If your package.json doesn't change,
# Docker will not re-run `npm install`, which saves a ton of time.
# copy package.json and package-lock
COPY package*.json ./

# Use --omit=dev for smaller images
# install app dependencies (for building we use run)
# This prevents development dependencies (like testing frameworks) from being
# installed in your production image, making it smaller and more secure.
RUN npm install --omit=dev

# copy the code to the image
COPY . .

# expose port
EXPOSE 9000

# run the app (to start the app after building)
CMD ["npm","run","start:prod"]