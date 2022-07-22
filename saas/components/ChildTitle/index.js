import styles from './styles.less';
const ChildTitles = ({ className, children, style }) => {
  return (
    <div className={`${styles.main} ${styles[className]}`} style={{ ...style }}>
      {children}
    </div>
  );
};

export default ChildTitles;
