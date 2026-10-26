// Vercel Serverless Function to dynamically serve Paystack public key from Environment Variables
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const paystackPublicKey = 
    process.env.PAYSTACK_PUBLIC_KEY || 
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 
    'pk_test_d34f0c978b27357492c73042186716091726a57c'; // Fallback test key

  return res.status(200).json({
    status: 'success',
    paystackPublicKey: paystackPublicKey,
    environment: paystackPublicKey.startsWith('pk_live_') ? 'live' : 'test',
    cinemaId: 'oja-fa0483dd',
    tag: 'cimen-boxoffice'
  });
}
