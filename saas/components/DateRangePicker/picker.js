import styles from './styles.less';
import moment from 'moment';
const Picker = props => {
  const months = [
    '',
    '',
    '',
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
  ];
  return (
    <div className={styles['picker-box']}>
      <div className={styles.header}>2021年 1月</div>
      <div className={styles.content}>
        <div className={styles['week-header']}>
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span>六</span>
          <span>日</span>
        </div>
        <div className={styles['day-content']}>
          {months.map(item => (
            <div className={styles.cell}>
              <span className={item && styles.day}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Picker;
