import { useState } from 'react';
import styles from './styles.less';

const Index = ({ current }) => {
  return (
    <div className={styles.step}>
      <div className={`${styles.left} ${current >= 0 && styles.active}`}>1.添加待结算磅单</div>
      <div className={`${styles.right} ${current === 1 && styles.active}`}>2.查看结算单</div>
      <div className={styles.arrow}></div>
    </div>
  );
};

export default Index;
