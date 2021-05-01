const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const redis = require('redis');
var Busboy = require('busboy');
var rand = require("random-key");
var URL = require('url');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cors = require('cors');

const SECRETKEY = 'shhhhh';
const TOKEN_TIME = 1 * 60 * 60 * 1000;
//const TOKEN_TIME = 1 * 30 * 1000;

// Port
const PORT = 3000;

// Init app
const app = express();
app.use(cors());

// Create Redis Client
let client = redis.createClient();
let clientBuff = redis.createClient({ return_buffers : true });

client.on('connect', function(){
  console.log('Connected to Redis...');
});

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: SECRETKEY}));

// Initialize database
// Keywords
const STRING = 'text';
const INTEGER = 'number';
const DATE_TIME = 'datetime-local';
const DATE = 'date';
const IMAGE = 'image';
const VIDEO = 'video';
const AUDIO = 'audio';
const CREATE = 'create';
const EDIT = 'edit';

const USERNAME = 'username';
const PASSWORD = 'password';
const FIRSTNAME = 'firstname';
const LASTNAME = 'lastname';
const ROLE = 'role';
const ROLES = ['Admin', 'Update', 'Read'];
const FILES = [VIDEO, IMAGE, AUDIO];

categories = [{category:'middleAges', name:'Middle ages', key:'middleAgesKey'}, {category:'prehistory', name:'Prehistory', key:'prehistoryKey'}
  , {category:'materialCulture', name:'Material Culture', key:'materialCultureKey'}];
allCategories = {};
const CATEGORY = 'category';
const SEARCH = 'search';
const NAZIV = 'Naziv';
keys = [];

setTimeout(renewDatabase, 300);
setTimeout(getCategories, 1000);

function getCategories(){
  for(var cat of categories){
    (function(key){
      client.hgetall(cat.key, function(err, results){
        var number = 0;
        var hasImage = false;
        for(var el of Object.values(results)){
          if(FILES.includes(el))
            number++;
          if(el==IMAGE)
            hasImage = true;
        }
        results.numberOfFiles = number;
        results.hasImage = hasImage;
        allCategories[key] = results;
      });
    })(cat.key);
  }
}

function renewDatabase(){
  var enterCategories = [];
  for(var i=0; i<categories.length; i++){
    enterCategories.push('name' + i, categories[i].name,
      'key' + i, categories[i].key);
    if(i==2)
    client.hmset(categories[i].key, [
      NAZIV, STRING,
      'Starost', INTEGER,
      'Datum porijekla', DATE,
      'Slika', IMAGE,
      'Video', VIDEO
    ]);
    else if (i==0)
    client.hmset(categories[i].key, [
      NAZIV, STRING,
      'Video', VIDEO
    ]);
    else
    client.hmset(categories[i].key, [
      NAZIV, STRING,
      'Starost', INTEGER,
      'Datum i vrijeme porijekla', DATE_TIME,
      'Pjesma', AUDIO
    ]);
  }
  client.hmset(CATEGORY, enterCategories);

  // users
  bcrypt.hash('admin', saltRounds, function(err, hash) {
    client.hmset('user:admin', [
      USERNAME, 'admin',
      FIRSTNAME, 'Admin',
      LASTNAME, 'Adminović',
      ROLE, ROLES[0],
      PASSWORD, hash
    ]);
  });

  bcrypt.hash('read', saltRounds, function(err, hash) {
    client.hmset('user:read', [
      USERNAME, 'read',
      FIRSTNAME, 'Read',
      LASTNAME, 'Readić',
      ROLE, ROLES[2],
      PASSWORD, hash
    ]);
  });

  bcrypt.hash('update', saltRounds, function(err, hash) {
    client.hmset('user:update', [
      USERNAME, 'update',
      FIRSTNAME, 'Update',
      LASTNAME, 'Updatić',
      ROLE, ROLES[1],
      PASSWORD, hash
    ]);
  });
}

client.keys("*", function(err, res){
  keys = res;
  if(res.length==0){
    // Initialize database
  }
});

app.get('/hello', function(req, res){
  res.json({message: "Everything good..."});
});

