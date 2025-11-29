require 'stripe'
require 'dotenv/load'
require 'json'

# Load Sinatra AFTER setting environment
ENV['RACK_ENV'] = 'production'
require 'sinatra/base'

class CheckoutServer < Sinatra::Base
  Stripe.api_key = ENV['STRIPE_SECRET_KEY']

  set :port, ENV.fetch('PORT', 4242)
  set :bind, '0.0.0.0'
  
  # Disable ALL Rack::Protection
  set :protection, false
  
  # CORS
  before do
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
  end

  options '*' do
    200
  end

  get '/' do
    "Server is running!"
  end

  post '/create-checkout-session' do
    content_type 'application/json'

    begin
      request_body = JSON.parse(request.body.read)
      cart_items = request_body['items'] || []

      halt 400, { error: "Cart is empty" }.to_json if cart_items.empty?

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
            unit_amount: (item['price'].to_f * 100).to_i
          },
          quantity: item['quantity'].to_i
        }
      end

      session = Stripe::Checkout::Session.create(
        ui_mode: 'embedded',
        line_items: line_items,
        mode: 'payment',
        return_url: 'https://yanxander.com/html-pages/checkout.html?session_id={CHECKOUT_SESSION_ID}'
      )

      { clientSecret: session.client_secret }.to_json

    rescue Stripe::StripeError => e
      status 402
      { error: e.message }.to_json
    rescue => e
      status 500
      { error: e.message }.to_json
    end
  end

  get '/session-status' do
    content_type 'application/json'

    begin
      session_id = params[:session_id]
      halt 400, { error: "Missing session_id" }.to_json if session_id.nil? || session_id.strip.empty?

      session = Stripe::Checkout::Session.retrieve(session_id)

      {
        status: session.status,
        customer_email: session.customer_details&.email
      }.to_json

    rescue Stripe::StripeError => e
      status 402
      { error: e.message }.to_json
    rescue => e
      status 500
      { error: e.message }.to_json
    end
  end

  run! if app_file == $0
end