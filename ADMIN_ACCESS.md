# Admin Access Instructions

## How to Access the Admin Page

The admin page is protected and only accessible to users with the `admin` role. Follow these steps to create an admin user and access the admin panel.

## Method 1: Using the Script (Recommended)

### Step 1: Create an Admin User

Run the provided script from the `kelale-backend` directory:

```bash
cd kelale-backend
node scripts/createAdmin.js
```

This will create a default admin user with:
- **Email**: `admin@kelale.com`
- **Password**: `admin123`
- **Name**: Admin User

### Step 2: Create Admin with Custom Details

You can also provide custom details:

```bash
node scripts/createAdmin.js "John" "Middle" "Doe" "john.doe@kelale.com" "yourSecurePassword" "+251911234567"
```

Arguments (in order):
1. First Name
2. Middle Name (optional, can be empty string "")
3. Last Name
4. Email
5. Password
6. Phone Number (optional)

### Step 3: Login to the Application

1. Start the frontend server (if not already running):
   ```bash
   cd kelale-frontend
   npm run dev
   ```

2. Navigate to the login page: `http://localhost:5173/login`

3. Enter the admin credentials you created

4. After successful login, you will see an **"Admin"** link in the navigation bar (only visible to admin users)

5. Click the **"Admin"** link to access the admin panel

## Method 2: Manual Database Update

If you prefer to manually create an admin user or update an existing user:

### Using MongoDB Shell

1. Connect to your MongoDB database:
   ```bash
   mongosh
   use kelale
   ```

2. Create or update a user to admin role:
   ```javascript
   // Option A: Update existing user
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )

   // Option B: Create new admin user (you'll need to hash the password first)
   // Use the script method instead, as it handles password hashing
   ```

### Using MongoDB Compass or Other GUI

1. Open your MongoDB GUI tool
2. Navigate to the `kelale` database → `users` collection
3. Find the user you want to make admin
4. Update the `role` field to `"admin"`
5. Save the changes

## Method 3: Using API (Advanced)

You can also create an admin user via API by modifying the registration endpoint temporarily, or by using a tool like Postman:

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@kelale.com",
  "password": "admin123",
  "role": "admin"
}
```

**Note**: The registration endpoint may restrict role assignment. The script method is recommended.

## Admin Page Features

Once you access the admin page, you can:

- **Add Companies**: Create new bus companies
- **View Companies**: See all registered companies
- **View Buses**: See all buses in the system
- **View Routes**: See all available routes

## Security Notes

⚠️ **Important Security Reminders:**

1. Change the default admin password immediately after first login
2. Use strong, unique passwords for admin accounts
3. Don't share admin credentials
4. Consider implementing additional security measures for production:
   - Two-factor authentication
   - IP whitelisting
   - Rate limiting
   - Audit logging

## Troubleshooting

### Admin link not showing after login?

1. Check that your user's role is set to `"admin"` in the database
2. Logout and login again to refresh the user state
3. Check browser console for any errors
4. Verify the JWT token includes the admin role

### Cannot access admin page?

1. Ensure you're logged in with an admin account
2. Check that the user role in localStorage is `"admin"`
3. Try clearing browser cache and cookies
4. Check the browser console for error messages

### Script fails to create admin?

1. Ensure MongoDB is running
2. Check your `MONGO_URI` in `.env` file
3. Verify the database connection
4. Check if a user with that email already exists

## Need Help?

If you encounter any issues, check:
- Backend server logs
- Browser console for frontend errors
- MongoDB connection status
- User collection in the database


