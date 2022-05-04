const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require('node-fetch');
const socketio = require('socket.io');
const http = require('http').Server(app);
const helmet = require("helmet");
app.use(cors());
require("dotenv").config({ path: "./config.env" });
const port = 8080;
const { default: axios } = require("axios");
const { checkJwt } = require("./AuthO/Auth.js");

const { clientOrigins, serverPort } = require("./configs.js");




const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.json())


//API controllers
app.use(require('./routes/record'));
app.use(require('./routes/conversations'));
app.use(require('./routes/messages'));



// get Database driver connection
const dbo = require("./db/conn");
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');





app.get("/dashboard", (req, res) => {
  try {
    res.send("done");
  } catch (error) {
    console.log(error);
    if (error.response.status === 401) {
      res.status(401).json("Unauthorized to access data");
    } else if (error.response.status === 403) {
      res.status(403).json("Permission denied");
    } else {
      res.status(500).json("Whoops, something went wrong");
    }
  }
});



app.get("/Users", async (req, res) => {
  try {
      const accessToken=req.headers.authorization.split(' ')[1];
      const response =await axios.get('https://metagig.us.auth0.com/userinfo',{
        headers: {
          authorization: `Bearer ${accessToken}`
        }

      });

  const userinfo=response.data;
  res.send(userinfo);
 } catch(error){
   res.send(error.message)
  }
});


//perform a database connection when server starts


http.listen(port, () => {
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});


