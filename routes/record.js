const router = require('express').Router();
const dbo = require("../db/conn");             //database connection
const multer = require("multer");
const path = require('path');
const fs = require("fs");
const axios = require("axios")
var ObjectID = require('mongodb').ObjectID;  
//used to store image files
const storage = multer.diskStorage({
  destination: "public",
  filename: function(req, file, cb){
     cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });





//Ignore this endpoint
router.route("/Seller").get(async(req, res)=> {
  let db_connect =dbo.client.db("Metagig");
  db_connect.collection("Services").findOne(
    {},
    { sort: { _id: -1 } },
    (err, data) => {
      if (err) throw err;
      res.json(data);
    },
  );
});



//create user
router.route("/Users/Profile:UserID").post(upload.single('ImagePreview'), async (req, res)=> {
  let db_connect = dbo.client.db("Metagig");
  const user_body=req.body;
  var img = await fs.readFileSync(req.file.path);
  var encode_img = img.toString('base64');
  var final_img = {
  contentType:req.file.mimetype,
  image:new Buffer(encode_img,'base64')
};

  const user_Insert={...user_body,Image:final_img,Gigs:[],Level:'Newbie',Rating:0,Reviews:[]};
  
  db_connect.collection("Users").insertOne(user_Insert, function(err, result) {
    if (err) {
      console.log("fetch..............................Error:" + err);
      res.send(err)
    };
    console.log("1 document inserted:"+result);
    res.send('okay');
  });
});

    
//fetch user with id
router.route("/Users/Profile/:UserID").get((req, res)=> {
  let db_connect = dbo.client.db("Metagig");
 
  let userQuery = {_id:new ObjectID(req.params.UserID)};
  
  console.log(userQuery);
   
  db_connect.collection("Users").findOne(userQuery, function(err, result){
   if (err) throw err;
   //console.log(result);
   res.json(result);  
});
})


//fetch user with email
router.route("/Users/Current/:UserID").get((req, res)=> {
  let db_connect = dbo.client.db("Metagig");
 
  let userQuery = {Email:req.params.UserID};
  
  console.log(userQuery);
   
  db_connect.collection("Users").findOne(userQuery, function(err, result){
   if (err) throw err;
  
   res.json(result);  
});
})


//Create a new Gig
 router.route("/Gig:UserID").post(upload.single('ImagePreview'), async (req, res)=> {
  let db_connect = dbo.client.db("Metagig");
  const gig_body=req.body;
  var img = await fs.readFileSync(req.file.path);
  var encode_img = img.toString('base64');

  var final_img = {
    contentType:req.file.mimetype,
    image:new Buffer(encode_img,'base64')
};


  const gig_Insert={...gig_body ,Image:final_img}
  
  db_connect.collection("Gigs").insertOne(gig_Insert, function(err, result) {
    if (err) {
      console.log("fetch..............................Error:" + err);
      res.send(err)
    };

    console.log("Gig Saved:"+result);
    res.json(result);
    
  });
});






//Fetch Seller's Gigs
router.route("/Users/:id/my_gigs").get( function (req, res) {
  let db_connect = dbo.client.db("Metagig");
  const ID =  req.params.id;
  let sellerQuery = {SellerID:ID};
  db_connect.collection("Gigs").find(sellerQuery).toArray((err, result)=> {
      if (err) throw err;
      res.json(result);  
    });
  });

  //Fetch All Gigs
router.route("/All_Gigs").get( function (req, res) {
  let db_connect = dbo.client.db("Metagig");
  
  db_connect.collection("Gigs").find({}).toArray((err, result)=> {
      if (err) throw err;
      res.json(result);  
    });
  });


  //Fetch Seller's Single  Gig
  router.route("/Gig/:id").get( function (req, res) {
    let db_connect = dbo.client.db("Metagig");
    const ID =  req.params.id;
    console.log(ID);
    
    let gigQuery = {_id:new ObjectID(req.params.id)};
    db_connect.collection("Gigs").findOne(gigQuery, function(err, result){
        if (err) throw err;
        res.json(result);  
      });

    });





//Create new conversation
router.route("/conversation").post( async(req, res)=> {
  let db_connect = dbo.client.db("Metagig");

// current timestamp in milliseconds
let ts = Date.now();

let date_ob = new Date(ts);
let date = date_ob.getDate();
let month = date_ob.getMonth() + 1;
let year = date_ob.getFullYear();

  // prints date & time in YYYY-MM-DD format
  date_today=year + "-" + month + "-" + date;


  var chat_data={
    sender_name:req.body.sender_name,
    Gig_Title:req.body.Gig_Title,
    Time:date_today,
  }

    console.log(req.body);

    const members=[await req.body.senderId,
    await req.body.receiverId, chat_data];

   db_connect.collection("Conversations").insertOne({members}, function(err, result) {
    if (err) {
      console.log("fetch..............................Error:" + err);
      res.send(err)
    };
    res.json(result);
  });

});




//get a conversation of one user 

router.route("/Conversation/:userId").get( async(req, res) => {

  const db=dbo.client.db("Metagig");

  console.log(req.params.userId);
  
  try{
   const convo=db.collection("Conversations").find({
      members: { $in: [req.params.userId] }
    }).toArray((err, result)=> {
      if (err) throw err;
      res.status(200).json(result);
       
    });
  
} catch (err) {
  console.log(err);
  res.status(500).json(err);
}
});


//Buyer order's service

router.route("/Orders/:Seller_Id").post( (req, res) => {
  let db_connect = dbo.client.db("Metagig");
 
  let userQuery = {_id:new ObjectID(req.params.Seller_Id)};
  
 
  console.log(userQuery);
   
  db_connect.collection("Users").findOne(userQuery, function(err, result){
   
    if (err) throw err;

   console.log(result);
   
   const  gig_id=req.body.gig;


   var newvalues = { $push:{Gig:gig_id} };
   
   db_connect.collection("Users").updateOne(userQuery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    
  });
   //
});
});


