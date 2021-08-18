# Dockerfile

FROM node:14
RUN mkdir -p /opt/create-forms-service
WORKDIR /opt/create-forms-service
COPY ./ ./
RUN npm install 
EXPOSE 3000
CMD ["npm", "start"]



