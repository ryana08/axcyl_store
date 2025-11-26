require 'stripe'
require 'sinatra'
require 'dotenv/load'

# This is your test secret API key.
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

set :static, true
set :port, 4242

YOUR_DOMAIN = 'http://localhost:5500'

# Enable CORS for frontend requests
before do
  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  headers['Access-Control-Allow-Headers'] = 'Content-Type'
end

options '*' do
  200
end

post '/create-checkout-session' do
  content_type 'application/json'
  
  # Parse the cart data from request body
  request_body = JSON.parse(request.body.read)
  cart_items = request_body['items']
  
  # Convert cart items to Stripe line_items format
  line_items = cart_items.map do |item|
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item['name'],
          images: [item['image']], # Optional: include product image
          metadata: {
            size: item['size'],
            color: item['color']
          }
        },
        unit_amount: (item['price'] * 100).to_i, # Convert dollars to cents
      },
      quantity: item['quantity'],
    }
  end
  
  session = Stripe::Checkout::Session.create({
    ui_mode: 'embedded',
    line_items: line_items,
    mode: 'payment',
    return_url: YOUR_DOMAIN + '/html-pages/checkout.html?session_id={CHECKOUT_SESSION_ID}',
  })

  {clientSecret: session.client_secret}.to_json
end

get '/session-status' do
  content_type 'application/json'
  session = Stripe::Checkout::Session.retrieve(params[:session_id])
  {
    status: session.status,
    customer_email: session.customer_details.email
  }.to_json
end

puts "Server running on http://localhost:4242"