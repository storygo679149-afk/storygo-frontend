import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/responsive.css';
import './App.css';

const rootElement = document.getElementById('root');
const loadingElement = document.querySelector('.app-loading');
if (loadingElement) loadingElement.remove();

const root = ReactDOM.createRoot(rootElement);

const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Only load Stripe if key exists and we're on a page that uses payments
// But since React renders the whole app, we need to conditionally render Stripe provider.
// Alternative: lazy load Stripe only when needed using dynamic import.

if (stripeKey) {
  // Dynamically import Stripe and its React provider only when needed
  // But we need to render the provider at the root. So we'll still load it.
  // To reduce tracking warnings, we can load Stripe in a way that doesn't run on every page?
  // Actually, Stripe's script will still run and may cause warnings.
  // There's no perfect solution except to accept the warnings.
  Promise.all([import('@stripe/stripe-js'), import('@stripe/react-stripe-js')])
    .then(([stripeJs, reactStripe]) => {
      const stripePromise = stripeJs.loadStripe(stripeKey);
      root.render(
        <React.StrictMode>
          <reactStripe.Elements stripe={stripePromise}>
            <App />
          </reactStripe.Elements>
        </React.StrictMode>
      );
    })
    .catch(err => {
      console.error('Failed to load Stripe:', err);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    });
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}