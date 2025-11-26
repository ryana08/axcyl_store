require 'sinatra'
require 'sinatra/cors'
require 'stripe'
require 'dotenv'
require 'uri'

Dotenv.load

Stripe.api_key = ENV['STRIPE_SECRET_KEY']

configure do
  set :static, true
  set :port, ENV.fetch('PORT', 4242)
  set :bind, '0.0.0.0'
  set :protection, false

  # -----------------------------------------
  # Host Authorization (Option A - Recommended)
  # -----------------------------------------
  permitted_hosts = []

  if ENV['PUBLIC_URL'] && !ENV['PUBLIC_URL'].empty?
    begin
      permitted_hosts << URI.parse(ENV['PUBLIC_URL']).host
    rescue StandardError
      # ignore parsing errors
    end
  end

  permitted_hosts << '.localhost'
  permitted_hosts << '127.0.0.1'
  permitted_hosts << '::1'

  permitted_hosts = permitted_hosts.compact.uniq

  set :host_authorization, { permitted_hosts: permitted_hosts }

  # -----------------------------------------
  # CORS settings
  # -----------------------------------------
  set :allow_origin, ENV.fetch('PUBLIC_URL', '*')
  set :allow_methods, "GET,POST,OPTIONS"
  set :allow_headers, "content-type"
end

before do
  headers 'Access-Control-Allow-Origin' => ENV.fetch('PUBLIC_URL', '*'),
          'Access-Control-Allow-Methods' => 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers' => 'Content-Type,Authorization'
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
    domain_url = ENV['PUBLIC_URL']
    halt 400, { error: "PUBLIC_URL environment variable not set" }.to_json if domain_url.nil? || domain_url.strip.empty?

    request_body = JSON.parse(request.body.read)
    cart_items = request_body['items'] || []

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
          unit_amount: (item['price'] * 100).to_i
        },
        quantity: item['quantity']
      }
    end

    session = Stripe::Checkout::Session.create(
      success_url: "#{domain_url}/html-pages/checkout.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "#{domain_url}/html-pages/cart.html",
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: line_items
    )

    { id: session.id }.to_json

  rescue Stripe::StripeError => e
    status 402
    { error: e.message }.to_json
  rescue => e
    status 500
    { error: e.message }.to_json
  end
end