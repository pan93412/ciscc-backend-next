FROM node:current-alpine

# Copy this workdir to the docker image
COPY . be
WORKDIR be

# Install the dependencies
RUN yarn;

# Run it
EXPOSE 3000
CMD ["yarn", "start"]