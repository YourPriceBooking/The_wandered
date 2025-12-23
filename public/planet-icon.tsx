<svg width="21" height="11" viewBox="0 0 21 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.1833 10.1833C12.8296 10.1833 14.9749 8.03801 14.9749 5.39164C14.9749 2.74528 12.8296 0.599976 10.1833 0.599976C7.5369 0.599976 5.3916 2.74528 5.3916 5.39164C5.3916 8.03801 7.5369 10.1833 10.1833 10.1833Z" stroke="#312B2B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M0.600098 5.3916C2.99593 2.5166 17.3709 2.5166 19.7668 5.3916" stroke="#312B2B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>



import React from 'react';

interface PlanetIconProps {
  color?: string;
  width?: number;
}

const DEFAULT_WIDTH = 19;
const DEFAULT_HEIGHT = 9;
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
      viewBox="0 0 21 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10.1833 10.1833C12.8296 10.1833 14.9749 8.03801 14.9749 5.39164C14.9749 2.74528 12.8296 0.599976 10.1833 0.599976C7.5369 0.599976 5.3916 2.74528 5.3916 5.39164C5.3916 8.03801 7.5369 10.1833 10.1833 10.1833Z" stroke="#312B2B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M0.600098 5.3916C2.99593 2.5166 17.3709 2.5166 19.7668 5.3916" stroke="#312B2B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
};

export default PlanetIcon;
