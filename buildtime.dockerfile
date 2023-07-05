# To run this dockerfile for build:
# DOCKER_BUILDKIT=1 docker build -f buildtime.dockerfile -t myarchbuildenv:reactethshopdev . && docker run --privileged myarchbuildenv:reactethshopdev 
FROM myarchbuildenv:latest
#ARG WORKSPACE_ID
#ENV WORKSPACE_ID ${WORKSPACE_ID}
#ENV JAVA_HOME /usr/lib/jvm/default
#ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.cargo/bin
#RUN export JAVA_HOME
#RUN export PATH
COPY --chown=root --chmod=775 ["./build_image.sh", "/root/workingDir/build_image.sh"]
COPY --chown=root --chmod=775 ["./runtime.dockerfile", "/root/workingDir/runtime.dockerfile"]
COPY --chown=root --chmod=775 ["./run_image.sh", "/root/workingDir/run_image.sh"]
# When using Docker run, the below command will be executed in the WORKDIR
WORKDIR /root/workingDir
#CMD ./build_image.sh