🚘 Brand Kiln – AI-Powered Car Finder
Built by Danish Khan
A modern, full-featured car finder app where users can search, filter, and explore cars from all over the world. Includes powerful search, clean UI, real-time filters, wishlist support, user accounts, and smooth deployment to Railway.app.

✨ Features
🔐 User Authentication – Sign up, log in, manage your account (even delete it)

🔍 Advanced Search – Search and filter by brand, fuel type, price, and more

📦 Built-in Car Database – Comes loaded with real cars from top manufacturers

🖼️ Car Details – View images, pricing, and detailed specs for each car

💾 Wishlist Support – Save favorite cars locally

📱 Responsive Design – Works beautifully on mobile, tablet, and desktop

🌗 Dark & Light Mode – With perfect contrast and modern UI

⚡ Fast & Smooth – Instant search, lazy loading, and auto-suggestions

🧰 Tech Stack
Layer	Technology
Frontend	React, TypeScript, TailwindCSS, Shadcn UI
Backend	Node.js, Express
Database	PostgreSQL (via Drizzle ORM)
Auth System	Passport.js (Session-based)
State Mgmt	TanStack Query (React Query)
🚀 Getting Started (Local Dev)
Clone this repo

Install dependencies:

bash
Copy
Edit
npm install
Create a .env file (see below)

Run locally:

bash
Copy
Edit
npm run dev
Visit the app at: http://localhost:5000

🔐 Environment Variables
Add a .env file at the root of your project:

env
Copy
Edit
# PostgreSQL connection
DATABASE_URL=postgresql://username:password@hostname:port/database
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=yourpassword
PGPORT=5432
PGDATABASE=carsdb

# Car API (optional – app uses fallback data if not set)
CAR_API_KEY=your_api_key
CAR_API_SECRET=your_api_secret
CAR_API_TOKEN=your_api_token

# Auth session secret
SESSION_SECRET=your_secure_random_string
☁️ Deploying on Railway
This app is built to work perfectly with Railway.

1. Create a project
Log into Railway

Click “New Project” → “Deploy from GitHub repo”

2. Add a PostgreSQL database
Add the PostgreSQL plugin inside Railway

It will auto-generate all necessary DB env vars

3. Add other environment variables
SESSION_SECRET – Use openssl rand -hex 32 to generate one

Optionally add:

CAR_API_KEY

CAR_API_SECRET

CAR_API_TOKEN

4. Deploy!
Railway auto-detects and builds your app using npm start

Your database will set up automatically (thanks to Drizzle ORM)

You’ll get a public URL and can attach your own domain

🚗 Car Database
This app comes with built-in data for cars from around the globe:

🇯🇵 Japan: Toyota, Honda, Nissan, Suzuki, etc.

🇩🇪 Europe: BMW, Audi, Mercedes-Benz, Volkswagen, etc.

🇺🇸 USA: Ford, Chevrolet, Tesla, etc.

🇰🇷 Korea: Hyundai, Kia, Genesis

🇮🇳 India: Mahindra, Tata, Maruti Suzuki

Everything from budget cars to premium and rare models is included.

📡 API Routes
🔐 Auth Endpoints
Method	Route	Description
POST	/api/register	Create a new account
POST	/api/login	Log into your account
POST	/api/logout	Log out
GET	/api/user	Get the logged-in user info
DELETE	/api/user	Delete your account
🚘 Car Endpoints
Method	Route	Description
GET	/api/cars/search	Search and filter cars
GET	/api/cars/:id	Get details of a specific car
💡 Notes
If the external car API isn't configured, the app gracefully falls back to the internal database.

All car data is locally indexed for performance and offline use.

Auth is session-based for security and easy integration.

Car suggestions work with fuzzy search and real-time matching.

Lazy loading and infinite scroll are supported for better UX.

📝 License
This project is under the MIT License. Feel free to fork, modify, and deploy your own version.
