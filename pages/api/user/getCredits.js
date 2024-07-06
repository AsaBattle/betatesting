
export const config = {
    api: {
      bodyParser: {
        sizeLimit: '30mb',
      },
    },
  }


export default async function handler(req, res) {
  if (req.method === 'GET') {
    const userId = req.body.userId;

    let response;

     // grab the user's current credits(userData has only the initial call to the server when the user logged in so it's not updated)
     try {
        response = await axios.get(`http://3.19.250.209:36734/user/${userId}`);
        const user = response.data;
        currentCredits = user.credits;
        currentCredits = parseInt(currentCredits);
       
        res.status(200).json({ credits: currentCredits });
      } catch (error) {
        // Until Lucky adds specific error messages we treat an error as meaning the user doesn't exist
        console.error("Error retrieving user from database, so treating as if user does not exist" + error);
        return { worked: false, reasonCode: 5, reason: "User doesn't exist." };
      }
  }
}