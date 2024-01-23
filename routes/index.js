var express = require('express');
var router = express.Router();
const userModel= require("./users");
const postModel= require("./post");
const commentModel = require('./comment');
const passport = require('passport');
const localstrategy= require("passport-local");
passport.use(new localstrategy(userModel.authenticate()));
const upload = require("./multer");
const post = require('./post');
router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});

router.get('/register', function(req, res, next) {
  res.render('register',{nav:false}) ;
});

router.get('/profile',isLoggedIn,async function(req, res, next) {
  const user= 
  await userModel
  .findOne({username:req.session.passport.user})
  .populate("posts")
  res.render("profile",{user,nav:true});
});
router.get('/feed',isLoggedIn,async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user})
 const posts=await postModel.find()
  .populate("user")
  res.render("feed",{user,posts,nav:true}); 
});

router.get('/show/posts',isLoggedIn,async function(req, res, next) {
  const user= 
  await userModel
  .findOne({username:req.session.passport.user})
  .populate("posts")
  res.render("show",{user,nav:true});
});

router.route('/pin/:id')
  .get(isLoggedIn, async function (req, res, next) {
    const postId = req.params.id;
    const UserPost = await post.findById(postId).populate('user');
    const { user } = UserPost;
    const comments = await commentModel.find({ postId }).populate('user').sort({ createdAt: 'desc' });
    res.render('pin', { UserPost, user, comments, nav: true });   
  });  
  router.post('/pin/:id/add-comment', isLoggedIn, async function (req, res) {
      const postId = req.params.id;
      const { comment } = req.body;
  
      const commenter = req.user; // Assuming you have user information in req.user
  
      // Create a new comment
      const newComment = await commentModel.create({
        text: comment,
        user: commenter._id,
        postId: postId,
        commenter: {
          username: commenter.username,
          avatar: commenter.profileImage // Assuming 'profileImage' is the property for user avatar
        }
      });
  
      // Add the new comment to the post's comments array
      const post = await postModel.findById(postId);
      post.comments.push(newComment);
      await post.save();
  
      // Redirect back to the pin page
      res.redirect(`/pin/${postId}`);
  });
  
router.get('/add',isLoggedIn,async function(req, res, next){
  const user= await userModel.findOne({username:req.session.passport.user});
  res.render("add",{user,nav:true});
});

router.post('/createpost',isLoggedIn,upload.single("postimage"),async function(req, res, next){
  const user= await userModel.findOne({username:req.session.passport.user});

 const post=await postModel.create({
    user: user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename,
  });
     user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
});

router.post('/fileupload',isLoggedIn, upload.single("image"),async function(req, res, next) {
const user= await userModel.findOne({username:req.session.passport.user}); 
user.profileImage=req.file.filename;
await user.save();
res.redirect("/profile");
});

router.post('/register', function(req, res, next) {
  const data= new userModel({
    username:req.body.username,
    name:req.body.fullname,
    email:req.body.email,
    contact:req.body.contact
  })
  userModel.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })
  });

router.post('/login',passport.authenticate("local",{
  failureRedirect: "/",
  successRedirect: "/feed",

}), function(req, res, next) {});
router.get("/logout", function(req,res,next){
  req.logout(function(err){
    if(err){
      return next(err);
    }
    res.redirect('/')
  })
}) 
function isLoggedIn(req,res,next){
if(req.isAuthenticated()){
  return next();
}
res.redirect("/")
}
module.exports = router;
