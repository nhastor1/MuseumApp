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

//app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(__dirname + "/public"));
//app.use(express.static(__dirname + "/views"));

function auth(req, res, next){
  if(typeof req.headers['authorization'] !== 'undefined'){
    console.log(req.headers['authorization']);
    next();
  }
  else
    res.sendStatus(403);
}

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
const ROLE = 'role';
const ROLES = ['Admin', 'Update', 'Read'];

categories = [{category:'app', name:'Application', key:'appKey'}, {category:'web', name:'World-Wide-Web', key:'webKey'}
  , {category:'card', name:'Mastercard', key:'cardKey'}]
const CATEGORY = 'category';
const SEARCH = 'search';
const NAZIV = 'Naziv';
keys = [];

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
    ROLE, ROLES[0],
    PASSWORD, hash
  ]);
});

bcrypt.hash('read', saltRounds, function(err, hash) {
  client.hmset('user:read', [
    USERNAME, 'read',
    ROLE, ROLES[2],
    PASSWORD, hash
  ]);
});

bcrypt.hash('update', saltRounds, function(err, hash) {
  client.hmset('user:update', [
    USERNAME, 'update',
    ROLE, ROLES[1],
    PASSWORD, hash
  ]);
});


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
          res.json(results);
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
        res.json(results);
      }
  });
});

app.post('/category/:key', verifyUpdate, function(req, res, next){
  client.hgetall(req.params.key, function(err, results){
    if(!results){
      res.json({
        error: req.params.key + ' does not exist'
      });
    } else {
      objKey = genRandKeyCat(req.params.key);
      parameters = [];
      newKeys = [];
      var i=0;
      for(var el of Object.keys(results)){
        parameters.push(results[el] + "_" + i++);
        newKey = genRandKey();
        newKeys.push(newKey)
        parameters.push(newKey);
      }
      // Edit time
      parameters.push(EDIT);
      newKey = genRandKey();
      newKeys.push(newKey)
      parameters.push(newKey);
      // Create time
      parameters.push(CREATE);
      newKey = genRandKey();
      newKeys.push(newKey)
      parameters.push(newKey);

      client.hmset(objKey, parameters, function(err, result){
        if(err){
          // Delete all keys
          keys = keys.filter(function(value, index, arr){ 
            return !newKeys.includes(value);
          });
          client.del(objKey);
        }
        else{
          var resKeys = [];
          var i=0;
          for(var el of Object.keys(results)){
            resKeys.push({key: newKeys[i], type: results[el] + "_" + i});
            i++;
          }
          resKeys.push({key: newKeys[i++], type: EDIT});
          resKeys.push({key: newKeys[i++], type: CREATE});
          res.json({objKey: objKey, keys: resKeys});
        }
      });
    }
  });
});

app.post('/data/:textId', verifyUpdate, function(req, res, next){
  client.set(req.params.textId, req.body.data, function(err, value){
    if (err) { 
      next(err); 
    } 
    else {
      if (!value) {
        next();
      } else {
        res.json({message: 'Data added', value: value});
      }
    }
  });
});

