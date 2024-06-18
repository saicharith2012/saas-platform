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

1.  Clone the repository:

    `git clone https://github.com/your_username/your_repository.git
    cd your_repository`

2.  Install dependencies:
    `npm install
    or
    yarn install`

### Setting Up Environment Variables

1.  Create a `.env` file in the root directory of the project.

2.  Add the following environment variables to `.env`:

    `PORT=5000
    MONGODB_URI=mongodb://localhost:27017/your_database_name`

    Replace `your_database_name` with the name of your MongoDB database.

### Running the Application

1.  Start the backend server:
    `npm start`

    This will start the backend server at `http://localhost:5000`.

2.  Start the frontend development server:

    `npm start`

    This will start the frontend server and open the application in your default web browser at `http://localhost:3000`.

### Usage

-   **Login:** Access the login page at `http://localhost:3000/login` and log in using super admin credentials.
-   **Super Admin Dashboard:** After logging in, you'll be redirected to the Super Admin Dashboard where you can create organizations and add admins.
-   **Creating Organizations:** Fill out the form with the organization name, billing email, and admin details (name, email, password) to create a new organization and assign an admin.
-   **Logout:** Click on the "Logout" button in the navigation bar to log out from the application.

### Built With

-   **Frontend:** React, React Router, Redux Toolkit, Axios
-   **Backend:** Node.js, Express, MongoDB
-   **Authentication:** JWT, Cookies
-   **Data Fetching:** Axios
-   **Styling:** CSS, Bootstrap (optional)https://github.com/saicharith2012/saas-platform

## Screenshots
### Login page
![Screenshot from 2024-06-18 09-00-54](https://github.com/saicharith2012/saas-platform/assets/78155986/92cc2917-c4bb-43b8-be0c-4733b9ceb1e2)


### Landing page
### Cart
### Stripe Checkout
### Order History
### Super admin dashboard
### Admin Dashboard
### Browse plans
