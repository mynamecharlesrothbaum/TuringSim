import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from "../hooks/UseAuth";

const EditorPage = () => {
  const MAX_TAPE_LENGTH = 128;
  const [tape, setTape] = useState(Array(MAX_TAPE_LENGTH).fill(0)); // Initial tape state
  const [headPosition, setHeadPosition] = useState(MAX_TAPE_LENGTH / 2); // Head starts at the center
  const [viewPosition, setViewPosition] = useState(MAX_TAPE_LENGTH / 2);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [configName, setConfigName] = useState("");
  const [loadConfigName, setLoadConfigName] = useState("");
  const [rules, setRules] = useState([]); // Rules for the Turing Machine
  const { logout, save, load} = useAuth();

  const handleRun = () => {
    // Logic for running the Turing Machine continuously
  };

  const handleStep = () => {
    // Logic for executing a single step
  };

  const handleStop = () => {
    // Logic for stopping the machine
  };

  const handleReset = () => {
    setTape(Array(MAX_TAPE_LENGTH).fill(0));
    setViewPosition((prev) => MAX_TAPE_LENGTH / 2);
  }

  const handleLogout = () => {
    logout();
  };

  const handleScrollLeft = () => {
    setViewPosition((prev) => Math.max(prev - 1, 0));
  };

  const handleScrollRight = () => {
    setViewPosition((prev) => Math.min(prev + 1, tape.length - 1));
  };

  const handleDeleteRule = (index) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };
  
  const checkRules = () => {
    return rules.every(rule => 
      rule &&
      typeof rule === 'object' &&
      Object.keys(rule).length > 0 &&
  
      rule.name && rule.name.trim().length > 0 &&
      rule.previousState && rule.previousState.trim().length > 0 &&
      rule.readSymbol && rule.readSymbol.trim().length > 0 &&
      rule.writeSymbol && rule.writeSymbol.trim().length > 0 &&
      rule.nextState && rule.nextState.trim().length > 0 &&
      rule.moveDirection && rule.moveDirection.trim().length > 0
    );
  };


  const handleSaveRules = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!checkRules()) {
      setErrorMessage("Missing fields in 1 or more rules. (Use 'na' for fields that should be empty)");
      return;
    }
    if(configName === ""){
      setErrorMessage("Please type a configuration name.");
      return;
    }
    
    const rulesJson = JSON.stringify({configName, tape, rules});
    const result = await save(rulesJson);

    if(result.message === "Configuration and states saved successfully"){
      setSuccessMessage("Saved Successfully!")
    }
  };

  const handleLoadRules = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if(loadConfigName === ""){
      setErrorMessage("Please enter a configuration name.");
      return;
    }

    const result = await load(JSON.stringify({loadConfigName}));


  };

  const handleSetRules = async () => {

  }

  const calculateOffset = () => {
    const offset = (1000 / 2) - (50 / 2);
    return offset - (viewPosition * 50) + -34;
  };

  return (
    <div className="page-container">
      <div className="tape-window">
        <h3>Tape</h3>
        <div className="tape-container">
          <button onClick={handleScrollLeft}>Scroll Left</button>
          <div className="tape-wrapper">
            <motion.div
              className="tape"
              initial={false}
              animate={{ x: calculateOffset() }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {tape.map((cell, index) => (
                <motion.div
                  key={index}
                  className={`tape-cell ${index === headPosition ? 'head' : ''}`}
                  style={{ width: 50, height: 50, display: 'inline-block', border: '1px solid black', textAlign: 'center', lineHeight: '50px' }}
                >
                  {cell}
                </motion.div>
              ))}
            </motion.div>
          </div>
          <button onClick={handleScrollRight}>Scroll Right</button>
        </div>
        <div className="triangle"></div>
      </div>
      <div className="controls-window">
        <h3>Controls</h3>
        <button onClick={handleRun}>Run</button>
        <button onClick={handleStep}>Step</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div className="rules-window">
        <h3>Rules</h3>
        <div className="rules-editor" style={{ overflowY: 'auto', maxHeight: '400px', padding: '10px', border: '1px solid #ccc', overflowX: 'hidden' }}>

          {rules.map((rule, index) => (
            <div key={index} className="rule" style={{ overflow: 'hidden' }}>
              <div className="rule-inputs">
                <div className="name-fields">
                  <div className="input-field">
                    <h5>state name</h5>
                    <input type="text" placeholder="Name" value={rule.name || ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].name = e.target.value;
                      setRules(newRules);
                    }} />
                  </div>
                </div>
                <div className="state-fields">
                  <div className="input-field">
                    <h5>previous state</h5>
                    <input type="text" value={rule.previousState || ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].previousState = e.target.value;
                      setRules(newRules);
                    }} style={{ width: '32px' }} />
                  </div>
                  <div className="input-field">
                    <h5>read symbol</h5>
                    <input type="text" value={rule.readSymbol || ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].readSymbol = e.target.value;
                      setRules(newRules);
                    }} style={{ width: '32px' }} />
                  </div>
                  <div className="input-field">
                    <h5>write symbol</h5>
                    <input type="text" value={rule.writeSymbol || ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].writeSymbol = e.target.value;
                      setRules(newRules);
                    }} style={{ width: '32px' }} />
                  </div>
                  <div className="input-field">
                    <h5>next state</h5>
                    <input type="text" value={rule.nextState || ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].nextState = e.target.value;
                      setRules(newRules);
                    }} style={{ width: '32px' }} />
                  </div>
                  <div className="input-field">
                    <h5>move direction</h5>
                    <input type="text" value={rule.moveDirection || ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].moveDirection = e.target.value;
                      setRules(newRules);
                    }} style={{ width: '32px' }} />
                  </div>
                  <button onClick={() => handleDeleteRule(index)}>Delete Rule</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setRules([...rules, {
            name: "",
            previousState: "",
            readSymbol: "",
            writeSymbol: "",
            nextState: "",
            moveDirection: ""
          }])}>Add Rule</button>

        </div>
        <div className="save-load-button-window">
          <div className="save-buttons">
            <button onClick={handleSetRules}> Set Rules </button>
            <button onClick={handleSaveRules}>Save Configuration </button>
            <input id="config_name" type="text" value={configName} onChange={(e) => setConfigName(e.target.value)} ></input>
          </div>
          <div className="load-buttons">
            <button onClick={handleLoadRules}>Load Configuration </button>
            <input id="load_config_name" type="text" value={loadConfigName} onChange={(e) => setLoadConfigName(e.target.value)} ></input>
          </div>
        </div>
        {errorMessage && (
          <div style={{ color: "red", marginTop: "10px" }}>
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div style={{ color: "green", marginTop: "10px" }}>
            {successMessage}
          </div>
        )}
      </div>
      <div className="logout-window">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default EditorPage;
