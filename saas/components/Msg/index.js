import styles from './styles.less';
const Msg = ({ children, style }) => {
  return (
    <div className={styles.main} style={{ ...style }}>
      {children}
    </div>
  );
};

export default Msg;
