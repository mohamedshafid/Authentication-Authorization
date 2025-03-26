import mongoose from "mongoose";

export const dbConnect=async()=>{
    try{

        await mongoose.connect(process.env.MONGO_URI); // CONNECTING TO DATABASE.
    }catch(err){
        console.log("Error in connecting to database",err);  // ERROR IN CONNECTING TO DATABASE.
    }
}
