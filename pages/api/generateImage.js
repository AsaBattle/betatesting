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
    try {
      const response = await axios.post("https://www.fulljourney.ai/genimage", req.body);
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error in /api/generateImage:", error);
      res.status(500).json({ message: "Failed to generate the image. Please try again." });
    }
  } else {
    // Handle any requests that aren't POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}