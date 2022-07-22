import React from 'react';
import styles from './styles.less';
const Progress = () => {
  return (
    <div className={styles.progress}>
      <div className={styles.item}>
        <span>第一步.</span>
        选择要开票的合同/运单
      </div>
      <div className={styles.line}></div>
      <div className={styles.item}>
        <span>第二步.</span>
        添加到对账单
      </div>
      <div className={styles.line}></div>
      <div className={styles.item}>
        <span>第三步.</span>
        查看对账单
      </div>
    </div>
  );
};

export default Progress;
