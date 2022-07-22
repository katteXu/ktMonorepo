import { Modal, Progress } from 'antd';
import { useEffect, useState } from 'react';
import styles from './styles.less';
import { Image } from '@components';
let timeout;
const LoadingCarIcon = ({ progress, onSuccess }) => {
  const [show, setShow] = useState(progress > 0);
  const [percent, setPercent] = useState();

  useEffect(() => {
    if (progress > 0) {
      setShow(true);
      setPercent(progress);
    }
  }, [progress]);

  useEffect(() => {
    if (percent === 0) return;

    if (percent === 100) {
      // 执行成功
      onSuccess && onSuccess();
      // 关闭弹窗
      setShow(false);
      // 清空进度条
      setPercent(0);
      // 停止延时增长进度条
      clearTimeout(timeout);
      return;
    }

    timeout = setTimeout(() => {
      setPercent(percent + 6);
    }, 50);

    if (percent > 93 && percent < 100) {
      setPercent(99);
      clearTimeout(timeout);
      return;
    }
  }, [percent]);

  return (
    <Modal
      maskClosable={true}
      closable={false}
      title={null}
      visible={show}
      footer={null}
      width={430}
      onCancel={() => setShow(false)}>
      <div className={styles.centent_info}>
        <div className={styles.title_car}>正在为您生成专属充值账号</div>
        <div className={styles.block_style}>
          <img src={Image.CarImg} className={styles.carImg} style={{ left: 266 * (percent / 100) }} />
        </div>
        <Progress percent={percent} status="normal" />
      </div>
    </Modal>
  );
};

export default LoadingCarIcon;
