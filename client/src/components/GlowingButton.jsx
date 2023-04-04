import React from "react";
import Button from "@mui/material/Button";
import { styled, keyframes } from "@mui/system";

const faultyFlicker = keyframes`
  0% { opacity: 0.1; }
  2% { opacity: 0.1; }
  4% { opacity: 0.5; }
  19% { opacity: 0.5; }
  21% { opacity: 0.1; }
  23% { opacity: 1; }
  80% { opacity: 0.5; }
  83% { opacity: 0.4; }
  87% { opacity: 1; }
`;

const textFlicker = keyframes`
  0% { opacity: 0.1; }
  2% { opacity: 1; }
  8% { opacity: 0.1; }
  9% { opacity: 1; }
  12% { opacity: 0.1; }
  20% { opacity: 1; }
  25% { opacity: 0.3; }
  30% { opacity: 1; }
  70% { opacity: 0.7; }
  72% { opacity: 0.2; }
  77% { opacity: 0.9; }
  100% { opacity: 0.9; }
`;

const GlowingButton = styled(Button)`
  --glow-color: hsl(186 100% 69%);
  position: relative;
  color: var(--glow-color);
  cursor: pointer;
  padding: 0.25em 0.75em;
  border: 0.1em solid var(--glow-color);
  border-radius: 0.35em;
  background: none;
  perspective: 2em;
  font-size: 0.8em;
  font-weight: 900;
  letter-spacing: 0.8em;
  -webkit-box-shadow: inset 0px 0px 0.5em 0px var(--glow-color),
    0px 0px 0.5em 0px var(--glow-color);
  -moz-box-shadow: inset 0px 0px 0.5em 0px var(--glow-color),
    0px 0px 0.5em 0px var(--glow-color);
  box-shadow: inset 0px 0px 0.5em 0px var(--glow-color),
    0px 0px 0.5em 0px var(--glow-color);
  animation: border-flicker 2s linear infinite;

  &:hover {
    color: rgba(0, 0, 0, 0.8);
    text-shadow: none;
    animation: none;
    -webkit-text-shadow: none;
    -moz-text-shadow: none;

    &::before {
      filter: blur(1.5em);
      opacity: 1;
    }

    &::after {
      opacity: 1;
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0.7;
    filter: blur(1em);
    transform: translateY(120%) rotateX(95deg) scale(1, 0.35);
    background: var(--glow-color);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    z-index: -1;
    background-color: var(--glow-color);
    box-shadow: 0 0 2em 0.2em var(--glow-color);
    transition: opacity 100ms linear;
  }
`;

const GlowingText = styled("span")`
  float: left;
  margin-right: -0.8em;
  -webkit-text-shadow: 0 0 0.125em hsl(0 0% 100% / 0.3),
    0 0 0.45em var(--glow-color);
  -moz-text-shadow: 0 0 0.125em hsl(0 0% 100% / 0.3),
    0 0 0.45em var(--glow-color);
  text-shadow: 0 0 0.125em hsl(0 0% 100% / 0.3), 0 0 0.45em var(--glow-color);
  animation: ${textFlicker} 3s linear infinite;
`;

const FaultyLetter = styled("span")`
  opacity: 0.5;
  animation: ${faultyFlicker} 2s linear infinite;
`;

const GlowingMuiButton = (props) => {
  return (
    <GlowingButton {...props}>
      <GlowingText>
        En Savo<FaultyLetter>ir</FaultyLetter> Pl<FaultyLetter>u</FaultyLetter>s
      </GlowingText>
    </GlowingButton>
  );
};

export default GlowingMuiButton;
