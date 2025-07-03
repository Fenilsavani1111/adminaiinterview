# Job Post API Integration

This document describes the API integration for the job post management system.

## 🚀 **Features Implemented**

### **Complete CRUD Operations**
- ✅ **CREATE** - Create new job posts
- ✅ **READ** - Fetch all job posts and individual job posts
- ✅ **UPDATE** - Edit existing job posts
- ✅ **DELETE** - Remove job posts

### **API Service Layer** (`src/services/api.ts`)
- Axios configuration with base URL and interceptors
- Error handling and authentication support
- All job post CRUD operations
- User API functions (ready for future use)

### **Custom Hook** (`src/hooks/useJobPosts.ts`)
- State management for job posts
- Loading and error states
- Optimistic updates for better UX
- Automatic data fetching

## 📋 **Components Updated**

### **JobPostManager**
- Uses real API data instead of mock data
- Maintains original table design
- Adds dummy values for missing API fields
- Full CRUD operations with loading states
- Search and filtering functionality

### **CreateJobPost**
- Integrated with API for creating job posts
- Form validation and error handling
- Multi-step form with job details, requirements, and interview questions

### **EditJobPost**
- Loads existing job post data from context
- Updates job post information via API
- Form pre-population with current data

## 🔧 **Dummy Values Added**

For missing fields from the API response, the following dummy values are automatically added:

```typescript
const processedJobPosts = jobPosts.map(job => ({
  ...job,
  applicants: job.applicants || Math.floor(Math.random() * 50) + 5,
  interviews: job.interviews || Math.floor(Math.random() * 20) + 1,
  shareableUrl: job.shareableUrl || `${window.location.origin}/job/${job.id}`,
  department: job.department || 'General',
  experience: job.experience || 'mid',
  type: job.type || 'full-time',
  status: job.status || 'active',
  createdAt: job.createdAt || new Date(),
  updatedAt: job.updatedAt || new Date(),
  createdBy: job.createdBy || 'admin'
}));
```

## 🛠 **Setup Instructions**

1. **Install Axios** (if not already installed):
   ```bash
   npm install axios
   ```

2. **Update Server URL** in `src/services/api.ts`:
   ```typescript
   const api = axios.create({
     baseURL: 'http://localhost:3000/api', // Update to match your server port
     headers: {
       'Content-Type': 'application/json',
     },
   });
   ```

3. **Start both server and client**:
   ```bash
   # Terminal 1 - Start server
   cd server && npm start
   
   # Terminal 2 - Start client
   cd client && npm run dev
   ```

## 📡 **API Endpoints Used**

- `POST /api/jobposts` - Create job post
- `GET /api/jobposts` - Get all job posts
- `GET /api/jobposts/:id` - Get job post by ID
- `PUT /api/jobposts/:id` - Update job post
- `DELETE /api/jobposts/:id` - Delete job post

## 🎨 **Design Preservation**

- ✅ Original table design maintained
- ✅ All existing UI components unchanged
- ✅ Dummy values ensure all fields display properly
- ✅ Loading states and error handling added
- ✅ Responsive design preserved

## 🔒 **Authentication Ready**

The API service includes authentication support:
- Token-based authentication via localStorage
- Request interceptors for adding auth headers
- Response interceptors for error handling

## 🚦 **Error Handling**

- User-friendly error messages
- Loading states during API calls
- Graceful fallbacks for missing data
- Console logging for debugging

## 📱 **Responsive Design**

All components maintain their responsive design:
- Mobile-friendly table layout
- Responsive stats cards
- Adaptive search and filter controls
- Touch-friendly action buttons 