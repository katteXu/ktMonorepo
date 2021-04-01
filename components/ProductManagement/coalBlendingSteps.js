import { useState } from 'react';
import styles from './style.less';

const CoalBlendingSteps = ({ step = 1 }) => {
  return (
    <div className={styles.steps}>
      <div className={styles['step-block']}>
        <div className={`${styles['step-item']} ${step >= 1 && styles.current}`}>
          <div className={styles['num']}>1</div>
          <span className={styles['title']}>原料煤</span>
        </div>
        {/* 线 */}
        <div className={`${styles['step-line']} ${step > 1 && styles.active}`}>
          <span className={styles.desc}>选煤</span>
        </div>
        <div className={`${styles['step-item']} ${step >= 2 && styles.current}`}>
          <div className={styles['num']}>2</div>
          <span className={styles['title']}>智能配煤</span>
        </div>
        {/* 线 */}
        <div className={`${styles['step-line']} ${step > 2 && styles.active}`}>
          <span className={styles.desc}>配煤</span>
        </div>
        <div className={`${styles['step-item']} ${step >= 3 && styles.current}`}>
          <div className={styles['num']}>3</div>
          <span className={styles['title']}>目标煤种及指标</span>
        </div>
        {/* 线 */}
        <div className={`${styles['step-line']} ${step > 3 && styles.active}`}>
          <span className={styles.desc}>生成</span>
        </div>
        <div className={`${styles['step-item']} ${step === 4 && styles.current}`}>
          <div className={styles['num']}>4</div>
          <span className={styles['title']}>AI配比方案及指标预测</span>
        </div>
      </div>
    </div>
  );
};

export default CoalBlendingSteps;
