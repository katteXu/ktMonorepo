import styles from './styles.less';
const Title = ({ style }) => {
  return (
    <div className={styles.title} style={{ float: 'right', ...style }}>
      <span className={styles.block}>
        <i className={`${styles.icon} ${styles.red}`}></i>
        {'收货净重>40吨'}
      </span>
      <span className={styles.block}>
        <i className={`${styles.icon} ${styles.green}`}></i>
        {'收货净重<10吨'}
      </span>
      <span className={styles.block} style={{ marginRight: 0 }}>
        <i className={`${styles.icon} ${styles.yellow}`}></i>
        {'实际运费<50元'}
      </span>
    </div>
  );
};

export default Title;
