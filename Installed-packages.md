# Installed Packages for this Project

```javascript
npm install --save @nestjs/typeorm typeorm pg @nestjs/config @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt helmet express-rate-limit class-validator class-transformer @nestjs/throttler
npm install --save-dev @types/passport-jwt @types/bcrypt
```

# 🟩 Database and Configuration

`@nestjs/typeorm`

- NestJS integration with TypeORM (ORM for TypeScript)
- Enables working with databases using models/entities.

`typeorm`

- Core TypeORM package to define entities and manage DB queries

`pg`

- PostgreSQL driver for Node.js
- Required by TypeORM to connect to PostgreSQL

`@nestjs/config`

- NestJS package for managing environment variables via .env.

# 🟨 Authentication & Authorization

`@nestjs/passport`

- Passport.js integration with NestJS.

- Allows the use of Passport strategies (e.g., JWT, Local, OAuth).

`@nestjs/jwt`

- JWT (JSON Web Token) utility for authentication in NestJS.

- Used to sign/verify tokens and secure API endpoints.

`passport`

- Core Passport.js library.

- Middleware-based authentication framework.

`passport-jwt`
Passport strategy for authenticating with JWT tokens.

`@types/passport-jwt (dev only)`

- TypeScript definitions for passport-jwt.

# 🔐 Password Handling

`bcrypt`

- Hashing library used to secure passwords before storing.

- Also verifies password hashes during login.

`@types/bcrypt (dev only)`

- TypeScript definitions for bcrypt.

# 📏 Validation and Transformation

`class-validator`

- Adds decorators to validate data in DTOs (e.g., @IsEmail(), @Length()).

- Ensures incoming requests are safe and structured.

`class-transformer`

- Transforms plain JavaScript objects into class instances.

- Used with class-validator to validate DTOs automatically.

# 🛡️ Security Headers and Rate Limiting

`helmet`

- Adds secure HTTP headers to prevent well-known vulnerabilities (e.g., XSS, clickjacking).

- A must-have for production-ready Express apps.

`express-rate-limit`

- Middleware for rate-limiting requests (e.g., limit login attempts).

- Helps protect against brute-force attacks.

# ⏱️ Throttling

`@nestjs/throttler`

- NestJS rate-limiting module based on in-memory or Redis stores.

- More Nest-native alternative to express-rate-limit.

- Controls request frequency per IP/route.

## NOTE

"dev only" means the package is installed as a development dependency—that is, with the --save-dev (or -D) flag. These packages are only needed during development and compilation, not at runtime in production.

### Why install some packages as dev dependencies?

- Type definitions like `@types/passport-jwt` and `@types/bcrypt` provide TypeScript type information.

- They help your editor and compiler understand the types for those JavaScript libraries.

- But they aren’t required to run the app since JavaScript code doesn’t use types at runtime.
