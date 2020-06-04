const mongoose = require('mongoose');
mongoose.set('useUnifiedTopology', true);
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try{
        await mongoose.connect(db,{useNewUrlParser:true});
        console.log("MongoDB is connected!");
    } catch(err){
        console.log(err.message);
        //Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;