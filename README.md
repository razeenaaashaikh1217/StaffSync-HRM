# StaffSync HRM

A MERN-style HR management app modeled on the supplied reference screenshots: dark navy UI, blue primary actions, red logout/HR actions, and role-based Employee, HR, and Manager dashboards.

## Requirements
- Node.js 18+ (20+ recommended)
- MongoDB Atlas account or local MongoDB

## Setup (Windows PowerShell)
Open this folder in VS Code. In the terminal, ensure the terminal path ends with `StaffSync-HRM-Exact-Reference`.

```powershell
npm install
npm install --prefix server
npm install --prefix client
```

Create `server/.env` by copying `server/.env.example`, then put your MongoDB connection string in `MONGO_URI`. Example format (replace credentials and cluster):
`mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/staffsync?retryWrites=true&w=majority`

Important: use exactly one `/` between `.net` and `staffsync`; URL-encode special characters in the database password.

Run both apps:
```powershell
npm run dev
```
Frontend: http://localhost:5173  
Backend health: http://localhost:8000/  
API: http://localhost:8000/api/employees

If PowerShell blocks `npm.ps1`, use **Command Prompt** as the VS Code terminal, or run `npm.cmd install` and `npm.cmd run dev`. Avoid changing system execution policy if you don't need to.

## Demo roles
Register an account with role Employee, HR, or Manager. For a real production system, HR/Manager privileges should be protected with proper server-side authorization; this starter includes basic authentication and role checks but should still be security-reviewed before production.

## Included
- Register/login with hashed passwords and JWT token
- Landing page and role-based dashboards
- Employee profile, leave requests, attendance check-in/out
- HR employee CRUD, leave approvals/rejections, announcements, attendance view
- Manager leave overview and training CRUD
- MongoDB persistence