app.get('/category', verifyRead, function(req,res){
    client.hgetall(CATEGORY, function(err, results){
        if(!results){
          res.json({
            error: CATEGORY + ' does not exist'
          });
        } else {
          var even = true;
          var obj = {};
          var array = [];
          for(var key of Object.keys(results)){
            even = !even;
            if(!even)
              obj.name = results[key];
            else{
              obj.key = results[key];
              array.push(JSON.parse(JSON.stringify(obj)));
            }
          }
          res.json(array);
        }
    });
 });

 app.get('/category/:key', verifyRead, function(req,res){
  client.hgetall(req.params.key, function(err, results){
      if(!results){
        res.json({
          error: req.params.key + ' does not exist'
        });
      } else {
        array = [];
        for(var key of Object.keys(results)){
          array.push({name: key, type: results[key]});
        }
        res.json(array);
      }
  });
});

app.post('/category/:key', verifyUpdate, function(req, res, next){
  let category = allCategories[req.params.key];
  for(let key of Object.keys(category)){
    if(FILES.includes(category[key])){
      req.body[key] = genRandKey();
    }
  }
  // convert JSON to array
  var obj2dArray = Object.entries(req.body);
  objArray = [].concat.apply([], obj2dArray);
  var date = Date.now();
  objArray = objArray.concat([CREATE, date, EDIT, date]);
  objKey = genRandKeyCat(req.params.key);

  client.hmset(objKey, objArray, function(err, result){
    if(err){
      client.del(objKey, function(value){
        res.json({error: "Error"});
      });
    }
    else{
      addSearch(req.body[NAZIV], objKey).then((result) =>{
        res.json({objKey: objKey, data: req.body});
      });
    }
  });
});

app.put('/data/:key', verifyUpdate, function(req, res, next){
  let category = allCategories[req.params.key.substring(0, req.params.key.indexOf('_'))];
  for(let key of Object.keys(category)){
    if(FILES.includes(category[key])){
      delete req.body[key];
    }
  }
  // convert JSON to array
  var obj2dArray = Object.entries(req.body);
  objArray = [].concat.apply([], obj2dArray);
  var date = Date.now();
  objArray = objArray.concat([EDIT, date]);
  objKey = req.params.key;

  client.hget(objKey, NAZIV, function(err, oldName){
    client.hmset(objKey, objArray, function(err, result){
      if(err){
        client.del(objKey, function(value){
          res.json({error: "Error"});
        });
      }
      else{
        client.hgetall(objKey, function(err, result){
          if(err)
            res.json({error: "Error"});
          else if(oldName!=req.body[NAZIV]){
            deleteSearch(oldName, req.params.key).then((res1)=>{
              addSearch(req.body[NAZIV], req.params.key).then((res2) =>{
                res.json({objKey: objKey, data: result});
              });
            });
          }
          else
            res.json({objKey: objKey, data: result});
        })
      }
    });
  })
});

app.post('/file/:fileId', verifyUpdate, function(req,res,next) {
  var busboy  = new Busboy({ headers: req.headers }), fileData;

  busboy.on('file', function(fieldname, file) {
    //the data event of the stream
    file.on('data', function(data) {
      //setup the  fileData var if empty
      if (!fileData) { 
        fileData = data; 
      } 
      else {
        //concat it to the first fileData
        fileData = Buffer.concat([fileData, data]);
      }
    });
    //when the stream is done
    file.on('end', function(){
      //var key = genRandKey();
      //set using redis
      clientBuff.set(
        req.params.fileId,
        fileData,
        function(err, resp) {
          if (err) { 
            next(err); 
          } 
          else {
            res.json({message: "File saved", key: req.params.fileId}); //complete the http
          }
        }
      );
    });
  });
  //let busboy handle the req stream
  req.pipe(busboy);
}
);

// app.get('/image/:fileId', verifyRead, function(req,res,next) {
//   //grab it from file:[fileId]
//   clientBuff.get(req.params.fileId,function(err,value) {
//     if (err) { 
//       next(err); 
//     } 
//     else {
//       if (!value) {
//         next(); // no value means a next which is likely a 404
//       } else {
//         res.setHeader('Content-Type','image/jpeg'); // set this to whatever you need or use some sort of mime type detection
//         res.json(value); //send the value and end the connection
//       }
//     }
//   });
// });

