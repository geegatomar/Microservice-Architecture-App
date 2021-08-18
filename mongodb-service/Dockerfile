# Dockerfile

FROM node:14
RUN mkdir -p /opt/mongodb-service
WORKDIR /opt/mongodb-service
COPY ./ ./
RUN npm install 
EXPOSE 3002
CMD ["npm", "start"]