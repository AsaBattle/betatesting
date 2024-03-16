import axios from 'axios';


export const config = {
    api: {
      bodyParser: {
        sizeLimit: '30mb',
      },
    },
  }
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const body = {
            version: '371aeee1ce0c5efd25bbef7a4527ec9e59188b963ebae1eeb851ddc145685c17',
            input: req.body, // Assuming the body sent to this API endpoint already contains the FastSAM-specific parameters
        };

        console.log('Request body is:', body);

        try {
            const response = await axios.post('https://api.replicate.com/v1/predictions', body, {
                headers: {
                    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            res.status(200).json(response.data);
        } catch (error) {
            console.error('Server error:', error); // Log the error for server-side debugging
            res.status(500).json({ message: `Internal server error: ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}