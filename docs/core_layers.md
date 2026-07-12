## 2. Core Layers: Controllers vs Services vs Utils

Once a request passes through the middleware and is routed correctly, it enters the **Layered Architecture**. The easiest way to understand this is the **Restaurant Analogy**.

### A. Controllers (The Waiter)
The Controller's *only* job is to talk to the client (the frontend). It has absolutely zero idea how the actual work is done.
- **What goes here:** Extracting data from the HTTP Request (`req.body`, `req.query`), calling a Service to do the heavy lifting, and returning an HTTP Response (`res.status(200).json()`).
- **What NEVER goes here:** Database queries (`User.findOne()`), complex math, formatting data, or talking to external APIs.
- **Analogy:** The Waiter takes your order (Request), hands the ticket to the kitchen, waits, and brings you your food (Response). The waiter doesn't cook.

### B. Services (The Chef)
The Service Layer is the heart of your application. This is where your "Business Logic" lives. 
- **What goes here:** Creating users in MongoDB, fetching data from Redis, calculating prices, scraping data, or calling a third-party weather API.
- **What NEVER goes here:** `req` or `res`. A service should never know that it is part of a web server. It should just take raw parameters and `return` data or `throw` an error.
- **Analogy:** The Chef receives the ticket, gathers ingredients (from the Database), cooks the meal (Business Logic), and puts it on the counter for the waiter to take.

### C. Utils (The Kitchen Tools)
Utils (Utilities) are small, purely functional "helpers" that can be used absolutely anywhere in your app. 
- **What goes here:** Formatting dates, calculating percentages, regex validators (checking if an email is valid), or converting units.
- **What NEVER goes here:** Database calls (`mongoose`), Redis calls, or specific business rules.
- **Analogy:** The knives, blenders, and measuring cups. They don't cook the meal themselves, but the Chef (Service) uses them constantly to get the job done faster.

### Architecture Code Example

**❌ Bad (Monolith Controller):**
```javascript
const login = async (req, res) => {
  // Controller doing Chef work:
  const user = await User.findOne({ email: req.body.email }); 
  const passwordMatches = bcrypt.compare(req.body.password, user.password);
  res.status(200).json(user);
};
```

**✅ Good (Separated Layers):**
```javascript
// --- util/formatters.js (The Tool) ---
const toLowercase = (email) => email.toLowerCase().trim();

// --- services/authService.js (The Chef) ---
const loginUser = async (rawEmail, password) => {
  const cleanEmail = toLowercase(rawEmail); // Uses a util
  const user = await User.findOne({ email: cleanEmail }); // Talks to DB
  return user; // Returns pure data
};

// --- controllers/authController.js (The Waiter) ---
const login = async (req, res) => {
  const { email, password } = req.body; // Takes the order
  const user = await loginUser(email, password); // Gives order to chef
  res.status(200).json(user); // Serves the food
};
```

---