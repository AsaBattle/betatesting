import axios from "axios";



export const config = {
    api: {
      bodyParser: {
        sizeLimit: '30mb',
      },
    },
  }


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const userId = req.body.userId;

    let response;
    console.log('Inside testPost.js---- userId:', userId);
     // grab the user's current credits(userData has only the initial call to the server when the user logged in so it's not updated)
     try {                          
        response = await axios.post('https://www.craftful.ai/api/payment/mrmrtesttest', {
            user_id: userId,
            password: 'over9001',
          });

        const user = response.data;
        console.log("Got user data", user);
       
        res.status(200);
      } catch (error) {
        // Until Lucky adds specific error messages we treat an error as meaning the user doesn't exist
        console.error("Error retrieving user '" + userId + "' from database, so treating as if user does not exist" + error);
        return;
      }
  }
}