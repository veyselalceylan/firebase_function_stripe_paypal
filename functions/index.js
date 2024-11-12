const functions = require('firebase-functions');
const express = require('express');
const Stripe = require('stripe');
const dotenv = require('dotenv');
const cors = require('cors');
var axios = require('axios');
const bodyParser = require('body-parser');
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:4200', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'application/json' }));
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const clientId = 'AT75dqw2g8kr4n-VNehToAn1kl_O-CTDi4hrEQNeLnwUI3H9t4lo1QwlXbKQ_NCZKYuEXb0fBKTrygTi';
const clientSecret = 'EOZaWi9k4Y4wcpqG8EaXdEk1xmYMxCZmeC9Vfop5RJUEW9FErzlCyc2dCpzqjy3U_0TzBW-vBPCp0i65';
const stripe = Stripe('sk_test_51Q2Um303O6rQE5P2HrzAafhVhuznV4Y6M7Ul9BtzL1yrUkVXSvLWA2r4bfSAL1GMFla6iGghL9xZcxh3wkVrQUUZ006ZCOTbWI');

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, paymentMethod, address, name } = req.body;
    const paymentMethodTypes = () => {
      if (paymentMethod === 'afterpay') {
        return ['card', 'afterpay_clearpay'];
      } else if (paymentMethod === 'paypal') {
        return ['card', 'paypal'];
      } else {
        return ['card'];
      }
    };
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'aud',
      payment_method_types: paymentMethodTypes,
      shipping: {
        name: name,
        address: address
      },
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/payment-intent-status/:id', (req, res) => {
  const paymentIntentId = req.params.id;
  stripe.paymentIntents.retrieve(paymentIntentId)
    .then((paymentIntent) => {
      res.json({
        status: paymentIntent.status, 
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

async function getPayPalAccessToken() {
  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: {
        username: clientId,
        password: clientSecret,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data.access_token;
}

app.post('/paypal-create-payment', async (req, res) => {
  const { amount } = req.body;
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'AUD',
              value: amount,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const approvalUrl = response.data.links.find(link => link.rel === 'approve').href;
    res.json({ approvalUrl });
  } catch (error) {
    console.error('Ödeme oluşturulurken hata oluştu:', error);
    res.status(500).json({ error: 'Ödeme oluşturulurken hata oluştu.' });
  }
});

app.post('/paypal-capture-payment', async (req, res) => {
  const { orderId } = req.body;
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ captureResult: response.data });
  } catch (error) {
    console.error('Ödeme yakalanırken hata oluştu:', error);
    res.status(500).json({ error: 'Ödeme yakalanırken hata oluştu.' });
  }
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

exports.app = functions.https.onRequest(app)