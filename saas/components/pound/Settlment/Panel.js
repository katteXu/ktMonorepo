import styles from './styles.less';

const Panel = ({ children, style }) => {
  return (
    <div className={styles.panel} style={style}>
      {children}
    </div>
  );
};

export default Panel;
