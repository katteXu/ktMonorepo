import styles from './styles.less';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Image } from '@components';

const Empty = props => {
  // 点击事件
  const handleClick = () => {
    props.onClick && props.onClick();
  };
  return (
    <div className={styles.empty}>
      <img src={Image.SettlmentEmpty} alt="" />
      <div className={styles.txt}>暂无待结算的磅单，请添加</div>
      <div className={styles.btn}>
        <Button icon={<PlusOutlined />} type="primary" onClick={handleClick}>
          添加
        </Button>
      </div>
    </div>
  );
};

export default Empty;