// app.get('/video/:fileId'/*, verifyRead*/, function(req,res,next) {
//   //grab it from file:[fileId]
//   clientBuff.get(req.params.fileId,function(err,value) {
//     if (err) { 
//       next(err); 
//     } 
//     else {
//       if (!value) {
//         next(); // no value means a next which is likely a 404
//       } else {
//         //res.setHeader('Content-Type','video/*'); // set this to whatever you need or use some sort of mime type detection
//         res.end(value); //send the value and end the connection
//       }
//     }
//   });
// });

// app.get('/audio/:fileId', verifyRead, function(req,res,next) {
//   //grab it from file:[fileId]
//   clientBuff.get(req.params.fileId,function(err,value) {
//     if (err) { 
//       next(err); 
//     } 
//     else {
//       if (!value) {
//         next(); // no value means a next which is likely a 404
//       } else {
//         res.setHeader('Content-Type','audio/*'); // set this to whatever you need or use some sort of mime type detection
//         res.json(value); //send the value and end the connection
//       }
//     }
//   });
// });

app.get('/file/:fileId', verifyRead, function(req,res,next) {
  //grab it from file:[fileId]
  clientBuff.get(req.params.fileId,function(err,value) {
    if (err) { 
      next(err); 
    } 
    else {
      if (!value) {
        next(); // no value means a next which is likely a 404
      } else {
        //console.log("DObro je");
        //res.setHeader('Content-Type','viedo/*'); // set this to whatever you need or use some sort of mime type detection
        res.end(value); //send the value and end the connection
      }
    }
  });
});

app.get('/keys/:key', verifyRead, function(req, res, next){
  var key = req.params.key;
  if(key=="*")
    key = "*_*";
  else
    key += "_*";
  client.keys(key, function(err, results){
    if (err) { 
      next(err); 
    } 
    else {
      if (!results) {
        next();
      } else {
        res.json(results);
      }
    }
  });
});

app.get('/obj/:key', verifyRead, function(req, res, next){
  client.hgetall(req.params.key, function(err, results){
    if (err) { 
      next(err); 
    } 
    else {
      if (!results) {
        next();
      } else {
        delete results[CREATE];
        delete results[EDIT];
        res.json(results);
      }
    }
  });
});

//app.post('/search', verifyUpdate, function(req, res, next){
function addSearch(text, objKey){
  return new Promise((resolve, reject) => {
    var listSearch = text.toLowerCase().split(" ").filter(word => word.length > 1);
    var keyOfObject = objKey;
    var searchCount = listSearch.length;

    for(var element of listSearch){
      // save value of el
      (function(el){
        client.hget(SEARCH, el, function(err, results){
          if (err) { 
            reject(err); 
          } 
          else {
            if (!results) {
              // If there are no results we need to add set for keyword "el"
              var key = genRandKey();
              client.hset(SEARCH, el, key, function(err){
                if (err) { 
                  reject(err); 
                } 
                else{
                  client.sadd(key, keyOfObject, function(err){
                    if (err) { 
                      reject(err); 
                    }
                    else{
                      searchCount--;
                      if(searchCount==0)
                        resolve({message: "Search paramters added"});
                    }
                  });}
              });
            } else {
              // If there are result we just add key of object to that set
              client.sadd(results, keyOfObject, function(err){
                if (err) { 
                  reject(err); 
                } 
                else{
                  searchCount--;
                  if(searchCount==0)
                    resolve({message: "Search paramters added"});
                }
              })
            }
          }
        });
      })(element);
    }
  });
};

//app.post('/searchDelete', verifyUpdate, function(req, res, next){
function deleteSearch(text, objKey){
  return new Promise((resolve, reject) => {
    var listSearch = text.toLowerCase().split(" ").filter(word => word.length > 1);
    var keyOfObject = objKey;
    var searchCount = listSearch.length;

    for(var element of listSearch){
      (function(el){
        client.hget(SEARCH, el, function(err, results){
          if (results) { 
            client.srem(results, keyOfObject, function(err, res){
              searchCount--;
              if(searchCount==0)
                resolve({message: "Search paramters removed"});
            });
          } 
          else{
            searchCount--;
              if(searchCount==0)
                resolve({message: "Search paramters removed"});
          }
        });
      })(element);
    }
  });
}

