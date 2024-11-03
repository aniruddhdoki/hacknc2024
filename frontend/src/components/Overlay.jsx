// src/components/Overlay.jsx
import React from 'react';

export const Overlay = ({ onClick }) => (
  <div
    onClick={onClick}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      opacity: 0.8,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 1,
    }}
  >
    <h2>Click to Start</h2>
  </div>
);
