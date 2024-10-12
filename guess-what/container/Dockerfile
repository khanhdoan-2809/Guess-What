# ./container/Dockerfile

# if on Apple M chips, use the platform prefix!
# explanation: https://stackoverflow.com/questions/65612411/forcing-docker-to-use-linux-amd64-platform-by-default-on-macos/69636473#69636473
FROM --platform=linux/amd64 node:20

WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy transpiled files
COPY ./build ./build

EXPOSE 80

CMD ["node", "build/index.js"]