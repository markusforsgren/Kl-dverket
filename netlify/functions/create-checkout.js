const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const body = JSON.parse(event.body);
    const { product, qty, price, tech, pos, colors, size, name, email, company, phone, notes } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sek',
          product_data: {
            name: `${product} med tryck`,
            description: `${qty} st · ${size} · ${tech} · ${pos}${colors !== '1 färg' ? ` · ${colors}` : ''}${company ? ` · ${company}` : ''}`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: qty,
      }],
      customer_email: email,
      metadata: {
        customer_name: name,
        company: company || '',
        phone: phone || '',
        product,
        size,
        qty: String(qty),
        tech,
        placement: pos,
        colors,
        notes: notes || '',
      },
      mode: 'payment',
      success_url: `${event.headers.origin}/success.html`,
      cancel_url: `${event.headers.origin}/#bestall`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
