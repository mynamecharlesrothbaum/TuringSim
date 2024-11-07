import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from "../hooks/UseAuth";

const EditorPage = () => {
  const [tape, setTape] = useState([0, 1, 0, 1, 0, 0, 1]); // Initial tape state
  const [headPosition, setHeadPosition] = useState(3); // Head starts at the center
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

  const handleLogout = () => {
    logout();
  };

  const handleScrollLeft = () => {
    setHeadPosition((prev) => Math.max(prev - 1, 0));
  };

  const handleScrollRight = () => {
    setHeadPosition((prev) => Math.min(prev + 1, tape.length - 1));
  };

  return (
    <div className="editor-container">
      <div className="tape-container">
        <button onClick={handleScrollLeft}>Scroll Left</button>
        <div className="tape-wrapper">
          <motion.div 
            className="tape"
            initial={false}
            animate={{ x: -headPosition * 50 }}
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
      <div className="controls">
        <button onClick={handleRun}>Run</button>
        <button onClick={handleStep}>Step</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={() => setTape([0, 0, 0, 0])}>Reset</button>
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
