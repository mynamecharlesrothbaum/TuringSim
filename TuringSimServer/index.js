require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

// Database connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
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
          res.status(400).json({ error: 'Invalid username or password' });
					console.log("INcorrect user or pwd");
        }
      } else {
        res.status(400).json({ error: 'Invalid username or password' });
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
        return res.status(400).json({ error: 'Username is already taken' });
      }

      db.query('INSERT INTO Accounts (username, password) VALUES (?, ?)', [username, password], (err, insertResult) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create account, please try again later.' });
        }

        console.log('User registered successfully');
        return res.status(200).json({ message: 'Account created successfully' });
      });
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred, please try again later.' });
  }
});

function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}
//save endpoint
app.post('/saves', async (req, res) => {
    try {
        const { username, configName, date_updated, tape, rules } = req.body;

        if (!req.body) {
            console.error("No req.body");
            return res.status(400).json({ error: 'No data received.' });
        }

        if (!username) {
            console.error("Missing username");
            return res.status(400).json({ error: 'Could not recognize user. Please login again.' });
        }

        //const tapeStr = tape.join(',');
        const tapeJson = JSON.stringify(tape);

        const userId = await getUserId(username);
        
        if (await checkForConfiguration(userId, configName)) {
            const configuration = await getConfiguration(userId, configName);
            console.log("deleting configuration with id", configuration.config_id);
            await deleteConfiguration(userId, configuration.config_id);
        }
        

        const configId = await saveConfiguration(userId, configName, tapeJson, date_updated);

        const stateNames = getUniqueStateNames(rules);

        const stateNameToId = await saveStates(configId, stateNames);

        await saveTransitions(configId, rules, stateNameToId);


        return res.status(200).json({ message: 'Configuration and states saved successfully' });

    } 
    catch (error) {
        console.error("Unexpected error occurred:", error);
        if (error.message === 'User not found') {
            return res.status(400).json({ error: 'User not found' });
        } else {
            return res.status(500).json({ error: 'Unexpected server error' });
        }
    }
});

app.post('/loads', async (req, res) => {
    console.log("hit loads endpoint");
    try {
        const {loadConfigName, username} = req.body;
        console.log("config name:", loadConfigName);
        console.log("username:", username);
        if (!username || !loadConfigName) {
            return res.status(400).json({ error: 'Missing username or configuration name' });
        }

        const userId = await getUserId(username);
        const configuration = await getConfiguration(userId, loadConfigName);
        const states = await getStates(configuration.config_id);
        const transitions = await getTransitions(configuration.config_id);


        configuration.tape_contents = `[${configuration.tape_contents}]`;
        const parsedTapeContents = JSON.parse(configuration.tape_contents);

        const responseData = {
            configName: configuration.name,
            date_updated: configuration.date_last_updated,
            tape: parsedTapeContents,
            rules: constructRules(states, transitions),
        };

        console.log("response", responseData);

        return res.status(200).json(responseData);

    } 
    catch (error) {
        console.error("Error loading configuration:", error);
        if (error.message === 'User not found' || error.message === 'Configuration not found') {
            return res.status(404).json({ error: error.message });
        } else {
            return res.status(500).json({ error: 'Unexpected server error' });
        }
    }
});

function constructRules(states, transitions) {
    const stateIdToName = {};
    states.forEach(state => {
        stateIdToName[state.state_id] = state.name;
    });

    const rules = transitions.map(transition => {
        return {
            name: stateIdToName[transition.state_id] ?? "na",
            previousState: stateIdToName[transition.from_state_id] ?? "na",
            nextState: stateIdToName[transition.to_state_id] ?? "na",
            readSymbol: transition.char_read,
            writeSymbol: transition.char_write,
            moveDirection: transition.move_direction,
        };
    });

    return rules;
}


async function getConfiguration(userId, configName) {
    const sql = 'SELECT * FROM Configurations WHERE user_id = ? AND name = ?';
    const params = [userId, configName];
    const result = await queryAsync(sql, params);
    if (result.length > 0) {
        return result[0];
    } else {
        console.error("Configuration not found");
        throw new Error('Configuration not found');
    }
}

async function checkForConfiguration(userId, configName) {
    const sql = 'SELECT * FROM Configurations WHERE user_id = ? AND name = ?';
    const params = [userId, configName];
    const result = await queryAsync(sql, params);
    if(result[0] == undefined){
        console.log("returning false because configuration doesnt exist");
        return false;
    }
    else{
        console.log("returning true because configuration does exist");
        return true;
    }
}


async function deleteConfiguration(userId, configId) {
    try {
        await queryAsync('DELETE FROM Transitions WHERE config_id = ?', [configId]);
        await queryAsync('DELETE FROM States WHERE config_id = ?', [configId]);
        await queryAsync('DELETE FROM Configurations WHERE config_id = ? AND user_id = ?', [configId, userId]);
        console.log(`Configuration ${configId} deleted successfully.`);
    } catch (error) {
        console.error("Unable to delete configuration", configId, error);
        throw error;
    }
}


async function getStates(configId) {
    const sql = 'SELECT * FROM States WHERE config_id = ?';
    const params = [configId];
    const result = await queryAsync(sql, params);
    return result;
}

async function getTransitions(configId) {
    const sql = 'SELECT * FROM Transitions WHERE config_id = ?';
    const params = [configId];
    const result = await queryAsync(sql, params);
    return result;
}

async function getUserId(username) {
    const result = await queryAsync('SELECT user_id FROM Accounts WHERE username = ?', [username]);
    if (result.length > 0) {
        return result[0].user_id;
    } else {
        console.error("User not found");
        throw new Error('User not found');
    }
}

async function getStateId(stateName, configId) {
    const result = await queryAsync('SELECT state_id FROM States WHERE name = ? and config_id = ?', [stateName, configId]);
    if (result.length > 0) {
        return result[0].state_id;
    } else {
        console.error("State not found");
        throw new Error('State not found');
    }
}

async function saveConfiguration(userId, configName, tapeStr, date_updated) {
    const sql = 'INSERT INTO Configurations (tape_contents, date_last_updated, user_id, name) VALUES (?, ?, ?, ?)';
    const params = [tapeStr, date_updated, userId, configName];
    const result = await queryAsync(sql, params);
    return result.insertId;
}

function getUniqueStateNames(rules) {
    const stateNames = new Set();
    for (const rule of rules) {
        const { name } = rule;
        stateNames.add(name);
    }
    return Array.from(stateNames);
}

async function saveStates(configId, stateNames) {
    const stateNameToId = {};
    for (const name of stateNames) {
        if (name !== "na") {
            console.log("Inserting ",configId,name );
            const sql = 'INSERT INTO States (config_id, name) VALUES (?, ?)';
            const params = [configId, name];
            const result = await queryAsync(sql, params);
            stateNameToId[name] = result.insertId; 
        }
    }
    return stateNameToId;
}


async function saveTransitions(configId, rules, stateNameToId) {
    for (const rule of rules) {
        const { name, previousState, readSymbol, writeSymbol, nextState, moveDirection } = rule;

        const stateId = stateNameToId[name];
        if (!stateId) {
            console.error(`State ID not found for state name: ${name}`);
            continue;
        }

        let fromStateId = stateNameToId[previousState] || 1; 
        let toStateId = stateNameToId[nextState] || 1; 

        const sql = 'INSERT INTO Transitions (config_id, from_state_id, to_state_id, char_read, char_write, move_direction, state_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const params = [configId, fromStateId, toStateId, readSymbol, writeSymbol, moveDirection, stateId];
        await queryAsync(sql, params);
    }
}



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

