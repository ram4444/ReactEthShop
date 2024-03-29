# For Debug only
# docker build -f runtime.dockerfile -t dionysbiz/postmangengraphql:`date '+%Y%m%d%H%M%S'`-dev
FROM eclipse-temurin:latest
# The git credential has already been copied in the build_image.sh from the homedir to the project folder
# Copy the git credential from the buildenv to the runtime docker to download the latest Logger Copier Code
COPY ["/.git-credentials", "/root/.git-credentials"]
COPY ["/.gitconfig", "/root/.gitconfig"]
COPY ["./build/libs/*.jar", "/root/app/my-application.jar"]
COPY --chown=root --chmod=775 ["./run_image.sh", "/root/app/run_image.sh"]
EXPOSE 8080
WORKDIR /root/app
#CMD ["java", "-server", "-XX:+UnlockExperimentalVMOptions", "-XX:+UseCGroupMemoryLimitForHeap", "-XX:InitialRAMFraction=2", "-XX:MinRAMFraction=2", "-XX:MaxRAMFraction=2", "-XX:+UseG1GC", "-XX:MaxGCPauseMillis=100", "-XX:+UseStringDeduplication", "-jar", "my-application.jar"]
#CMD ["java", "-jar", "my-application.jar"]
CMD ["./run_image.sh"]