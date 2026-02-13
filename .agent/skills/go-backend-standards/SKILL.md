---
name: Go Backend Standards & Best Practices
description: Comprehensive guide for building robust, maintainable Go backend services with modern patterns and clean architecture
---

# Go Backend Standards & Best Practices

This skill provides expert guidance on Go backend development, covering project structure, error handling, API design, clean architecture, testing, and security best practices for 2024-2025.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Error Handling](#error-handling)
3. [API Design](#api-design)
4. [Clean Architecture](#clean-architecture)
5. [Database Patterns](#database-patterns)
6. [Testing](#testing)
7. [Security](#security)
8. [Performance & Observability](#performance--observability)

## Project Structure

### Directory Layout

Follow the community-accepted `golang-standards/project-layout` pattern, but adopt only what's necessary:

```
project/
├── cmd/                    # Main applications
│   ├── api/
│   │   └── main.go        # Minimal: dependency wiring, config, startup
│   └── worker/
│       └── main.go
├── internal/              # Private application code (compiler-enforced)
│   ├── api/              # HTTP handlers, middleware
│   ├── app/              # Business logic, use cases
│   ├── repository/       # Data access layer
│   └── models/           # Domain entities
├── pkg/                   # Public library code (if needed)
└── config/               # Configuration files
```

### Key Principles

- **Start Simple**: Begin with flat structure or single `main.go`, refactor as needed
- **Avoid Over-nesting**: Prefer `internal/user/handler.go` over `internal/services/user/handlers/http/v1/`
- **Descriptive Names**: Use specific names like `validator`, `auth`, `cache` instead of `utils`, `helpers`, `common`
- **Separation of Concerns**: Keep business logic separate from data access and API layers

## Error Handling

### Core Principles

Go's explicit error handling is a feature, not a bug. Embrace it:

```go
// ✅ GOOD: Check errors immediately
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doing something: %w", err)
}

// ❌ BAD: Ignoring errors
result, _ := doSomething()
```

### Error Wrapping (Go 1.13+)

Add context while preserving the error chain:

```go
func processUser(id string) error {
    user, err := repo.FindUser(id)
    if err != nil {
        // Wrap with context using %w
        return fmt.Errorf("finding user %s: %w", id, err)
    }

    if err := validate(user); err != nil {
        return fmt.Errorf("validating user: %w", err)
    }

    return nil
}
```

### Custom Error Types

Create structured errors for better handling:

```go
type ValidationError struct {
    Field string
    Value interface{}
    Msg   string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed for %s: %s", e.Field, e.Msg)
}

// Usage with errors.As
var valErr *ValidationError
if errors.As(err, &valErr) {
    // Handle validation error specifically
    log.Printf("Field %s failed validation", valErr.Field)
}
```

### Sentinel Errors

Define reusable error constants:

```go
var (
    ErrNotFound     = errors.New("resource not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrInvalidInput = errors.New("invalid input")
)

// Check with errors.Is
if errors.Is(err, ErrNotFound) {
    return http.StatusNotFound
}
```

### Best Practices

- **Return errors, don't panic**: Reserve `panic` for truly unrecoverable situations
- **Wrap for context**: Use `%w` to build error chains
- **Log strategically**: Log at the top of the call stack after context is added
- **Never log and return**: Either handle (log) or return, not both
- **Use defer for cleanup**: Ensure resources are released regardless of errors

```go
func processFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return fmt.Errorf("opening file: %w", err)
    }
    defer f.Close() // Guaranteed cleanup

    // Process file...
    return nil
}
```

## API Design

### RESTful API Best Practices

#### Resource-Oriented Paths

```go
// ✅ GOOD: Resource-based, actions via HTTP methods
GET    /users           // List users
POST   /users           // Create user
GET    /users/:id       // Get user
PUT    /users/:id       // Update user
DELETE /users/:id       // Delete user

// ❌ BAD: Verb-based paths
GET /getUsers
POST /createUser
```

#### HTTP Status Codes

Use appropriate status codes:

```go
func createUser(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest) // 400
        return
    }

    if err := validateUser(user); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest) // 400
        return
    }

    if err := db.Create(&user); err != nil {
        if errors.Is(err, ErrDuplicate) {
            http.Error(w, "User exists", http.StatusConflict) // 409
            return
        }
        http.Error(w, "Server error", http.StatusInternalServerError) // 500
        return
    }

    w.WriteHeader(http.StatusCreated) // 201
    json.NewEncoder(w).Encode(user)
}
```

#### Custom Error Response Structure

```go
type ErrorResponse struct {
    Error   string            `json:"error"`
    Message string            `json:"message"`
    Details map[string]string `json:"details,omitempty"`
}

func writeError(w http.ResponseWriter, code int, msg string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(ErrorResponse{
        Error:   http.StatusText(code),
        Message: msg,
    })
}
```

### GraphQL API Best Practices

#### Schema-First Design

1. Define schema using SDL before writing code
2. Use `gqlgen` to generate type-safe Go code
3. Organize `.graphqls` files by domain

```graphql
# user.graphqls
type User {
  id: ID!
  email: String!
  name: String!
  posts: [Post!]!
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
```

#### Resolver Best Practices

```go
func (r *queryResolver) User(ctx context.Context, id string) (*model.User, error) {
    // Use dataloaders to prevent N+1 queries
    user, err := dataloaders.GetLoader(ctx).UserByID.Load(id)
    if err != nil {
        return nil, fmt.Errorf("loading user: %w", err)
    }
    return user, nil
}
```

#### Security

- Implement authentication at resolver/middleware level
- Enforce query depth and complexity limits
- Validate all inputs thoroughly

### Middleware Pattern

```go
type Middleware func(http.Handler) http.Handler

// Logging middleware
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

// Chain middlewares
mux := http.NewServeMux()
handler := LoggingMiddleware(AuthMiddleware(RateLimitMiddleware(mux)))
```

## Clean Architecture

### Layered Structure

Organize code by responsibility following the Dependency Rule (dependencies point inward):

```
internal/
├── domain/           # Core business entities (innermost)
│   ├── user.go
│   └── product.go
├── usecase/          # Application business logic
│   ├── user_service.go
│   └── interfaces.go
├── repository/       # Data access interfaces
│   └── user_repo.go
└── infrastructure/   # External implementations (outermost)
    ├── database/
    │   └── postgres_user_repo.go
    ├── http/
    │   └── user_handler.go
    └── config/
```

### Dependency Inversion

Define interfaces where they're consumed:

```go
// domain/user.go
package domain

type User struct {
    ID    string
    Email string
    Name  string
}

// usecase/user_service.go
package usecase

import "myapp/internal/domain"

// Interface defined in use case layer
type UserRepository interface {
    FindByID(id string) (*domain.User, error)
    Create(user *domain.User) error
}

type UserService struct {
    repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}

func (s *UserService) GetUser(id string) (*domain.User, error) {
    return s.repo.FindByID(id)
}

// infrastructure/database/postgres_user_repo.go
package database

import (
    "myapp/internal/domain"
    "myapp/internal/usecase"
)

// Concrete implementation
type PostgresUserRepo struct {
    db *sql.DB
}

// Ensure it implements the interface
var _ usecase.UserRepository = (*PostgresUserRepo)(nil)

func (r *PostgresUserRepo) FindByID(id string) (*domain.User, error) {
    // Database implementation
}
```

### Dependency Injection

Wire dependencies in `main.go`:

```go
func main() {
    db := setupDatabase()

    // Infrastructure
    userRepo := database.NewPostgresUserRepo(db)

    // Use cases
    userService := usecase.NewUserService(userRepo)

    // Handlers
    userHandler := http.NewUserHandler(userService)

    // Start server
    mux := http.NewServeMux()
    mux.HandleFunc("/users", userHandler.HandleUsers)
    http.ListenAndServe(":8080", mux)
}
```

### Benefits

- **Testability**: Easy to mock dependencies
- **Independence**: Core logic independent of frameworks/databases
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to swap implementations

## Database Patterns

### Repository Pattern

Abstract data access with interfaces:

```go
type UserRepository interface {
    FindByID(ctx context.Context, id string) (*User, error)
    FindAll(ctx context.Context, filters UserFilter) ([]*User, error)
    Create(ctx context.Context, user *User) error
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
}

// Concrete implementation with GORM
type GormUserRepository struct {
    db *gorm.DB
}

func (r *GormUserRepository) FindByID(ctx context.Context, id string) (*User, error) {
    var user User
    if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, ErrNotFound
        }
        return nil, fmt.Errorf("finding user: %w", err)
    }
    return &user, nil
}
```

### GORM vs SQLX vs SQLC

**Use GORM when:**

- Rapid development needed
- Complex relationships and associations
- Auto-migrations beneficial
- Performance overhead acceptable

**Use SQLX when:**

- Need more control over SQL
- Performance critical
- Want minimal abstraction over `database/sql`
- Prefer writing SQL directly

**Use SQLC when:**

- Want type-safe generated code from SQL
- Best of both worlds: SQL control + Go type safety
- No runtime overhead
- Compile-time query validation

Example SQLC workflow:

```sql
-- queries/users.sql
-- name: GetUser :one
SELECT * FROM users WHERE id = $1;

-- name: CreateUser :one
INSERT INTO users (email, name)
VALUES ($1, $2)
RETURNING *;
```

```go
// Generated by sqlc
user, err := queries.GetUser(ctx, userID)
```

### Transaction Handling

```go
func (r *GormUserRepository) CreateWithProfile(ctx context.Context, user *User, profile *Profile) error {
    return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(user).Error; err != nil {
            return fmt.Errorf("creating user: %w", err)
        }

        profile.UserID = user.ID
        if err := tx.Create(profile).Error; err != nil {
            return fmt.Errorf("creating profile: %w", err)
        }

        return nil
    })
}
```

## Testing

### Unit Tests

Test business logic in isolation:

```go
func TestUserService_GetUser(t *testing.T) {
    // Mock repository
    mockRepo := &MockUserRepository{
        FindByIDFunc: func(id string) (*User, error) {
            return &User{ID: id, Email: "test@example.com"}, nil
        },
    }

    service := NewUserService(mockRepo)

    user, err := service.GetUser("123")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }

    if user.ID != "123" {
        t.Errorf("expected ID 123, got %s", user.ID)
    }
}
```

### Integration Tests

Test with real database (use testcontainers):

```go
func TestUserRepository_Integration(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping integration test")
    }

    db := setupTestDB(t)
    defer teardownTestDB(t, db)

    repo := NewGormUserRepository(db)

    user := &User{Email: "test@example.com", Name: "Test"}
    err := repo.Create(context.Background(), user)
    if err != nil {
        t.Fatalf("failed to create user: %v", err)
    }

    found, err := repo.FindByID(context.Background(), user.ID)
    if err != nil {
        t.Fatalf("failed to find user: %v", err)
    }

    if found.Email != user.Email {
        t.Errorf("expected %s, got %s", user.Email, found.Email)
    }
}
```

### Table-Driven Tests

```go
func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {"valid email", "user@example.com", false},
        {"missing @", "userexample.com", true},
        {"empty", "", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateEmail() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

## Security

### Authentication

#### JWT Best Practices

```go
func GenerateJWT(userID string) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(24 * time.Hour).Unix(),
        "iat":     time.Now().Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func ValidateJWT(tokenString string) (*jwt.Token, error) {
    return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return []byte(os.Getenv("JWT_SECRET")), nil
    })
}
```

#### Password Hashing

```go
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}

func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

### Input Validation

```go
import "github.com/go-playground/validator/v10"

type CreateUserRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=8"`
    Name     string `json:"name" validate:"required,min=2,max=100"`
}

var validate = validator.New()

func validateRequest(req *CreateUserRequest) error {
    if err := validate.Struct(req); err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }
    return nil
}
```

### Rate Limiting

```go
import "golang.org/x/time/rate"

type RateLimiter struct {
    limiters map[string]*rate.Limiter
    mu       sync.RWMutex
    rate     rate.Limit
    burst    int
}

func (l *RateLimiter) Allow(key string) bool {
    l.mu.Lock()
    defer l.mu.Unlock()

    limiter, exists := l.limiters[key]
    if !exists {
        limiter = rate.NewLimiter(l.rate, l.burst)
        l.limiters[key] = limiter
    }

    return limiter.Allow()
}
```

### HTTPS/TLS

Always use TLS in production:

```go
func main() {
    mux := http.NewServeMux()
    // ... setup routes

    certFile := os.Getenv("TLS_CERT")
    keyFile := os.Getenv("TLS_KEY")

    log.Fatal(http.ListenAndServeTLS(":443", certFile, keyFile, mux))
}
```

## Performance & Observability

### Structured Logging

```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("user created",
    zap.String("user_id", user.ID),
    zap.String("email", user.Email),
    zap.Duration("elapsed", time.Since(start)),
)
```

### Metrics with Prometheus

```go
import "github.com/prometheus/client_golang/prometheus"

var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )

    httpDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request latencies in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint"},
    )
)

