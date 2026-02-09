# Node.js Backend API

This is the Node.js/Express backend for the VOICE Medical Negligence platform, converted from the Python/FastAPI backend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=legal_guardian
CORS_ORIGINS=*
JWT_SECRET=dev-secret-key-change-me
PORT=8000
```

3. Make sure MongoDB is running:
```bash
# macOS (via Homebrew)
brew services start mongodb-community@7.0

# Or manually
mongod --dbpath ~/data/db --logpath ~/data/log/mongod.log --fork
```

4. Start the server:
```bash
npm start
```

The server will run on `http://127.0.0.1:8000` by default.

## API Endpoints

All API endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Stories
- `POST /api/stories` - Create a story (requires auth)
- `GET /api/stories/approved` - Get approved stories (public)
- `GET /api/stories/my` - Get my stories (requires auth)
- `GET /api/stories/:id` - Get story by ID
- `PUT /api/stories/:id` - Update story (requires auth)
- `DELETE /api/stories/:id` - Delete story (requires auth)
- `POST /api/stories/:id/images` - Upload story image (requires auth)

### Admin
- `GET /api/admin/stories` - Get all stories (admin only)
- `PUT /api/admin/stories/:id/moderate` - Moderate story (admin only)
- `GET /api/admin/contacts` - Get all contacts (admin only)
- `GET /api/admin/advocates` - Get all advocates (admin only)
- `PUT /api/admin/advocates/:id/moderate` - Moderate advocate (admin only)
- `GET /api/admin/grants` - Get all grants (admin only)
- `PUT /api/admin/grants/:id/moderate` - Moderate grant (admin only)
- `GET /api/admin/stats` - Get admin statistics (admin only)
- `GET /api/admin/merchandise` - Get all merchandise (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `PUT /api/admin/orders/:id/status` - Update order status (admin only)

### Merchandise
- `GET /api/merchandise` - Get active merchandise (public)
- `GET /api/merchandise/:id` - Get merchandise by ID (public)
- `POST /api/merchandise` - Create merchandise (admin only)
- `PUT /api/merchandise/:id` - Update merchandise (admin only)
- `DELETE /api/merchandise/:id` - Delete merchandise (admin only)
- `POST /api/merchandise/:id/image` - Upload merchandise image (admin only)

### Orders
- `POST /api/orders` - Create order (guest or authenticated)
- `GET /api/orders/my` - Get my orders (requires auth)

### Advocates
- `POST /api/advocates/register` - Register as advocate
- `GET /api/advocates` - Get approved advocates (public)
- `GET /api/advocates/:id` - Get advocate by ID (public)

### Grants
- `POST /api/grants/apply` - Apply for grant (requires auth)
- `GET /api/grants/my` - Get my grants (requires auth)
- `POST /api/grants/:id/documents` - Upload grant document (requires auth)

### Settings
- `GET /api/settings` - Get site settings (public)
- `PUT /api/admin/settings` - Update site settings (admin only)
- `POST /api/admin/settings/logo` - Upload logo (admin only)
- `POST /api/admin/settings/professional-image` - Upload professional image (admin only)
- `PUT /api/admin/credentials` - Update admin credentials (admin only)

### Public
- `GET /api/stats/public` - Get public statistics
- `POST /api/contact` - Submit contact form

## Admin Security

**Admin registration is completely disabled from the frontend for security reasons.**

### Creating Admin Users

Use the secure CLI script to create admin accounts:

```bash
node scripts/create-admin.js <email> <password> <full_name> [phone]
```

**Example:**
```bash
node scripts/create-admin.js admin@example.com SecurePassword123 "Admin Name"
```

**Requirements:**
- Email must be valid
- Password must be at least 8 characters
- Full name is required
- Phone is optional

For detailed security information, see [ADMIN_SECURITY.md](./ADMIN_SECURITY.md).

### Default Admin Credentials

On first startup, a default admin account is created:

- Email: `admin@admin.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these credentials immediately after first login using:
1. The admin panel: `/admin/settings` → Credentials tab
2. Or create a new admin using the script above and delete the default account

## Database

The backend uses MongoDB. All collections use the same schema as the Python backend, so the database is fully compatible. You can use the same MongoDB database that was used with the Python backend.

## Notes

- The frontend requires `REACT_APP_BACKEND_URL=http://127.0.0.1:8000` in `frontend/.env`
- All file uploads (images, documents) are stored as base64-encoded strings in MongoDB
- JWT tokens expire after 24 hours
- Password hashing uses bcrypt with 10 rounds

