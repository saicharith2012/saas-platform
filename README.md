# Saas Platform Application

This repository contains a Saas (Software as a Service) platform application built with React.js for the frontend and Node.js with Express.js for the backend. It allows super admins to create organizations and add admins to those organizations. Admins can later purchase subscriptions through Stripe.

## Getting Started

### Prerequisites

- Node.js installed on your local machine
- MongoDB Atlas account or a local MongoDB server running

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/saas-platform.git
   cd saas-platform
Install dependencies:

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
Set up environment variables:

Create .env files in both server/ and client/ directories based on the provided .env.example files. Replace placeholders with your actual values.

Start the server and client:
# Start the server (from server directory)
npm start

# Start the client (from client directory)
npm start
Open the application:

Open your browser and navigate to http://localhost:3000 to view the application.

Usage
Super Admin Dashboard: After logging in as a super admin, you can create organizations, specify admin details including name, email, and password, and manage existing organizations.
Admin Dashboard: Admins of organizations can purchase subscriptions through Stripe.
User Dashboard: Users can access platform features based on their organization's subscription.
Technologies Used
Frontend: React.js, Redux Toolkit, React Router
Backend: Node.js, Express.js, MongoDB, Mongoose
Authentication: JSON Web Tokens (JWT), Cookies
Payment Processing: Stripe API
Folder Structure
client/: Frontend React application.
server/: Backend Node.js server.
Contributing
Contributions are welcome! Feel free to fork the repository and submit pull requests.

License
This project is licensed under the MIT License - see the LICENSE file for details.
