# Admin Panel User Guide

## Overview

The Admin Panel is a comprehensive management interface for administrators to moderate content, manage users, and oversee all aspects of the VOICE Medical Negligence platform.

**Access:** Only users with `role: 'admin'` can access the admin panel at `/admin`

---

## Dashboard Overview

The admin panel displays a dashboard with **8 key statistics cards**:

1. **USERS** - Total number of registered users
2. **STORIES** - Total victim stories submitted
3. **APPROVED** - Number of approved stories (visible to public)
4. **ADVOCATES** - Total advocate registrations
5. **ADV. ACTIVE** - Number of approved advocates
6. **GRANTS** - Total grant applications received
7. **GRANTS OK** - Number of approved grant applications
8. **CONTACTS** - Total contact form submissions

---

## Main Features & Tabs

### 1. **Content Moderation - Stories**

**Tabs:**
- **Pending** - Stories awaiting review
- **Approved** - Stories that are visible to the public
- **Rejected** - Stories that were not approved

**Actions:**
- **Review Story Details:** Click on any story to expand and view:
  - Story title, incident date, hospital name, location
  - Full description and outcome
  - Submitted images
  - User information
  - Submission date

- **Approve Story:**
  1. Review the story content
  2. Click "Approve" button
  3. Optionally add admin notes
  4. Story becomes visible on the public `/stories` page

- **Reject Story:**
  1. Review the story
  2. Click "Reject" button
  3. Add admin notes explaining the reason (recommended)
  4. Story is hidden from public view

- **Admin Notes:** Add internal notes about why a story was approved/rejected (visible only to admins)

---

### 2. **Advocate Management**

**View all advocate registrations:**
- Pending advocate applications
- Approved advocates (visible in "Find Advocates")
- Rejected applications

**Actions:**
- **Review Applications:** View advocate details including:
  - Full name, email, phone
  - Bar Council number
  - Specializations
  - Experience years
  - Areas of operation
  - About section
  - Languages spoken

- **Approve Advocate:**
  - Makes advocate profile visible to users
  - Advocate can be found in "Find Advocates" section
  - Add admin notes if needed

- **Reject Advocate:**
  - Hides advocate from public view
  - Add notes explaining rejection reason

---

### 3. **Grant Application Management**

**View grant applications:**
- Pending grant requests
- Approved grants
- Rejected applications

**Actions:**
- **Review Grant Applications:** View complete application including:
  - Case summary and type
  - Opponent details
  - Current legal stage
  - Financial information (annual income, family members)
  - Amount required
  - Purpose of funding
  - Bank account details
  - Supporting documents

- **Approve Grant:**
  1. Review the application
  2. Enter approved amount (if different from requested)
  3. Add admin notes
  4. Grant is approved and funds can be disbursed

- **Reject Grant:**
  1. Review application
  2. Add admin notes explaining rejection
  3. Applicant is notified (through system)

---

### 4. **Contact Management**

**View contact form submissions:**
- All messages submitted through the contact form
- Includes name, email, phone, subject, message
- Timestamp of submission

**Actions:**
- **View Contact Details:** See full message and contact information
- **Update Status:** Mark contacts as:
  - New
  - Read
  - Responded
  - Archived

---

### 5. **Merchandise Management**

**Manage shop items:**
- View all merchandise items (active and inactive)
- Add new products to the shop
- Edit existing products
- Upload product images

**Actions:**
- **Add New Merchandise:**
  1. Click "Add Merchandise" button
  2. Fill in:
     - Product name
     - Description
     - Price
     - Stock quantity
     - Category
     - Active/Inactive status
  3. Save to add to shop

- **Edit Merchandise:**
  - Update product details
  - Change price or stock
  - Activate/deactivate products

- **Upload Product Image:**
  - Click "Upload Image" on any product
  - Select image file
  - Image is stored and displayed in shop

- **Delete/Deactivate:**
  - Mark products as inactive (hides from shop but keeps data)

---

### 6. **Order Management**

**View all shop orders:**
- All orders from users and guests
- Order status: Pending, Confirmed, Shipped, Delivered, Cancelled

**Actions:**
- **View Order Details:**
  - Items purchased
  - Shipping information
  - Total amount
  - Order date
  - Customer contact details

- **Update Order Status:**
  - **Pending** - Order received, not yet processed
  - **Confirmed** - Order confirmed and being prepared
  - **Shipped** - Order has been shipped
  - **Delivered** - Order delivered to customer
  - **Cancelled** - Order cancelled (stock is restored)

---

### 7. **Site Settings**

**Access:** Click "Site Settings" button in admin panel header

**Features:**

#### General Settings:
- **Site Name** - Organization name
- **Tagline** - Site tagline
- **Contact Email** - Public contact email
- **Contact Phone** - Public phone number
- **Address** - Physical address
- **UPI ID** - For donations
- **UPI Payee Name** - Name for UPI payments

#### Homepage Content:
- **Hero Title** - Main heading on homepage
- **Hero Subtitle** - Subheading text
- **About Mission** - Mission statement
- **About Vision** - Vision statement

#### Social Media:
- Facebook URL
- Twitter URL
- Instagram URL

#### Statistics:
- **Years of Service** - Displayed on homepage
- **Cases Resolved** - Displayed on homepage

#### Professional Image Section:
- Upload professional photo
- Professional name
- Professional title
- Professional bio

#### Branding:
- Upload logo (displays in navigation)
- Upload professional image (displays on About page)

#### Admin Credentials:
- Change admin email
- Change admin password
- Requires current password verification

---

## Workflow Examples

### Daily Workflow:
1. **Check Dashboard** - Review statistics for new submissions
2. **Moderate Stories** - Review and approve/reject pending stories
3. **Review Advocates** - Process advocate applications
4. **Check Grants** - Review grant applications
5. **Manage Orders** - Update order statuses for shop purchases
6. **Respond to Contacts** - Review and respond to contact form messages

### Weekly Tasks:
1. **Review Approved Content** - Audit approved stories and advocates
2. **Merchandise Updates** - Add new products or update existing ones
3. **Site Settings** - Update homepage content, statistics, etc.
4. **Analytics Review** - Check dashboard statistics trends

---

## Security Features

- **Authentication Required:** Must be logged in with admin role
- **Route Protection:** All admin routes verify admin status
- **Secure Credentials:** Admin credentials can only be changed by authenticated admin
- **Activity Logging:** All moderation actions are tracked with timestamps

---

## Tips & Best Practices

1. **Always Add Notes:** When approving or rejecting, add admin notes explaining your decision
2. **Regular Reviews:** Check pending items daily to maintain platform quality
3. **Verify Information:** Before approving advocates, verify Bar Council numbers
4. **Grant Approvals:** Carefully review financial information before approving grants
5. **Order Fulfillment:** Update order statuses promptly to keep customers informed
6. **Content Quality:** Ensure approved stories meet community guidelines

---

## Accessing Admin Panel

1. **Login** with admin credentials at `/login`
2. **Navigate** to `/admin` (or click "Admin Panel" from user menu)
3. **Verify** you see the dashboard with statistics

**Default Admin Credentials:**
- Email: `admin@admin.com`
- Password: `admin123`

⚠️ **Change these immediately after first login!**

---

## Support

If you encounter any issues:
1. Check that you're logged in with an admin account
2. Verify your user role is set to `'admin'` in the database
3. Clear browser cache and cookies
4. Try logging out and back in

For creating additional admin accounts, use the secure CLI script:
```bash
node backend-node/scripts/create-admin.js <email> <password> <full_name>
```

