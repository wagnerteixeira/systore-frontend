FROM node:alpine as build
#RUN curl -o- -L https://yarnpkg.com/install.sh | /bin/bash -s -- --version 1.21.1
WORKDIR /app
ENV REACT_APP_PUBLIC_URL=
ENV REACT_APP_API_PATH=/api
ENV REACT_APP_OAPI_PATH=/oapi
COPY ./src/src /app/src
COPY ./src/public /app/public
COPY ./src/package.json /app/package.json
RUN yarn install 
RUN yarn build
RUN rm -rf /app/build/**/*.map

# production environment
FROM nginx:1.16.0-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]