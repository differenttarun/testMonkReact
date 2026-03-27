const mongoose = require('mongoose');
const mongodbURI = "mongodb://192.168.68.107:27017/fastdb"

// const connectToMongo =  () =>{
//     console.log("connecting to db");
//     mongoose.connect(mongodbURI)
//      .then(() => console.log("Connected"))
//     .catch(err => console.error("Error:", err));
//     };

async function connectToMongo() {
  try {
    console.log("connecting to db");
    await mongoose.connect(mongodbURI);
    console.log( "DB Connected");
  } catch (err) {
    console.error(" DB Error:", err);
  }
}

module.exports = connectToMongo;