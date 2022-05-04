const router = require("express").Router();


//ignore for now

router.post("/", async (req, res) => {
  const newMessage = req.body;
  const db=dbo.client.db("Metagig"); 

  
  try {
    db_connect.collection("Messages").insertOne(
      newMessage
    );
    res.status(200).json(newMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const db=dbo.client.db("Metagig");  
    const messages = await db_connect.collection("Messages").find({conversationId: req.params.conversationId}).toArray((err, result)=> {
      if (err) throw err;
      res.json(result);  
    });

    res.status(200).json(messages);
    }
   
  catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
