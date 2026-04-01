FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN chmod +x gradlew

RUN ./gradlew dependencies --no-daemon

COPY src ./src

RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

RUN addgroup --system spring && adduser --system spring --ingroup spring

ENV TZ=America/Argentina/Buenos_Aires
ENV JAVA_OPTS=""

COPY --from=build /app/build/libs/*.jar app.jar

USER spring:spring
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar"]