const mongoose= require('mongoose');

const postSchema= mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  title:String,
  description:String,
  image:String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

module.exports= mongoose.model("post",postSchema);