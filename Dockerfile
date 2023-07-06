FROM node:18-alpine

WORKDIR /workdir

ENTRYPOINT ["npm", "run", "dev"]