//Fetch a User's active Orders
router.route("/Orders").post((req, res) => {

   let db_connect = dbo.client.db("Metagig");

   const gigs_ids=req.body.gigs_id_array;

   console.log(req.body,"empty");

   for(var i=0;i<gigs_ids.length;i++){
     var gig_store=[];
     let userQuery = {_id:new ObjectID(gigs_ids[i])};
     db_connect.collection("Gigs").findOne(userQuery, function(err, result){
     if (err) throw err;    
     gig_store.push(result);
    
     console.log(gig_store.length);
    
     if(gig_store.length>=gigs_ids.length){
      console.log('ok');
      res.json(gig_store);
 
    }
    }); 
 }

});


//save messages

router.route("/messages").post( async (req, res) => {
  const newMessage = req.body;
  const db=dbo.client.db("Metagig"); 
  
  // current timestamp in milliseconds
let ts = Date.now();

let date_ob = new Date(ts);
let date = date_ob.getDate();
let month = date_ob.getMonth() + 1;
let year = date_ob.getFullYear();

// prints date & time in YYYY-MM-DD format
date_today=year + "-" + month + "-" + date;
newMessage.date=date_today;

  try{
    db.collection("Messages").insertOne(
      newMessage ,(err,result) => {
        if (err) throw err;
        console.log(result);
        res.status(200).json(newMessage);    
      });
  } catch (err) {
    res.status(500).json(err);
  }});

//get Messages

router.route("/messages/:conversationId").get(async (req, res) => {
  try {
    const db=dbo.client.db("Metagig");  
    const messages = await db.collection("Messages").find({conversationId: req.params.conversationId}).toArray((err, result)=> {
      if (err) throw err;
      res.json(result);  
    }) 
    
  }
   
  catch (err) {
    res.status(500).json(err);
  }
});


//Make payments

// Install with: npm i flutterwave-node-v3

router.route("/Widthraw").post( async (req, res) => {
  const newPayment = req.body;
  const db=dbo.client.db("Metagig");
  const Flutterwave = require('flutterwave-node-v3');
  const flw = new Flutterwave(process.env.PBK, process.env.PVK);
  console.log(process.env.PBK);

  const initTrans =  async () =>{
 
    try {

        const payload = {   

          "account_bank": "044", 
          "account_number": "0690000031",
          "amount": 200,
          "narration": "ionnodo",
          "currency": "NGN",
          "reference": "dfs23fhr7ntg0293039_PMCK", //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
          "callback_url": "localhost:3000/api/Widthraw/callback",
          "debit_currency": "KES"
     };

       const response =  await flw.Transfer.initiate(payload);
       console.log(response);

    } catch (error) {

      console.log(error);

    }   
    
   
   
}

initTrans();
 

});





module.exports = router;


