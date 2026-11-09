# syntax=docker/dockerfile:1

# ---------- Build: React app + Spring Boot jar ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace

# Cache Maven dependencies separately from source changes.
COPY backend/.mvn backend/.mvn
COPY backend/mvnw backend/pom.xml backend/
RUN chmod +x backend/mvnw && cd backend && ./mvnw -B -q -DskipFrontend dependency:go-offline

COPY frontend frontend
COPY backend/src backend/src
# Tests need a database; they run in CI instead.
RUN cd backend && ./mvnw -B -DskipTests package

# ---------- Runtime: small JRE image, non-root ----------
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /workspace/backend/target/dsa-master.jar app.jar
USER app

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health/readiness || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
