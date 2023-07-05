# For Debug only
# docker build -f runtime.dockerfile -t dionysbiz/reactethshop:`date '+%Y%m%d%H%M%S'`-dev
FROM node:alpine
COPY ["./build.tar.gz", "/root/app/build.tar.gz"]
COPY ["./package.json", "/root/app/package.json"]
COPY --chown=root --chmod=775 ["./run_image.sh", "/root/app/run_image.sh"]
EXPOSE 3000
WORKDIR /root/app
CMD ["./run_image.sh"]