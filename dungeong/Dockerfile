# syntax=docker/dockerfile:1
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /src
COPY . .
RUN sh ./gradlew --no-daemon bootJar

FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app
COPY --from=build /src/build/libs/*.jar app.jar

USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
