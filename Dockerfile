# Build ciscc-backend
FROM node:current-alpine AS builder

# Copy the package.json to be
WORKDIR be
COPY ./package.json .
COPY ./yarn.lock .

# Install the dependencies
RUN yarn;

# Copy the remaining stuff to be
COPY . .

# Build it
RUN yarn build;

# Prepare the production image
FROM node:current-alpine

# Copy the necessary components from "builder"
WORKDIR be
COPY --from=builder /be/package.json .
COPY --from=builder /be/yarn.lock .
COPY --from=builder /be/node_modules ./node_modules
COPY --from=builder /be/dist ./dist

# Run it
EXPOSE 3000
CMD ["yarn", "start:prod"]
