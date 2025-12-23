import React from 'react';

interface PlanetIconProps {
  color?: string;
  width?: number;
}

const DEFAULT_WIDTH = 13;
const DEFAULT_HEIGHT = 17;
const ASPECT_RATIO = DEFAULT_HEIGHT / DEFAULT_WIDTH;

const PlanetIcon: React.FC<PlanetIconProps> = ({
  color = "#312b2b",
  width = DEFAULT_WIDTH
}) => {

  const calcHeight = width * ASPECT_RATIO;

  return (      
    <svg
      width={width}
      height={calcHeight}
      viewBox="0 0 13 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path opacity="0.95" d="M6.18806 1.25L11.1261 10.0288H1.25L6.18806 1.25Z" fill="white" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
      <path opacity="0.95" d="M6.18813 16.75C6.86993 16.75 7.42264 16.1973 7.42264 15.5155C7.42264 14.8337 6.86993 14.281 6.18813 14.281C5.50632 14.281 4.95361 14.8337 4.95361 15.5155C4.95361 16.1973 5.50632 16.75 6.18813 16.75Z" fill="white"/>      
    </svg>
  );
};

export default PlanetIcon;



