# Brand Kiln - AI-Powered Car Finder Application

An elegant and powerful car finder application that allows users to search, filter, and interact with a comprehensive database of cars from around the world. The application features user authentication, advanced search capabilities, filters, and detailed car information.

## Features

- User authentication system with account creation and management
- Advanced car search functionality with extensive filters
- Comprehensive car database with models from major global and Indian manufacturers
- Detailed car information including specifications, pricing, and images
- Responsive design that works on mobile, tablet, and desktop
- Filter by brand, price range, fuel type, body style, and more
- User account management including account deletion capability
- Wishlist feature to save favorite cars

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **State Management**: TanStack Query (React Query)

## Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (see Environment Variables section)
4. Run the development server with `npm run dev`
5. The application will be available at http://localhost:5000

## Environment Variables

The following environment variables are required for the application to function:

```env
# Database Connection
DATABASE_URL=postgresql://username:password@hostname:port/database
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=yourpassword
PGPORT=5432
PGDATABASE=carsdb

# Car API (Optional - Application uses fallback data if not provided)
CAR_API_KEY=your_api_key
CAR_API_SECRET=your_api_secret
CAR_API_TOKEN=your_api_token

# Session Secret (Required for authentication)
SESSION_SECRET=a_secure_random_string
```

## Deployment on Railway.app

This application is designed to be easily deployed on Railway.app:

1. **Create a new project on Railway.app**
   - Go to [Railway.app](https://railway.app/)
   - Sign in with your GitHub account
   - Click "New Project" and select "Deploy from GitHub repo"

2. **Connect your GitHub repository**
   - Select the repository containing this project
   - Railway will automatically detect the project structure

3. **Add a PostgreSQL database plugin to your project**
   - Click "New" in your project dashboard
   - Select "Database" and then "PostgreSQL"
   - Railway will provision a PostgreSQL database

4. **Set up environment variables**
   - Railway will automatically set up the following PostgreSQL variables:
     - `DATABASE_URL`
     - `PGHOST`
     - `PGPORT`
     - `PGUSER`
     - `PGPASSWORD`
     - `PGDATABASE`
   
   - Add the following additional environment variables:
     - `SESSION_SECRET` (generate a secure random string, e.g., `openssl rand -hex 32`)
     - `NODE_ENV` = `production`
     - Optionally add car API credentials if available:
       - `CAR_API_KEY`
       - `CAR_API_SECRET`
       - `CAR_API_TOKEN`

5. **Deploy the application**
   - Railway will automatically detect the `package.json` and build the application
   - It will use the `npm start` command as defined in our Procfile

6. **Database setup**
   - The first deployment will automatically create and set up the database tables
   - No manual migration commands needed thanks to Drizzle ORM

7. **Access your deployed application**
   - Once deployed, Railway will provide a URL for your application
   - You can also set up a custom domain in Railway's settings

### Important Deployment Notes

- The application uses a comprehensive fallback database of cars if the external car API is not available or configured
- The app includes built-in car data from over 40 manufacturers and hundreds of models from around the world
- Database migrations will be automatically handled by Drizzle ORM
- The application is configured to work with Railway's built-in PostgreSQL plugin
- For production use, it's recommended to set a strong SESSION_SECRET value

## Car Data Source

The application comes with a built-in database of car models from around the world including:

- Popular Japanese brands (Toyota, Honda, Nissan, Suzuki, etc.)
- European luxury and common brands (BMW, Mercedes, Audi, Volkswagen, etc.)
- American manufacturers (Ford, Chevrolet, Tesla, etc.)
- Korean brands (Hyundai, Kia, Genesis)
- Indian manufacturers (Mahindra, Tata, Maruti Suzuki, etc.)

The car database includes a wide range of models from common everyday vehicles to rare and luxury models, providing a comprehensive selection for users.

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `POST /api/logout` - Logout a user
- `GET /api/user` - Get the currently authenticated user
- `DELETE /api/user` - Delete the current user's account

### Cars
- `GET /api/cars/search` - Search for cars with various filters
- `GET /api/cars/:id` - Get details for a specific car by ID

## License

This project is licensed under the MIT License - see the LICENSE file for details.#   b r a n d - k i l n - a s s e s s m e n t - S u b m i t  
 #   b r a n d - k i l n - a s s e s s m e n t - S u b m i t  
 #   b r a n d - k i l n - a s s e s s m e n t - S u b m i t  
 