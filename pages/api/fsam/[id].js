export default async function handler(req, res) {
    const { id } = req.query;
      
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        // Handle errors, maybe return a specific status code or message
        throw new Error(`Error from Replicate: ${response.statusText}`);
      }
  
      const statusData = await response.json();
      res.status(200).json(statusData);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
  }