//Functions for querying information about users and such.

const { queryAsync } = require('./query');

async function getUserId(username) {
    const result = await queryAsync('SELECT user_id FROM Accounts WHERE username = ?', [username]);
    if (result.length > 0) {
        return result[0].user_id;
    } else {
        console.error("User not found");
        throw new Error('User not found');
    }
}

async function getConfiguration(userId, configName) {
    const sql = 'SELECT * FROM Configurations WHERE user_id = ? AND name = ?';
    const params = [userId, configName];
    const result = await queryAsync(sql, params);
    if (result.length > 0) {
        return result[0];
    } else {
        console.error("Configuration not found");
    }
}

async function getConfigurationFromId(userId, configId) {
    const sql = 'SELECT * FROM Configurations WHERE user_id = ? AND config_id = ?';
    const params = [userId, configId];
    const result = await queryAsync(sql, params);
    if (result.length > 0) {
        return result[0];
    } else {
        console.error("Configuration not found");
    }
}

async function getStates(configId) {
    const sql = 'SELECT * FROM States WHERE config_id = ?';
    const params = [configId];
    return queryAsync(sql, params);
}

async function getTransitions(configId) {
    const sql = 'SELECT * FROM Transitions WHERE config_id = ?';
    const params = [configId];
    return queryAsync(sql, params);
}

async function getAllConfigurations(userId) {
    const sql = 'SELECT * FROM Configurations WHERE user_id = ?';
    const params = [userId];
    const result = await queryAsync(sql, params);
    if (result.length > 0) {
        console.log(result);
        return result;
    } else {
        console.error("Configurations not found");
        throw new Error('Configurations not found');
    }
}

async function deleteConfiguration(userId, configId) {
    const sqlCheck = 'SELECT * FROM Configurations WHERE user_id = ? AND config_id = ?';
    const paramsCheck = [userId, configId];
    const result = await queryAsync(sqlCheck, paramsCheck);

    if (result.length > 0) {
        console.log("Configuration found. Proceeding to delete.");

        await queryAsync('DELETE FROM Transitions WHERE config_id = ?', [configId]);
        await queryAsync('DELETE FROM States WHERE config_id = ?', [configId]);

        const sqlDelete = 'DELETE FROM Configurations WHERE user_id = ? AND config_id = ?';
        const paramsDelete = [userId, configId];
        await queryAsync(sqlDelete, paramsDelete);

        console.log(`Configuration with config_id ${configId} deleted successfully.`);
    } else {
        console.error("Configuration not found");
    }
}

async function checkForConfiguration(userId, configName) {
    const sql = 'SELECT * FROM Configurations WHERE user_id = ? AND name = ?';
    const params = [userId, configName];
    const result = await queryAsync(sql, params);
    if (result[0] == undefined) {
        console.log("returning false because configuration doesnt exist");
        return false;
    } else {
        console.log("returning true because configuration does exist");
        return true;
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

function constructRules(states, transitions) {
    const stateIdToName = {};
    states.forEach(state => {
        stateIdToName[state.state_id] = state.name;
    });

    return transitions.map(transition => {
        return {
            name: stateIdToName[transition.state_id] ?? "na",
            previousState: stateIdToName[transition.from_state_id] ?? "na",
            nextState: stateIdToName[transition.to_state_id] ?? "na",
            readSymbol: transition.char_read,
            writeSymbol: transition.char_write,
            moveDirection: transition.move_direction,
        };
    });
}

module.exports = {
    getUserId,
    getConfiguration,
    getConfigurationFromId,
    getStates,
    getTransitions,
    getAllConfigurations,
    deleteConfiguration,
    checkForConfiguration,
    saveConfiguration,
    getUniqueStateNames,
    saveStates,
    saveTransitions,
    constructRules
};