// HSCAN search 0 match *ourWord*
app.get('/search', verifyRead, function(req, res, next){
  var listSearch = URL.parse(req.url,true).query.search_query.toLowerCase().split(" ").filter(word => word.length > 1);
  var objectKeys = [];
  var counter = listSearch.length;
  if(counter==0)
    res.json([]);
  for(var element of listSearch){
    client.hscan(SEARCH, 0, "match", "*" + element + "*", function(err, result){
      if(err){
        console.log(err);
      }
      if(result){
        result = result[1];
        counter += result.length/2 - 1;
        if(result.length!=0){
          for(var i=1; i<result.length; i+=2){
            client.smembers(result[i], function(err, results2){
              if(results2){
                objectKeys = objectKeys.concat(results2);
                if(--counter==0)
                  searchFinish(req, res, next, objectKeys);
              }
              else{
                if(--counter==0)
                  searchFinish(req, res, next, objectKeys);
              }
            });
          }
        }
        else if(counter==0)
          searchFinish(req, res, next, objectKeys);
      }
    })
    // client.hget(SEARCH, element, function(err, results){
    //   if (err) { 
    //     next(err); 
    //   } 
    //   else {
    //     if (results) {
    //       client.smembers(results, function(err, results2){
    //         if(results2){
    //           objectKeys = objectKeys.concat(results2);
    //           if(--counter==0)
    //             searchFinish(req, res, next, objectKeys);
    //         }
    //         else{
    //           if(--counter==0)
    //             searchFinish(req, res, next, objectKeys);
    //         }
    //       });
    //     } else {
    //       if(--counter==0)
    //         searchFinish(req, res, next, objectKeys);
    //     }
    //   }
    // });
  }
});

function searchFinish(req, res, next, objectKeys){
  // Sort array by number of duplicates, and remove duplicates
  if(objectKeys.length==0){
    res.json([]);
    return;
  }
  var map = objectKeys.reduce(function(p, c) {
    p[c] = (p[c] || 0) + 1;
    return p;
  }, {});
  
  objectKeys = Object.keys(map).sort(function(a, b) {
    return map[b] - map[a];
  });

  getNameAndImage(req, res, next, objectKeys);
}

function getNameAndImage(req, res, next, objectKeys){
  var objects = [];
  for(var i=0; i<objectKeys.length; i++){
    (function(index){
      client.hgetall(objectKeys[index], function(err, results){
        if(err){
          objects[index] = {key:objectKeys[index]}
        }
        else{
          objects[index] = {
            key: objectKeys[index], 
            name: results[NAZIV],
            image: results[getKeyOfImage(objectKeys[index])]
          }
        }
        if(objects.length==objectKeys.length)
          res.json(objects);
      });
    })(i);
  }
}

function getKeyOfImage(objKey){
  var category = allCategories[objKey.substring(0, objKey.indexOf('_'))];
  if(category.hasImage){
    for(let key of Object.keys(category)){
      if(category[key]==IMAGE){
        return key;
      }
    }
  }
  return null;
}

app.post('/login', (req, res) => {
  user = {
    username: req.body.username,
  }

  client.hgetall('user:' + user.username, function(err, results){
    if(results){
      user = results;
      bcrypt.compare(req.body.password, results.password, function(err, result) {
        if(result){
          jwt.sign({user}, SECRETKEY, { expiresIn: TOKEN_TIME + 'ms' }, (err, shortToken) => {
            jwt.sign({user}, SECRETKEY, { expiresIn: (2*TOKEN_TIME) + 'ms' }, (err, longToken) => {
              // req.session.token = longToken;
              // req.session.token.expires = 2*TOKEN_TIME;
              delete user.password;
              user.token = shortToken;
              user.renewableToken = longToken;
              res.json(user);
            });
          });
        }
        else{
          res.json({message: "Incorrect password"});
        }
      });
    }
    else{ 
      res.json({message: "No such username"});
    }
  });
});

app.post('/newToken', (req, res) =>{
  jwt.verify(req.body.refreshToken, SECRETKEY, (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      var user = authData.user;
      jwt.sign({user}, SECRETKEY, { expiresIn: TOKEN_TIME + 'ms' }, (err, shortToken) => {
        jwt.sign({user}, SECRETKEY, { expiresIn: (2*TOKEN_TIME) + 'ms' }, (err, longToken) => {
          // req.session.token = longToken;
          // req.session.token.expires = 2*TOKEN_TIME;
          user.token = shortToken;
          user.renewableToken = longToken;
          res.json(user);
        });
      });
    }
  });
});