func init() {
    prometheus.MustRegister(httpRequestsTotal, httpDuration)
}
```

### Connection Pooling

```go
func setupDatabase() *sql.DB {
    db, err := sql.Open("postgres", connString)
    if err != nil {
        log.Fatal(err)
    }

    // Set connection pool settings
    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(5 * time.Minute)

    return db
}
```

### Caching

```go
import "github.com/go-redis/redis/v8"

type CacheService struct {
    client *redis.Client
    ttl    time.Duration
}

func (c *CacheService) Get(ctx context.Context, key string) (string, error) {
    val, err := c.client.Get(ctx, key).Result()
    if err == redis.Nil {
        return "", ErrNotFound
    }
    return val, err
}

func (c *CacheService) Set(ctx context.Context, key, value string) error {
    return c.client.Set(ctx, key, value, c.ttl).Err()
}
```

### Context for Timeouts

```go
func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    // Set timeout for this operation
    ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    defer cancel()

    return s.repo.FindByID(ctx, id)
}
```

## Configuration Management

### Environment Variables

```go
import "github.com/kelseyhightower/envconfig"

type Config struct {
    DatabaseURL  string `envconfig:"DATABASE_URL" required:"true"`
    Port         int    `envconfig:"PORT" default:"8080"`
    JWTSecret    string `envconfig:"JWT_SECRET" required:"true"`
    LogLevel     string `envconfig:"LOG_LEVEL" default:"info"`
}

func LoadConfig() (*Config, error) {
    var cfg Config
    if err := envconfig.Process("", &cfg); err != nil {
        return nil, fmt.Errorf("loading config: %w", err)
    }
    return &cfg, nil
}
```

## Quick Reference

### Project Checklist

- [ ] Use Go modules for dependency management
- [ ] Follow standard project layout
- [ ] Implement proper error handling with wrapping
- [ ] Use interfaces for dependency inversion
- [ ] Write comprehensive tests (unit + integration)
- [ ] Implement structured logging
- [ ] Add metrics and monitoring
- [ ] Secure all endpoints (HTTPS, auth, rate limiting)
- [ ] Validate all inputs
- [ ] Use connection pooling for databases
- [ ] Implement graceful shutdown
- [ ] Document API with OpenAPI/Swagger (REST) or SDL (GraphQL)

### Common Patterns

```go
// Context propagation
func handler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    result, err := service.DoWork(ctx)
    // ...
}

// Graceful shutdown
func main() {
    srv := &http.Server{Addr: ":8080"}

    go func() {
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal(err)
    }
}
```

## Resources

- [Effective Go](https://go.dev/doc/effective_go)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Clean Architecture in Go](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Go Vulnerability Database](https://pkg.go.dev/vuln)
