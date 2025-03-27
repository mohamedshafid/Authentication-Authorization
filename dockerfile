# Use the official image as a parent image
FROM node:18

# working directory in the container
WORKDIR /app

COPY package*.json ./

# install the dependencies
RUN npm install

# copying all the files to the container
COPY . .

# expose the port
EXPOSE 3000


# Run the app
CMD ["node", "index.js"]


