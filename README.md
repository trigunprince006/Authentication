# Login & Register Demo — MongoDB Connectivity Project

A small college project that shows the complete journey of data from a web page
into a real database and back:

```
HTML form → JavaScript fetch() → Node.js + Express → Mongoose → MongoDB Atlas
```

---

## 1. What the project does

- **Register page** — you type a name, email and password. The app checks the
  input, sends it to the server, and the server saves a new user document inside
  MongoDB Atlas.
- **Login page** — you type your email and password. The server looks the email
  up in MongoDB and checks the password.
- **Welcome page** — if the login is correct you get a greeting with your name
  and a celebratory GIF, plus a logout button.

The left side of the register and login pages shows a small "pipeline" that
lights up step by step while the request is travelling, so during your viva you
can literally point at where the data is.

---

## 2. Technologies used

| Part | Technology |
| --- | --- |
| Structure of the pages | HTML5 |
| Styling | CSS3 (no Bootstrap, no Tailwind) |
| Browser logic | Vanilla JavaScript (`fetch`) |
| Server | Node.js + Express.js |
| Database | MongoDB Atlas (cloud) |
| Database library | Mongoose |
| Password security | bcryptjs |
| Secret settings | dotenv |

---

## 3. Install Node.js

1. Go to <https://nodejs.org> and download the **LTS** version.
2. Install it (keep clicking Next; the defaults are fine).
3. Open a terminal (Command Prompt / PowerShell on Windows, Terminal on
   Mac/Linux) and check it worked:

```bash
node -v
npm -v
```

Both commands should print a version number.

---

## 4. Install the dependencies

Open a terminal **inside the project folder** (the one containing
`package.json`) and run:

```bash
npm install
```

This reads `package.json` and downloads express, mongoose, bcryptjs and dotenv
into a new `node_modules` folder. You only do this once.

---

## 5. Create a MongoDB Atlas database

1. Go to <https://www.mongodb.com/atlas> and sign up (free).
2. Click **Build a Database** → choose the free **M0** shared cluster → pick a
   region near you → **Create**.
3. **Database Access** (left menu) → **Add New Database User**
   - Username: for example `princeuser`
   - Password: pick one and **write it down** — you will need it in a minute
   - Role: *Read and write to any database* → **Add User**
4. **Network Access** (left menu) → **Add IP Address** → **Allow access from
   anywhere** (`0.0.0.0/0`) → **Confirm**.
   (For a college demo this is the easiest option.)

---

## 6. Get your connection string

1. Go to **Database** → click **Connect** on your cluster.
2. Choose **Drivers** (or "Connect your application").
3. Select **Node.js**. You will see something like:

```
mongodb+srv://princeuser:<password>@cluster0.abcd123.mongodb.net/?retryWrites=true&w=majority
```

4. Copy it and make two edits:
   - Replace `<password>` with the real password you created in step 5.3
     (remove the angle brackets too).
   - Add a database name after `.net/` — use `logindemo`:

```
mongodb+srv://princeuser:MyPass123@cluster0.abcd123.mongodb.net/logindemo?retryWrites=true&w=majority
```

> If your password contains special characters like `@`, `#` or `/`, either
> change it to plain letters and numbers, or URL-encode it.

---

## 7. Create the `.env` file

Inside the `server/` folder there is a file called `.env`
(and a copy named `.env.example` for reference). Open `.env` and paste your own
connection string:

```env
MONGO_URI=mongodb+srv://princeuser:MyPass123@cluster0.abcd123.mongodb.net/logindemo?retryWrites=true&w=majority
PORT=5000
```

**Why a `.env` file?** So your database password never sits inside a `.js` file
that you might upload to GitHub or email to someone. `dotenv` loads these values
into `process.env` when the server starts.

---

## 8. Start the project

```bash
npm start
```

or, exactly the same thing:

```bash
node server/server.js
```

When everything is correct the terminal prints:

```
MongoDB connected successfully
Server running on http://localhost:5000
```

Stop the server any time with **Ctrl + C**.

---

## 9. Open it in the browser

Go to <http://localhost:5000>

You must open it through `localhost`, **not** by double-clicking the HTML file.
Opening the file directly gives a `file:///...` address, and then `fetch()`
cannot find your server.

---

## 10. Test registration and login

1. On the login page click **Create one**.
2. Fill in name, email, password, confirm password → **Create account**.
   You should see a green success message and be sent to the login page.
