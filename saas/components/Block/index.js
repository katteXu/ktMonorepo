import styles from './styles.less';
const Index = props => {
  const { children, title = '标题', right } = props;
  return (
    <div className={styles.main}>
      <div className={styles.title}>
        <span className={styles.left}>{title}</span>
        <div className={styles.right}>{right}</div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Index;
