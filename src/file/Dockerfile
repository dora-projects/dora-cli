FROM nginx:stable-alpine AS final

COPY ${dir} /usr/share/nginx/html
COPY ${confPath} /etc/nginx/conf.d/default.conf
EXPOSE ${port}

CMD ["nginx", "-g", "daemon off;"]
