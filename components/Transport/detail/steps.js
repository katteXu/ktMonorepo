import { useState, useEffect, Fragment } from 'react';
import styles from './step.less';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const Step = props => {
  const { statusFlow } = props.dataInfo;
  const [step, setStep] = useState();
  useEffect(() => {
    for (let i = 0; i < statusFlow.length; i++) {
      if (statusFlow[i].time === '') {
        setStep(i);
        break;
      } else {
        setStep(statusFlow.length);
      }
    }
  }, [statusFlow]);
  return (
    <div className={styles.steps}>
      <div className={styles['step-block']}>
        {statusFlow.map((item, index) => {
          return (
            <Fragment key={index}>
              <div
                className={`${styles['step-item']} ${item.time === null ? '' : step == index + 1 && styles.current}`}>
                <div
                  className={
                    item.point === '已驳回'
                      ? styles['closeIcon']
                      : step > index + 1
                      ? styles['beforeIcon']
                      : styles['icon']
                  }>
                  {item.point === '已驳回' ? <CloseOutlined></CloseOutlined> : <CheckOutlined></CheckOutlined>}
                </div>
                <div className={styles['title']}>{item.point}</div>
                <div className={styles['time']}>{item.time}</div>
              </div>
              {index != statusFlow.length - 1 ? (
                <div className={`${styles['step-line']} ${step > index + 1 && styles.active}`}></div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Step;
