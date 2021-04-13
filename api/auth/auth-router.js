const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const userModel = require('../users/users-model.js');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require("../secrets"); // use this secret!
const bcryptjs = require("bcryptjs");

router.post("/register", validateRoleName, async (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
  const credentials = req.body;
  console.log(credentials);
  try{
    const hash = bcryptjs.hashSync(credentials.password, 10);
    credentials.password = hash;

    const user = await userModel.add(credentials);
    const token = generateToken(user);
    res.status(201).json({ data: user, token })
  }
  catch(err){
    console.log(err);
    next({ apiCode:500, apiMessage: 'error saving new User', ...err });
  }
});


router.post("/login", checkUsernameExists, async (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
  const { username, password } = req.body;
  try{
    const [user] = await userModel.findBy({ username: username });
    console.log(user);
    if(user && bcryptjs.compareSync(password, user.password)){
      const token = generateToken(user);
      console.log(token);
      res.status(200).json({ message: 'Welcome to the api', token: token })
    } else {
      next({ apiCode: 401, apiMessage: 'Invalid Credentials'});
    }
  }
  catch(err){
    console.log(err);
    next({ apiCode: 500, apiMessage: 'db error logging in ', ...err})
  }
});

const generateToken = (user) => {
  console.log(user);
  const options = {
    expiresIn: '1 day'
  };
  const payload = {
    subject: user.user_id,
    username: user.username,
    role_name: user.role_name
  };
  console.log(payload);
  console.log(JWT_SECRET);
  console.log(jwt.sign(payload, JWT_SECRET, options));
  return jwt.sign(payload, JWT_SECRET, options);
  
}

module.exports = router;
