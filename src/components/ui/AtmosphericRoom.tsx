import React from 'react';

export const AtmosphericRoom: React.FC = () => {
  return (
    <div className="room-backdrop pointer-events-none select-none">
      <div className="back-wall" />
      <div className="left-bay" />
      <div className="left-column" />
      <div className="right-wall" />
      <div className="ceiling-lights" />
      <div className="stairs" />
      <div className="floor" />
      <div className="beam" />
      <div className="vignette" />
    </div>
  );
};
