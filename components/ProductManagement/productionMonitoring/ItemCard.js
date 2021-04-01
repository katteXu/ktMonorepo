import React from 'react';
import { Format } from '@utils/common';

const Index = props => {
  const { title, content, number, icon, style } = props;
  return (
    <div
      style={{
        flex: 1,
        marginRight: 24,
        height: 120,
        backgroundColor: '#fff',
        position: 'relative',
        padding: '24px 32px',
        fontSize: 16,
        ...style,
      }}>
      {/* <div>{title}</div> */}
      <span style={{ fontSize: 16 }}>{title}</span>
      <span style={{ fontSize: 36, margin: '0 12px', fontWeight: '600' }}>{Format.weight(number)}</span>吨
      <img style={{ width: 280, height: 120, position: 'absolute', right: 0, top: 0 }} src={icon} />
    </div>
  );
};

export default Index;
