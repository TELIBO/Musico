import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
    {
        name:{type:String,required:true},
        desc:{type:String,required:true},
        bgColour:{type:String,
        required: true},
        image:{
        type:String,
        required:true
        },
        creatorId:{type:String, default:''},
        creatorName:{type:String, default:'Anonymous'}
    }
)
const albumModel= mongoose.models.album || mongoose.model("album",albumSchema)

export default albumModel;