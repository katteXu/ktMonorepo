import styles from './styles.less';

const Content = props => {
  const { children, style } = props;
  return (
    <div className={styles.block} style={style}>
      {children}
    </div>
  );
};

export default Content;
