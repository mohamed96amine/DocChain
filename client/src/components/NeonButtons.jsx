import React from 'react';
import { Button } from '@mui/material';
import { styled, keyframes } from '@mui/system';

const neonAnimation = keyframes`
  0%,
  100% {
    text-shadow: 0 0 4px #fff, 0 0 11px #fff, 0 0 19px #ff42ff, 0 0 40px #ff42ff, 0 0 80px #ff42ff, 0 0 90px #ff42ff, 0 0 100px #ff42ff, 0 0 150px #ff42ff;
  }
  50% {
    text-shadow: 0 0 4px #fff, 0 0 11px #fff, 0 0 19px #ff42ff, 0 0 40px #ff42ff, 0 0 80px #ff42ff, 0 0 90px #ff42ff, 0 0 100px #ff42ff, 0 0 150px #ff42ff, 0 0 30px #ff42ff, 0 0 60px #ff42ff, 0 0 70px #ff42ff, 0 0 100px #ff42ff, 0 0 120px #ff42ff;
  }
`;

const NeonButton = styled(Button)`
  background: linear-gradient(45deg, #ad1eeb 30%, #d938a9 90%);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  text-shadow: 0 0 4px #fff, 0 0 11px #fff, 0 0 19px #ff42ff, 0 0 40px #ff42ff, 0 0 80px #ff42ff, 0 0 90px #ff42ff, 0 0 100px #ff42ff, 0 0 150px #ff42ff;
  animation: ${neonAnimation} 1.5s ease-in-out infinite alternate;
  box-shadow: 0 3px 5px 2px rgba(255, 105, 135, 0.3);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 5px 2px rgba(255, 105, 135, 0.5);
  }
`;

const NeonButtons = () => {
  return (
    <div>
      <NeonButton onClick={() => console.log('Learn more clicked')}>En savoir plus</NeonButton>
      <NeonButton onClick={() => console.log('Visualize document clicked')}>Visualiser le document</NeonButton>
    </div>
  );
};

export default NeonButtons;
