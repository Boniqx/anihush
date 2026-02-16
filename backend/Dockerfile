# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install git for fetch dependencies
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the application
# Disable CGO for static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o anikama-backend ./cmd/api

# Run stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy the binary from builder
COPY --from=builder /app/anikama-backend .

# Copy .env if it exists, but usually provided by environment variables in production
# COPY .env .

# Expose port (default for Gin is 8080)
EXPOSE 8080

CMD ["./anikama-backend"]
