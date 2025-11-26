require 'stripe'
require 'sinatra'
require 'dotenv/load'

Stripe.api_key = ENV['STRIPE_SECRET_KEY']

set :static, true
set :port, ENV.fetch('PORT', 4242)
set :bind, '0.0.0.0'

YOUR_DOMAIN = 'http://localhost:5500'

# CORS configuration - must be before routes
configure do
  enable :cross_origin
end

before do
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token'
  response.headers['Access-Control-Max-Age'] = '1728000'
end

options '*' do
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token'
  halt 200
end

post '/create-checkout-session' do
  content_type 'application/json'
  
  request_body = JSON.parse(request.body.read)
  cart_items = request_body['items']
  
  line_items = cart_items.map do |item|
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item['name'],
          images: [item['image']],
          metadata: {
            size: item['size'],
            color: item['color']
          }
        },
        unit_amount: (item['price'] * 100).to_i,
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