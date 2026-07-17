# 🏗️ Backend Architecture: The Layered Pattern

The **Layered (or N-Tier) Architecture** is a fundamental software design pattern used to build scalable, maintainable, and testable backend systems.

---

## 1. Why Layered Architecture?

> **Why do we separate our backend into layers?**
> **Answer:** We use a layered architecture to enforce the **Separation of Concerns (SoC)** principle. It ensures that HTTP routing logic, business logic, and database interactions are completely isolated from each other. This modularity makes the application easier to unit test, scale, and refactor (e.g., swapping MongoDB for PostgreSQL without touching the HTTP controllers).

---

## 2. The Core Layers Overview

This table summarizes the strict responsibility boundaries of each layer:

| Layer | Technical Name | Primary Responsibility | Dependencies / Context |
| :--- | :--- | :--- | :--- |
| **Routes** | Routing Layer | Map HTTP methods and URLs to specific controllers. | Express router, Middleware |
| **Controller** | Transport / Presentation Layer | Handle HTTP requests, extract payloads, and return HTTP responses. | `req`, `res`, Services |
| **Service** | Business Logic Layer | Execute core business rules and coordinate data models or external APIs. | Models, 3rd Party APIs, Utils |
| **Model** | Data Access Layer (DAL) | Define schemas and interact directly with the database. | Database/ORM (e.g., Mongoose) |
| **Utils** | Helper / Utility Layer | Provide pure, reusable, generic functions across the app. | Pure logic only |

---

## 3. Deep Dive: Layer Responsibilities

### A. Controllers (Transport Layer)
The Controller's strictly defined boundary is managing the HTTP protocol. It acts as the entry point for incoming client requests.
- **Responsibilities:** Extracting data from the HTTP Request (`req.body`, `req.params`, `req.query`), passing that data to the Service layer, and returning the appropriate HTTP Response (`res.status(200).json()`).
- **Anti-patterns:** Controllers should **never** contain database queries (`User.findOne()`), complex data transformations, or external API calls.

### B. Services (Business Logic Layer)
The Service Layer is the core of the application where all business rules and complex operations reside. 
- **Responsibilities:** Processing data, interacting with database models, calculating values, or integrating with third-party systems (like Stripe or ML services).
- **Anti-patterns:** A service should **never** accept HTTP-specific objects like `req` or `res`. It should only accept raw parameters, execute logic, and `return` data or `throw` an error.

### C. Utils (Utility Layer)
Utilities are small, stateless, purely functional modules that perform common, reusable operations.
- **Core Rule:** A utility must be globally applicable across the entire application. It should **never** be tied to a specific resource or domain entity (e.g., you should build a generic `formatDate()` utility, NOT a domain-specific `formatUserDate()` utility).
- **Responsibilities:** Formatting dates, hashing passwords, generating tokens, or validating regex patterns.
- **Anti-patterns:** Utils should **never** manage state, hold business rules, or interact with databases or external APIs.

---

## 4. Architecture in Action (Code Examples)

You may need to refactor a tightly coupled controller (often called a "Fat Controller"). Here is the standard architectural approach.

### ❌ The Anti-Pattern: The "Fat Controller"
This controller violates Separation of Concerns by mixing HTTP handling with database queries and business logic.

```javascript
// controllers/authController.js
const login = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    
    // Anti-pattern: Direct database access inside the controller
    const user = await User.findOne({ email }); 
    const passwordMatches = bcrypt.compare(req.body.password, user.password);
    
    if (!passwordMatches) return res.status(401).json({ error: "Invalid credentials" });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### ✅ The Professional Standard: Layered Separation
Each layer maintains strict isolation and a single responsibility.

```javascript
// 1. util/formatters.js (Utility Layer)
const toLowercase = (email) => email.toLowerCase().trim();

// 2. services/authService.js (Business Logic Layer)
// Notice there is NO req or res here. Just raw data in, raw data out.
const loginUser = async (rawEmail, password) => {
  const cleanEmail = toLowercase(rawEmail); 
  const user = await User.findOne({ email: cleanEmail }); 
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }
  return user; 
};

// 3. controllers/authController.js (Transport Layer)
// Notice there are NO database calls here. Just handling HTTP traffic.
const login = async (req, res) => {
  try {
    const { email, password } = req.body; 
    const user = await loginUser(email, password); 
    res.status(200).json(user); 
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
```

---

## 5. Key Architecture Questions

> **Question:** "Why shouldn't a Service function take the `req` or `res` objects as parameters?"
> **Answer:** "`req` and `res` are Express-specific HTTP objects. A service represents business logic and should be completely independent of the transport layer. By passing only the exact data the service needs (such as `email` and `password`), the service becomes highly reusable across different interfaces like REST, GraphQL, WebSockets, or background cron jobs. Furthermore, decoupled services are much easier to unit test, easier to maintain, and strictly follow the Separation of Concerns (SoC) principle. Controllers handle HTTP details, while services focus solely on business logic."

> **Question:** "What is the single responsibility of a Controller?"
> **Answer:** "A Controller's sole responsibility is managing the transport layer. It parses incoming HTTP requests, delegates the actual processing to a Service, and formats the outbound HTTP response with the correct status codes."

> **Question:** "What is the difference between a Service and a Utility (Util)?"
> **Answer:** "A Service contains domain-specific business logic (e.g., `calculateExpenseTax()`) and often interacts with databases or external APIs. A Utility is a pure, domain-agnostic function used globally across the entire application (e.g., `formatDate()` or `hashString()`). Utilities never manage state, never talk to databases, and are never tied to a specific resource."