app.get('/data/:textId', verifyRead, function(req, res, next){
  client.get(req.params.textId, function(err, value){
    if (err) { 
      next(err); 
    } 
    else {
      if (!value) {
        next();
      } else {
        res.json({value: value});
      }
    }
  });
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

app.get('/image/:fileId', verifyRead, function(req,res,next) {
  //grab it from file:[fileId]
  clientBuff.get(req.params.fileId,function(err,value) {
    if (err) { 
      next(err); 
    } 
    else {
      if (!value) {
        next(); // no value means a next which is likely a 404
      } else {
        res.setHeader('Content-Type','image/jpeg'); // set this to whatever you need or use some sort of mime type detection
        res.end(value); //send the value and end the connection
      }
    }
  });
});

app.get('/video/:fileId', verifyRead, function(req,res,next) {
  //grab it from file:[fileId]
  clientBuff.get(req.params.fileId,function(err,value) {
    if (err) { 
      next(err); 
    } 
    else {
      if (!value) {
        next(); // no value means a next which is likely a 404
      } else {
        res.setHeader('Content-Type','video/*'); // set this to whatever you need or use some sort of mime type detection
        res.end(value); //send the value and end the connection
      }
    }
  });
});

app.get('/audio/:fileId', verifyRead, function(req,res,next) {
  //grab it from file:[fileId]
  clientBuff.get(req.params.fileId,function(err,value) {
    if (err) { 
      next(err); 
    } 
    else {
      if (!value) {
        next(); // no value means a next which is likely a 404
      } else {
        res.setHeader('Content-Type','audio/*'); // set this to whatever you need or use some sort of mime type detection
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
        res.json(results);
      }
    }
  });
});

app.post('/search', verifyUpdate, function(req, res, next){
  var listSearch = req.body.text.toLowerCase().split(" ").filter(word => word.length > 1);
  var keyOfObject = req.body.key;

  for(var element of listSearch){
    // save value of el
    (function(el){
      client.hget(SEARCH, el, function(err, results){
        if (err) { 
          next(err); 
        } 
        else {
          if (!results) {
            // If there are no results we need to add set for keyword "el"
            var key = genRandKey();
            client.hset(SEARCH, el, key, function(err){
              if (err) { 
                next(err); 
              } 
            });
            client.sadd(key, keyOfObject, function(err){
              if (err) { 
                next(err); 
              } 
            });
          } else {
            // If there are result we just add key of object to that set
            client.sadd(results, keyOfObject, function(err){
              if (err) { 
                next(err); 
              } 
            })
          }
        }
      });
    })(element);
  }
  res.json({message: "Search paramters added"});
});

app.post('/searchDelete', verifyUpdate, function(req, res, next){
  var listSearch = req.body.text.toLowerCase().split(" ").filter(word => word.length > 1);
  var keyOfObject = req.body.key;

  for(var element of listSearch){
    (function(el){
      client.hget(SEARCH, el, function(err, results){
        if (results) { 
          client.srem(results, keyOfObject);
        } 
      });
     })(element);
  }
  res.json({message: "Search paramters removed"});
});


app.get('/search', verifyRead, function(req, res, next){
  var listSearch = URL.parse(req.url,true).query.search_query.toLowerCase().split(" ").filter(word => word.length > 1);
  var objectKeys = [];
  var counter = 0;

  for(var element of listSearch){
      client.hget(SEARCH, element, function(err, results){
        if (err) { 
          next(err); 
        } 
        else {
          if (results) {
            client.smembers(results, function(err, results2){
              if(results2){
                objectKeys = objectKeys.concat(results2);
                counter++;
                if(counter==listSearch.length){
                  // Sort array by number of duplicates, and remove duplicates
                  var map = objectKeys.reduce(function(p, c) {
                    p[c] = (p[c] || 0) + 1;
                    return p;
                  }, {});
                  
                  objectKeys = Object.keys(map).sort(function(a, b) {
                    return map[b] - map[a];
                  });
            
                  res.json(objectKeys);
                }
              }
            });
          } else {
            counter++;
          }
        }
      });
  }
});

app.post('/login', (req, res) => {
  user = {
    username: req.body.username,
  }

  client.hgetall('user:' + user.username, function(err, results){
    if(results){
      user.role = results.role;
      bcrypt.compare(req.body.password, results.password, function(err, result) {
        if(result){
          jwt.sign({user}, SECRETKEY, { expiresIn: TOKEN_TIME + 'ms' }, (err, token) => {
            req.session.token = token;
            req.session.token.expires = TOKEN_TIME;
            user.token = token;
            res.json(user);
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

app.get('/logout',(req,res) => {
  req.session.destroy((err) => {
      if(err) {
          return console.log(err);
      }
      res.redirect('/');
  });

});

app.get('/team.html/:objectId', function(req,res){
  req.params.objectId
});

app.get('/updateAllow', verifyUpdate, (req, res) => {  
  res.sendStatus(200);
});

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next, role) {
  if(getToken(req, res)){
    jwt.verify(req.token, SECRETKEY, (err, authData) => {
      if(err) {
        res.sendStatus(403);
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

function verifyAdminSession(req, res, next){
  req.headers['authorization'] = "Bearer " + req.session.token;
  verifyToken(req, res, next, ROLES[0]);
}

function verifyUpdateSession(req, res, next){
  req.headers['authorization'] = "Bearer " + req.session.token;
  verifyToken(req, res, next, ROLES[1]);
}

function verifyReadSession(req, res, next){
  req.headers['authorization'] = "Bearer " + req.session.token;
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
    res.sendStatus(403);
    return false;
  }
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