# Dockerfile

FROM node:14
RUN mkdir -p /opt/google-sheets-service
WORKDIR /opt/google-sheets-service
COPY ./ ./
RUN npm install 
CMD ["npm", "start"]