import { useState } from 'react';
import styles from './index.less';

const Index = ({ data }) => {
  return (
    <div className={styles.step}>
      <div
        className={`${styles.itemBox} ${data[0].key && styles.itemBoxActive}`}
        style={{ justifyContent: 'flex-end' }}>
        <span className={`${styles.item} ${data[0].key && styles.active}`}>{1}</span>
        {data[0].title}
      </div>
      <div className={styles.line}></div>
      <div className={`${styles.itemBox} ${data[1].key && styles.itemBoxActive}`}>
        <span className={`${styles.item} ${data[1].key && styles.active}`}>{2}</span>
        {data[1].title}
      </div>
    </div>
  );
};

export default Index;
