SaaS Platform
=============

This project is a SaaS platform where super admins can manage organizations and admins within those organizations.

Getting Started
---------------

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed:

-   Node.js (v14 or higher)
-   npm (v6 or higher) or yarn (v1.22 or higher)
-   MongoDB (Make sure MongoDB is installed and running locally on its default port (27017))

### Installing

Step 1: Clone the repository:
------------------------------------

    `git clone https://github.com/your_username/your_repository.git
    cd your_repository`

Step 1: Install dependencies:
------------------------------------
    `npm install
    or
    yarn install`

Step 3: Set Up Environment Variables:
------------------------------------

Create a `.env` file in the root directory of the project with the following variables:

`# MongoDB connection URI
MONGODB_URI=mongodb://localhost:27017/yourdatabase

# JWT secret key
JWT_SECRET=your_jwt_secret_key

# Stripe secret key (replace with your Stripe secret key)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Stripe webhook secret (generate from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret`

Step 4: Stripe Setup:
--------------------

1.  **Create a Stripe Account**:

    -   Sign up or log in to your Stripe account at [Stripe Dashboard](https://dashboard.stripe.com/register).
2.  **Retrieve Your Stripe API Keys**:

    -   In the Stripe Dashboard, navigate to Developers > API keys.
    -   Copy your `Publishable Key` and `Secret Key`.
3.  **Set Up Webhook Endpoint**:

    -   In the Stripe Dashboard, navigate to Developers > Webhooks.
    -   Click on "Add endpoint".
    -   Set the endpoint URL to your deployed backend URL followed by `/api/payment/webhook` (e.g., `http://localhost:5000/api/payment/webhook` for local development).
    -   Select "receive all events" and add the endpoint.

Step 5: Start the Application:
------------------------------
1.  Start the backend server:
    `npm start`

    This will start the backend server at `http://localhost:5000`.

2.  Start the frontend development server:

    `npm start`

    This will start the frontend server.

Step 6: Testing
---------------

Open your browser and go to `http://localhost:3001` to see the application running.

* * * * *

### Usage

-   **Login:** Access the login page at `http://localhost:3000/login` and log in using super admin credentials.
-   **Super Admin Dashboard:** After logging in, you'll be redirected to the Super Admin Dashboard where you can create organizations and add admins.
-   **Creating Organizations:** Fill out the form with the organization name, billing email, and admin details (name, email, password) to create a new organization and assign an admin.
-   **Logout:** Click on the "Logout" button in the navigation bar to log out from the application.

### Built With

-   **Frontend:** React, React Router, Redux Toolkit (State Management), Axios
-   **Backend:** Node.js, Express, MongoDB
-   **Authentication:** JWT, Cookies
-   **Data Fetching:** Axios
-   **Styling:** CSS
-   **Payment Processing** Stripe

### Additional Notes

-   **Database Configuration**:

    -   Ensure MongoDB is running locally or replace `MONGODB_URI` with your database URI.
-   **Stripe Integration**:

    -   Ensure your Stripe API keys and webhook secret are correctly configured in your `.env` file and Stripe Dashboard.
    -   Test payments and webhook events thoroughly in a development environment before deploying to production.

## Screenshots
### Login page
![Screenshot from 2024-06-18 09-00-54](https://github.com/saicharith2012/saas-platform/assets/78155986/92cc2917-c4bb-43b8-be0c-4733b9ceb1e2)

### Landing page
![Screenshot from 2024-06-18 09-01-03](https://github.com/saicharith2012/saas-platform/assets/78155986/f3e3518f-6afa-4060-961b-cb683bd158a8)

### Cart
![Screenshot from 2024-06-18 09-01-22](https://github.com/saicharith2012/saas-platform/assets/78155986/524d65f6-8697-4c11-944f-d31934d50049)

### Stripe Checkout
![Screenshot from 2024-06-18 09-01-50](https://github.com/saicharith2012/saas-platform/assets/78155986/27f66532-eb78-453c-8ba9-e6a226fcf24b)

### Order History
![Screenshot from 2024-06-18 09-02-31](https://github.com/saicharith2012/saas-platform/assets/78155986/4ee1f8de-2f01-4628-93b3-bc8adfe1fda3)

### Super admin dashboard
![Screenshot from 2024-06-18 09-04-26](https://github.com/saicharith2012/saas-platform/assets/78155986/11fc17cc-087b-4ba3-a97d-5baf91bf1ea7)

### Admin Dashboard
![Screenshot from 2024-06-18 09-04-44](https://github.com/saicharith2012/saas-platform/assets/78155986/e70ba631-8d6f-413e-901a-b1b21a2e5cea)

### Browse plans
![Screenshot from 2024-06-18 09-04-51](https://github.com/saicharith2012/saas-platform/assets/78155986/06131650-356f-4ae9-93f0-f2c9e9edbe49)