app.put('/account/changePassword', verifyRead, function(req, res){
  var oldPass = req.body.oldPass;
  var newPass = req.body.newPass;

  jwt.verify(req.token, SECRETKEY, (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      var username = authData.user.username;
      client.hgetall('user:' + username, function(err, results){
        if(results){
          bcrypt.compare(oldPass, results.password, function(err, result) {
            if(result){
              bcrypt.hash(newPass, saltRounds, function(err, hash) {
                client.hset('user:' + username, PASSWORD, hash, function(err, results) {
                  destroySession(req, res);
                });
              });
            }
            else{
              res.json({message: "Incorrect password"});
            }
          });
        }
        else{
          res.sendStatus(403);
        }
      });
    }
  });
});

// Admin

app.get('/users', verifyAdmin, function(req, res){
  client.keys("user:*", function(err, results){
    let users = []
    for(let key of results){
      client.hgetall(key, function(err, results2){
        delete results2.password;
        users.push(results2);
        if(users.length == results.length)
          res.json(users);
      })
    }
  });
});

app.get('/users/:username', verifyAdmin, function(req, res){
  client.hgetall("user:" + req.params.username, function(err, results){
    if(!results)
      res.json({error: "No such username"});
    else{
      delete results.password;
      res.json(results);
    }
  });
});

app.delete('/users/:username', verifyAdmin, function(req, res){
  client.hgetall("user:" + req.params.username, function(err, result){
    if(result.role == ROLES[0])
      res.json({error: "Can not delete user with admin role"});
    else{
      client.del("user:" + req.params.username, function(err, results){
        if(err)
          res.json({error: "Unknown error"});
        else if(results == "1")
          res.json({message: req.params.username + " succefully deleted"});
        else 
          res.json({error: "No such username"})
      });
    }
  })
});

app.post('/users', verifyAdmin, function(req, res){
  let user = req.body;
  if(ROLES.indexOf(user.role) == -1)
    res.json({error: "Role not defined"});
  client.hgetall('user:' + user.username, function (err, result){
    if(result!=null)
      res.json({error: "There is already user with same username"});
    else{
      bcrypt.hash(user.password, saltRounds, function(err, hash) {
        client.hmset('user:' + user.username, [
          USERNAME, user.username,
          FIRSTNAME, user.firstname,
          LASTNAME, user.lastname,
          ROLE, user.role,
          PASSWORD, hash
        ], function (err, result){
          res.json({message: "User succefully created"});
        });
      });
    }
  });
});

app.get('/logout',(req,res) => {
  destroySession(req, res);
});

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next, role) {
  if(getToken(req, res)){
    jwt.verify(req.token, SECRETKEY, (err, authData) => {
      if(err) {
        if(err.expiredAt < Date.now()){
          res.sendStatus(401);
        }
        else{
          res.sendStatus(403);
        }          
      } else {
        if(ROLES.indexOf(authData.user.role) <= ROLES.indexOf(role)){
          next();
        }
        else{
          res.sendStatus(403);
        }
      }
    });
  }
}

function verifyAdmin(req, res, next){
  verifyToken(req, res, next, ROLES[0]);
}

function verifyUpdate(req, res, next){
  verifyToken(req, res, next, ROLES[1]);
}

function verifyRead(req, res, next){
  verifyToken(req, res, next, ROLES[2]);
}

function getToken(req, res){
  const bearerHeader = req.headers['authorization'];
  
  if(typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    return true;
  } else {
    // Forbidden
    console.log("Unauthorized");console.log(req.headers["authorization"]);
    res.sendStatus(403);
    return false;
  }
}

function destroySession(req, res){
  req.session.destroy((err) => {
    if(err) {
        return console.log(err);
    }
    res.sendStatus(301);
  });
}

// generate random key
function genRandKey(){
  while(true){
    var key = rand.generate();
    if(!keys.includes(key)){
      keys.push(key);
      return key;
    }
  }
}

// generate category key
function genRandKeyCat(cat){
  while(true){
    var key = cat + '_' + rand.generate();
    if(!keys.includes(key)){
      keys.push(key);
      return key;
    }
  }
}

// Just for testing app
app.delete('/flushall', function(req, res){
  client.flushall(function (err, value){
    res.json({message: "Database clear"});
  });
})

app.listen(PORT, function(){
    console.log('Server started on port ' + PORT + '...');
});