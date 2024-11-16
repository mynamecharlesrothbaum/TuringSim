const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

// Database connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Chucko12!',
  database: 'TuringMachine'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Could not connect to the database:', err);
    process.exit(1);
  } else {
    console.log('Connected to the database successfully.');
  }
});

app.use(cors());
app.use(express.json());

// Authentication endpoint
app.post('/authentications', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.error('Missing username or password');
      return res.status(400).json({ error: 'Username and/or password missing' });
    }

    db.query('SELECT * FROM Accounts a WHERE a.username = ?', [username], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (results.length > 0) {
        const user = results[0];
        if (user.password === password) {
          res.status(200).json({ message: 'Authentication successful' });
					console.log("Succesful authentication");
        } else {
          res.status(401).json({ error: 'Invalid username or password' });
					console.log("INcorrect user or pwd");
        }
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
				console.log("Incorrect user or pwd");
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Registration endpoint
app.post('/registrations', (req, res) => {
  try {
    const { username, password } = req.body;


    if (!username || !password) {
      console.error("Missing username or password");
      return res.status(400).json({ error: 'Please enter both a username and a password' });
    }

    db.query('SELECT * FROM Accounts a WHERE a.username = ?', [username], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error, please try again later.' });
      }

      if (results.length > 0) {
        console.error('Username already taken');
        return res.status(409).json({ error: 'Username is already taken' });
      }

      db.query('INSERT INTO Accounts (username, password) VALUES (?, ?)', [username, password], (err, insertResult) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create account, please try again later.' });
        }

        console.log('User registered successfully');
        return res.status(201).json({ message: 'Account created successfully' });
      });
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred, please try again later.' });
  }
});
//Save configuration endpoint
app.post('/saves', (req, res) => {
    try {
        const {username, tape_contents, date_created, date_updated, states, transitions} = req.body;
        console.log(username);

        if (!username) {
            console.error("Missing username");
            return res.status(400).json({ error: 'Could not recognize user. please login again.' });
        }
        db.query('INSERT INTO States ')
    } 
    catch (error) {
          
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

  


  

  