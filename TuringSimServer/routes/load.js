const express = require('express');
const router = express.Router();
const { 
    getUserId, getConfigurationFromId, getStates, getTransitions, constructRules 
} = require('../helpers');

router.post('/loads', async (req, res) => {
    console.log("hit loads endpoint");
    try {
        console.log(req.body);
        const {configId, username} = req.body;
        console.log("config id:", configId);
        console.log("username:", username);
        if (!username || !configId) {
            return res.status(400).json({ error: 'Missing username or configuration name' });
        }

        const userId = await getUserId(username);
        const configuration = await getConfigurationFromId(userId, configId);
        const states = await getStates(configId);
        const transitions = await getTransitions(configId);

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

    } catch (error) {
        console.error("Error loading configuration:", error);
        if (error.message === 'User not found' || error.message === 'Configuration not found') {
            return res.status(404).json({ error: error.message });
        } else {
            return res.status(500).json({ error: 'Unexpected server error' });
        }
    }
});

module.exports = router;
