Setup Instructions
1. Clone the Repository
First, clone the repository to your local machine:

bash
Copy code
git clone https://github.com/yourusername/your-repository-name.git
2. Install Dependencies
Navigate to the project directory and install the necessary dependencies:

bash
Copy code
npm install
This will install the following dependencies:

express: For handling HTTP requests.
axios: For making HTTP requests to PayPal and Stripe APIs.
paypal: For interacting with the PayPal API.
stripe: For interacting with the Stripe API.
body-parser: For parsing incoming JSON data.
dotenv: For managing environment variables.
3. Set Up Environment Variables
Create a .env file in the root of your project and add the following API keys:

bash
Copy code
STRIPE_SECRET_KEY=your-stripe-secret-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
Make sure to replace the above values with the keys you obtained from your Stripe and PayPal accounts.

4. Deploy to Firebase
Follow these steps to deploy your project to Firebase:

Login with Firebase CLI:
bash
Copy code
firebase login
Initialize Firebase Project:
bash
Copy code
firebase init
Choose the Functions option and select the appropriate Node.js version.
Deploy the Project:
bash
Copy code
firebase deploy --only functions
5. Running Locally (Optional)
To run the project locally, use the following command:

bash
Copy code
npm start
Your server will run at http://localhost:3000.

API Endpoints
1. PayPal - Create Payment
Endpoint: POST /paypal-create-payment

Description: Creates a PayPal payment order. The frontend will redirect the user to PayPal using the returned approval URL.

Request Body:

json
Copy code
{
  "amount": "100"  // Payment amount (in AUD)
}
Response:

json
Copy code
{
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=abc123"
}
Use the approvalUrl to redirect the user to PayPal.

2. PayPal - Capture Payment
Endpoint: POST /paypal-capture-payment
Description: Captures the payment after the user approves it on PayPal.
Request Body:
json
Copy code
{
  "orderId": "abc123"  // The order ID returned by PayPal
}
Response:
json
Copy code
{
  "captureResult": { ... }
}
3. Stripe - Create Payment Intent
Endpoint: POST /stripe-create-payment-intent

Description: Creates a Stripe payment intent. The frontend will use the returned clientSecret to confirm the payment.

Request Body:

json
Copy code
{
  "amount": 1000  // Amount in cents
}
Response:

json
Copy code
{
  "clientSecret": "secret_1234"
}
Use the clientSecret in the frontend to confirm the payment.

4. Stripe - Confirm Payment Intent
Endpoint: POST /stripe-confirm-payment
Description: Confirms a Stripe payment intent.
Request Body:
json
Copy code
{
  "clientSecret": "secret_1234"  // The clientSecret returned from the /stripe-create-payment-intent endpoint
}
Response:
json
Copy code
{
  "status": "succeeded"  // Indicates the payment was successful
}
Testing
PayPal
Use PayPal Sandbox for testing.
You can make test payments with sandbox credit cards in your PayPal sandbox account.
Stripe
Use Stripe Test Mode for testing.
You can use Stripe's test cards to simulate payment transactions.