3. Log in with the same email and password → you land on the welcome page with
   your name and the GIF.
4. Now try the error cases — they all show friendly messages:
   - leave fields empty
   - type `abc` as the email
   - make the two passwords different
   - register the same email twice
   - log in with an email that does not exist
   - log in with the wrong password

---

## 11. Check the user inside MongoDB Atlas

1. In Atlas open **Database** → **Browse Collections**.
2. Open the database `logindemo` → collection `users`.
3. You will see your document:

```json
{
  "_id": "665f1c3e9b1d2a0012ab34cd",
  "name": "Prince",
  "email": "prince@example.com",
  "password": "$2a$10$Q9s...hashed...",
  "createdAt": "2026-09-21T10:14:02.551Z"
}
```

Notice the password is a long scrambled **bcrypt hash**, not the text you typed.
That is the point of hashing: even a person who can read the database cannot
read anyone's password. Logging in works because bcrypt hashes the password you
just typed and compares the two hashes — it never "unscrambles" anything.

---

## Project structure

```
login-register-demo/
├── server/
│   ├── server.js          starts Express, connects Mongoose to MongoDB
│   ├── models/User.js     what a user looks like in the database
│   ├── routes/auth.js     the /api/auth/... endpoints
│   ├── .env               your MONGO_URI and PORT (secret)
│   └── .env.example       template for the .env file
├── public/                everything the browser downloads
│   ├── index.html         login page
│   ├── register.html      register page
│   ├── dashboard.html     welcome page + GIF
│   ├── css/style.css      all styling
│   └── js/
│       ├── register.js    validates + sends the register form
│       ├── login.js       sends the login form, redirects on success
│       ├── dashboard.js   greets the user, logout, GIF fallback
│       └── pipeline.js    animates the little "where your data goes" rail
├── package.json
└── README.md
```

### What each important file does

- **`server/server.js`** — the entry point. It loads `.env`, turns on
  `express.json()` (so the server can read JSON bodies), serves the `public`
  folder as a website, points `/api/auth` at the route file, connects to MongoDB
  and only then starts listening on port 5000.
- **`server/models/User.js`** — the Mongoose schema: `name`, `email`,
  `password`, `createdAt`, with validation rules. It also hashes the password
  automatically just before saving.
- **`server/routes/auth.js`** — the API. `POST /register` checks whether the
  email exists and creates the user; `POST /login` finds the user and compares
  passwords; `GET /me` and `POST /logout` keep the dashboard simple.
- **`public/js/*.js`** — browser code. It never touches MongoDB directly. It
  only calls URLs on your own server with `fetch()` and displays whatever JSON
  comes back.

### How the frontend talks to the backend

The browser cannot connect to MongoDB — only the server can. So the browser
sends a small JSON message instead:

```js
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, password }),
});
const data = await response.json();
```

Express receives it, `express.json()` turns the JSON text back into a JavaScript
object at `req.body`, Mongoose writes it to MongoDB, and the route replies with
another JSON object such as `{ success: true, message: "..." }`, which the
frontend turns into a green or red message on screen.

---

## API endpoints

| Method | URL | Body | What it does |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }` | Creates a user if the email is free |
| POST | `/api/auth/login` | `{ email, password }` | Verifies credentials against MongoDB |
| GET | `/api/auth/me` | — | Returns the currently logged-in user |
| POST | `/api/auth/logout` | — | Forgets the logged-in user |

---

## Common problems

| Message | Fix |
| --- | --- |
| `MongoDB connection failed` + authentication error | Wrong username or password in `MONGO_URI`; `<password>` was not replaced |
| Connection just times out | Your IP is not allowed — add `0.0.0.0/0` under Network Access in Atlas |
| `MONGO_URI is missing` | The file must be `server/.env`, not `env` or `.env.txt` |
| `Could not reach the server` in the browser | The server is not running, or you opened the HTML file directly instead of `http://localhost:5000` |
| `EADDRINUSE` | Port 5000 is busy — change `PORT` in `.env` to `5001` and use that URL |
| `Cannot find module 'express'` | You forgot `npm install` |

---

## Honest note for the report

This project keeps the login session deliberately simple: after a successful
login the server remembers one user in a variable and the browser keeps a copy
in `sessionStorage`. That is enough to demonstrate database connectivity, but a
real application would issue a signed token (JWT) or a secure session cookie,
and would protect its routes with that token. Password hashing with bcrypt,
however, is done the proper way here.
