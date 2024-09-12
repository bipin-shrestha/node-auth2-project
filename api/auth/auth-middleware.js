const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const userModel = require('../users/users-model.js');

const restricted = (req, res, next) => {
  /*
    If the user does not provide a token in the Authorization header:
    status 401
    {
      "message": "Token required"
    }

    If the provided token does not verify:
    status 401
    {
      "message": "Token invalid"
    }

    Put the decoded token in the req object, to make life easier for middlewares downstream!
  */
 try {
 const token = req.headers.authorization?.split(' ')[1];
  if(token){
    jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
      if(error) {
        next({ apiCode: 401, apiMessage: " Token Invalid " })
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
    } else {
    next({ apiCode: 401, apiMessage: " Token Required " })
  }
 } 
 catch(error){
   console.log(error);
   next({ apiCode: 500, apiMessage: 'error validating credentials', ...error });
 }
}

const only = role_name => (req, res, next) => {
  /*
    If the user does not provide a token in the Authorization header with a role_name
    inside its payload matching the role_name passed to this function as its argument:
    status 403
    {
      "message": "This is not for you"
    }

    Pull the decoded token from the req object, to avoid verifying it again!
  */
    console.log(req.decodedToken);
    
    if(req.decodedToken.role_name == role_name){
      next();
    }
    else{
      next({ apiCode: 403, apiMessage: "This is not for you" })
    }
}

const checkUsernameExists = async (req, res, next) => {
  /*
    If the username in req.body does NOT exist in the database
    status 401
    {
      "message": "Invalid credentials"
    }
  */
//  const {username} = req.body.username;
//  const user = User.findBy(username);
//  if(!user){
//     return res.status(401).json({ message: " Invalid Credentials "})
//   } else {
//     req.user = user;
//     next();
//   }

 const user = await userModel.findBy({ username: req.body.username });
 if(user.length > 0){
   next();
 } else {
   res.status(401).json({ message: "Invalid credentials." });
 }
}


const validateRoleName = (req, res, next) => {
  /*
    If the role_name in the body is valid, set req.role_name to be the trimmed string and proceed.

    If role_name is missing from req.body, or if after trimming it is just an empty string,
    set req.role_name to be 'student' and allow the request to proceed.

    If role_name is 'admin' after trimming the string:
    status 422
    {
      "message": "Role name can not be admin"
    }

    If role_name is over 32 characters after trimming the string:
    status 422
    {
      "message": "Role name can not be longer than 32 chars"
    }
  */
//  const user = await userModel.findBy({ role_name: req.body.role_name });
const roleName = req.body.role_name?.trim();
  if(!roleName) {
    return req.body.role_name = 'student';
  }else if(roleName === 'admin'){
    return res.status(422).json({ message: 'Role name can not be admin'});
  }else if(roleName.length > 32) {
    res.status(422).json({ message: 'Role Name can not be longer than 32 chars.'});
  } else {
    req.body.role_name = roleName;
    next();
  }
}

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only
}
