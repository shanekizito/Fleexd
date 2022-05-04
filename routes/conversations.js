const router = require("express").Router();

const dbo = require("../db/conn");             //database connection





//ignore for now


// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  db=dbo.client.db("Metagig");  

  try {
    const conversation = await db.collection("Conversations").findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
