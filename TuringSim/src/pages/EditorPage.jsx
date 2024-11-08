import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from "../hooks/UseAuth";

const EditorPage = () => {
  const MAX_TAPE_LENGTH = 1000;
  const [tape, setTape] = useState(Array(MAX_TAPE_LENGTH).fill(0)); // Initial tape state
  const [headPosition, setHeadPosition] = useState(MAX_TAPE_LENGTH/2); // Head starts at the center
  const [viewPosition, setViewPosition] = useState(MAX_TAPE_LENGTH/2); 
  const [rules, setRules] = useState([]); // Rules for the Turing Machine
  const { logout } = useAuth();

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
    setTape(Array(MAX_TAPE_LENGTH).fill(0))
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

  const calculateOffset = () => {
    const offset = (1000 / 2) - (50 / 2);
    return offset - (viewPosition * 50)+16;
  };

  return (
    <div className="editor-container">
      <div className="tape-container">
        <button onClick={handleScrollLeft}>Scroll Left</button>
        <div className="tape-wrapper">
          <motion.div 
            className="tape"
            initial={false}
            animate={{x: calculateOffset()}}
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
      <div className="controls">
        <button onClick={handleRun}>Run</button>
        <button onClick={handleStep}>Step</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div className="rules-editor">
        <h3>Rules</h3>
        {/* Map through existing rules and display them here */}
        <button onClick={() => setRules([...rules, {}])}>Add Rule</button>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default EditorPage;
