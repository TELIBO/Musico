import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
    {
        name:{type:String,required:true},
        desc:{type:String,
        required:true},
        album:{type:String,
        required:true},
        image:{type:String,
        required:true},
        file:{type:String,
        required:true},
        duration:{type:String,
        required:true},
        mood:{type:String, enum:['chill','hype','sad','focus','party','any'], default:'any'},
        creatorId:{type:String, default:''},
        creatorName:{type:String, default:'Anonymous'}
}
)

const songModel = mongoose.models.song || mongoose.model("song",songSchema);

export default songModel;