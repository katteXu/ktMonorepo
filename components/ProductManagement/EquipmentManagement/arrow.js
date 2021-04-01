import React, { useState, useEffect } from 'react';
import { Icon } from '@components';

const Index = props => {
  const { title, direction, up } = props;

  const [arrDirection, setArrDirection] = useState('0deg');

  useEffect(() => {
    if (direction === 'right') {
      setArrDirection('180deg');
    } else if (direction === 'top') {
      setArrDirection('90deg');
    } else if (direction === 'bottom') {
      setArrDirection('270deg');
    }
  }, []);
  return (
    <>
      {up ? (
        <>
          <div style={{ position: 'relative', top: -10 }}>{title}</div>
          <img src={Icon.ArrowIcon} style={{ transform: `rotate(${arrDirection})` }} />
        </>
      ) : (
        <>
          <img src={Icon.ArrowIcon} style={{ transform: `rotate(${arrDirection})`, position: 'relative', top: -13 }} />
          <div style={{ position: 'relative', top: 10 }}>{title}</div>
        </>
      )}
    </>
  );
};

export default Index;
