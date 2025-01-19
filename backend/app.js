const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const fsPath = path.join(__dirname, '../data.json');
const JWT_SECRET = 'iamjayneeliloveanshika';

// Middleware to parse JSON request bodies
app.use(express.json());

// app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, '../public/index.html'));
// });

//! Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '../public')));


// !Utility functions to read and write user data
function readUsers() {
   return new Promise((resolve, reject) => {
      fs.readFile(fsPath, 'utf8', (err, data) => {
         if (err) {
            reject(err);
         }
         resolve(data ? JSON.parse(data) : []);
      });
   });
}

function writeUsers(users) {
   return new Promise((resolve, reject) => {
      const data = JSON.stringify(users, null, 2);
      fs.writeFile(fsPath, data, err => {
         if (err) return reject(err);
         resolve();
      });
   });
}

// !Route to authenticate user (signup)
app.post('/signup', (req, res) => {
   const { username, password } = req.body;

   if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
   }

   readUsers()
      .then(users => {
         const userExists = users.find(user => user.username === username);
         if (userExists) {
            return res.status(409).json({ message: "User with given username already exists." });
         }

         const newUser = { username, password };
         users.push(newUser);

         writeUsers(users).then(() => {
            res.status(201).json({ message: `User with username: ${username} added successfully.` });
         })
      })

      .catch(err => {
         console.error(err);
         res.status(500).json({ message: "An error occurred on the server." });
      });
});

//!Sign in route;
app.post('/signin', (req, res) => {
   const { username, password } = req.body;

   if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
   }

   readUsers()
      .then(users => {
         const user = users.find(user => user.username === username && user.password === password);
         if (!user) {
            return res.status(404).json({ message: "Incorrect Credentials." });

         }
         const token = jwt.sign({ username: user.username }, JWT_SECRET);
         user.token = token;

         writeUsers(users)
            .then(() => {
               res.status(200).json({ message: "Signed in Successfully.", token: token });
            })
      })
      .catch(err => {
         console.error(err);
         res.status(500).json({ message: "An error occurred on the server." });
      });
})

//? Middileware for authenticating users
function auth(req, res, next) {
   const token = req.headers.token;
   if (!token) {
      return res.status(401).json({ message: "Authentication required." });
   }
   const decodedInfo = jwt.verify(token, JWT_SECRET);
   req.username = decodedInfo.username;
   next();

}


//! User portal;
app.get('/me', auth, (req, res) => {
   let currentUser = req.username;
   readUsers()
      .then(users => {
         currentUser = users.find(user => user.username === currentUser);
         if (!currentUser) {
            return res.status(404).json({ message: "User not found." });
         }
         res.json({
            username: currentUser.username,
            password: currentUser.password
         });
      })
      .catch(err => {
         console.error(err);
         res.status(500).json({ message: "An error occurred on the server." });
      });
})

// !Start server
const PORT = 3000;
app.listen(PORT, () => {
   console.log('Server listening on port :' + PORT);
});
