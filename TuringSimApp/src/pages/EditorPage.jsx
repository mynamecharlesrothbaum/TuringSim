import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from "../hooks/UseAuth";

const EditorPage = () => {
  const MAX_TAPE_LENGTH = 128;
  const [tape, setTape] = useState(Array(MAX_TAPE_LENGTH).fill(""));
  const [running, setRunning] = useState(false);
  const [currentRuleIndex, setCurrentRuleIndex] = useState(null);
  const [headPosition, setHeadPosition] = useState(MAX_TAPE_LENGTH / 2);
  const [viewPosition, setViewPosition] = useState(MAX_TAPE_LENGTH / 2);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [configName, setConfigName] = useState("");
  const [loadConfigName, setLoadConfigName] = useState("");
  const [rules, setRules] = useState([]); 
  const { logout, save, load, loadPage} = useAuth();
  const location = useLocation();
  const [sliderValue, setSliderValue] = useState(500);
  const [simulationSpeed, setSimulationSpeed] = useState(500);

  const runningRef = useRef(running);

  React.useEffect(() => {
    runningRef.current = running;
  }, [running]);
  
  useEffect(() => {
    if (location.state) {
      const { rules: loadedRules, configName: loadedConfigName } = location.state;
      
      if (loadedRules && loadedConfigName) {
        setRules(loadedRules);
        setConfigName(loadedConfigName);
        setSuccessMessage("Configuration loaded successfully!");
      } else {
        console.log("Rules not found");
      }
    } else {
      console.log("No location state found.");
    }
  }, [location.state]);
  

  const handleRun = async () => {
    setRunning(true);
    runningRef.current = true;
  
    let localTape = [...tape];
    let localHeadPosition = headPosition;
    let currentRule = rules.find(r => r.readSymbol == localTape[localHeadPosition]);
    let currentIndex = rules.indexOf(currentRule);

    while (runningRef.current) {
  
      const currentSymbol = localTape[localHeadPosition];
  
      if (!currentRule) {
        setRunning(false);
        runningRef.current = false;
        console.log('Halted: No matching rule found');
        setCurrentRuleIndex(null);
        break;
      }
  
      const { readSymbol, writeSymbol, moveDirection, nextState } = currentRule;
  
      if (currentSymbol.toString() === readSymbol.toString()) {
        localTape[localHeadPosition] = writeSymbol;
        setTape([...localTape]);
      }
  
      if (moveDirection === 'R') {
        localHeadPosition = Math.min(localHeadPosition + 1, localTape.length - 1);
        setHeadPosition(localHeadPosition);
        handleScrollRight();
      }
  
      if (moveDirection === 'L') {
        localHeadPosition = Math.max(localHeadPosition - 1, 0);
        setHeadPosition(localHeadPosition);
        handleScrollLeft();
      }
  
      
      currentRule = rules.find(r => r.name === nextState && r.readSymbol == localTape[localHeadPosition]);
      currentIndex = rules.indexOf(currentRule);
      setCurrentRuleIndex(currentIndex);
      await wait(simulationSpeed);
    }
  
    setCurrentRuleIndex(null); 
  };

  const handleSliderChange = (event) => {
    setSliderValue(event.target.value);
    setSimulationSpeed(1000 - sliderValue);
  };
  

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const handleStep = () => {
    // Logic for executing a single step
  };

  const handleStop = () => {
    setRunning(false);
    runningRef.current = false;
  };

  const handleReset = () => {
    handleStop();
    setTape(Array(MAX_TAPE_LENGTH).fill(""));
    setViewPosition((prev) => MAX_TAPE_LENGTH / 2);
    setHeadPosition((prev) => MAX_TAPE_LENGTH / 2);
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
    setErrorMessage(null);

    for (const rule of rules) {
      if (typeof rule === 'object' && rule !== null) {
    
        const fields = ['name', 'previousState', 'readSymbol', 'writeSymbol', 'nextState', 'moveDirection'];
    
        for (const field of fields) {
          rule[field] = String(rule[field]);
    
         if (rule[field] === "") {
            rule[field] = "na";
         }
        }
    
      } else {
        setErrorMessage("Invalid rule detected", rule);
      }
    }
  
    return rules.every(rule =>
      rule &&
      typeof rule === 'object' &&
      Object.keys(rule).length > 0 &&
      rule.name && rule.name.length > 0 &&
      rule.previousState && rule.previousState.length > 0 &&
      rule.readSymbol && rule.readSymbol.length > 0 &&
      rule.writeSymbol && rule.writeSymbol.length > 0 &&
      rule.nextState && rule.nextState.length > 0 &&
      rule.moveDirection && rule.moveDirection.length > 0
    );
  };


  const handleSaveRules = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    console.log("rules in save",rules);

    if (!checkRules()) {
      setErrorMessage("Missing/Invalid fields in 1 or more rules. (Use 'na' for fields that should be empty)");
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
    await loadPage();
  };

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
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              {tape.map((cell, index) => (
                <motion.div
                  key={index}
                  className={`tape-cell ${index === headPosition ? 'head' : ''}`}
                  style={{
                    width: 50,
                    height: 50,
                    display: 'inline-block',
                    border: '1px solid black',
                    textAlign: 'center',
                    lineHeight: '50px'
                  }}
                >
                  <input
                    type="text"
                    value={cell}
                    maxLength={1}
                    onChange={(e) => {
                      const newTape = [...tape];
                      newTape[index] = e.target.value;
                      setTape(newTape);
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      textAlign: 'center',
                      border: 'none',
                      outline: 'none'
                    }}
                  />
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
        <div style={{ padding: '20px' }}>
          <p htmlFor="slider">Simulation Speed: {sliderValue / 10} % </p>
            <input
              type="range"
              id="slider"
              min="0"
              max="1000"
              value={sliderValue}
              onChange={handleSliderChange}
              style={{ width: '200px'}}
            />
        <div className="save-load-button-window">
          <div className="save-buttons">
            <button onClick={handleSaveRules}>Save Configuration </button>
            <input id="config_name" type="text" value={configName} onChange={(e) => setConfigName(e.target.value)} ></input>
          </div>
          <div className="load-buttons">
            <button onClick={handleLoadRules}>Load Configuration </button>
          </div>
        </div>
      <div className="logout-button">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  
      </div>
      <div className="rules-window">
        <h3>Rules</h3>
        <div className="rules-editor" style={{ overflowY: 'auto', maxHeight: '400px', padding: '10px', border: '1px solid #ccc', overflowX: 'hidden' }}>

          {rules.map((rule, index) => (
            <div key={index} className="rule" style={{ overflow: 'hidden' ,}}>
              <div className="rule-inputs" style={{backgroundColor: currentRuleIndex === index ? '#305d8a' : '#598abe',}}>
                <div className="name-fields">
                  <div className="input-field">
                    <h5>state name</h5>
                    <input type="text" placeholder="Name" value={rule.name} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].name = e.target.value.toString();
                      setRules(newRules);
                    }} />
                  </div>
                </div>
                <div className="state-fields">
                  <div className="input-field">
                    <h5>read symbol</h5>
                    <input type="text" value={rule.readSymbol ?? ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].readSymbol = e.target.value.toString();
                      setRules(newRules);
                    }} style={{ width: '32px' }} />
                  </div>
                  <div className="input-field">
                    <h5>write symbol</h5>
                    <input type="text" value={rule.writeSymbol ?? ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].writeSymbol = e.target.value.toString();
                      setRules(newRules);
                    }} style={{ width: '32px' }} />
                  </div>
                  <div className="input-field">
                    <h5>‎ </h5>
                    <h5>next state </h5>
                    <input type="text" value={rule.nextState ?? 'na'} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].nextState = e.target.value.toString();
                      setRules(newRules);
                    }} style={{ width: '72px' }} />
                  </div>
                  <div className="input-field">
                    <h5>move direction</h5>
                    <input type="text" value={rule.moveDirection ?? ''} onChange={(e) => {
                      const newRules = [...rules];
                      newRules[index].moveDirection = e.target.value.toString();
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
    </div>
  );
};

export default EditorPage;
