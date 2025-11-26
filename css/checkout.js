// Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_51SUFRnEBQHIgcmdH0Non6Cp12H26qrIzUGN0LczE5vIz6UDVx4hvZR2dFSb4Z8IM1eQnpaxo3E8991Ly5YyiipSO00K43E3Wyc');

// Check if this is a return from payment
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  showOrderStatus(sessionId);
} else {
  initializeCheckout();
}

async function initializeCheckout() {
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if cart is empty
  if (cart.length === 0) {
    document.getElementById('checkout').innerHTML = `
      <div style="text-align: center; padding-top: 100px;">
        <h2>Your cart is empty</h2>
        <a href="../html-pages/store.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: black; color: white; text-decoration: none; text-transform: uppercase;">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  // Function to fetch client secret from server
  async function fetchClientSecret() {
    const response = await fetch('https://web-production-6c5dc.up.railway.app/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cart }), // Send cart items
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  }

  // Initialize and mount Checkout
  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });

  checkout.mount('#checkout');
}

async function showOrderStatus(sessionId) {
  const response = await fetch(`https://web-production-6c5dc.up.railway.app/session-status?session_id=${sessionId}`);
  const session = await response.json();

  const checkoutDiv = document.getElementById('checkout');
  
  if (session.status === 'complete') {
    // Clear the cart after successful payment
    localStorage.removeItem('cart');
    
    checkoutDiv.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2>✓ Payment Successful!</h2>
        <p>Thank you for your purchase.</p>
        <p>A confirmation email will be sent to: <strong>${session.customer_email}</strong></p>
        <a href="../index.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: black; color: white; text-decoration: none;">Continue Shopping</a>
      </div>
    `;
  } else {
    checkoutDiv.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2>Payment Incomplete</h2>
        <p>Your payment was not completed. Please try again.</p>
        <button onclick="window.location.href='checkout.html'" style="margin-top: 20px; padding: 10px 20px; background: black; color: white; border: none; cursor: pointer;">Try Again</button>
      </div>
    `;
  }
}