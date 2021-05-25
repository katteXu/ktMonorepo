import { Image } from '@components';
import styles from './styles.less';
const Index = props => {
  return (
    <div className={styles.emptyBox}>
      <div>
        <img src={Image.ListEmpty} className={styles.emptyImg} />
        <div className={styles.emptytxt}>暂无详情~</div>
      </div>
    </div>
  );
};
export default Index;
