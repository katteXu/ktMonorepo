import styles from './equipmentManagement.less';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import { Format } from '@utils/common';
import EditBeltScaleSpeed from '@components/ProductManagement/EquipmentManagement/editBeltScaleSpeed';
import { product } from '@api';
const Index = ({ onSubmit, did, refreshData, data }) => {
  const [visible, setVisible] = useState(false);
  const [speedInfo, setSpeedInfo] = useState(0);
  const [dataInfo, setDataInfo] = useState({});
  useEffect(() => {
    setDataInfo(data);
    setSpeedInfo(data.beltSpeed);
  }, [data]);

  const onclickStop = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认停止运行吗？',
      onOk: async () => {
        const params = {
          did,
          status: 1,
        };
        const res = await product.operateDeviceRunOrStop({ params });
        if (res.status === 0) {
          refreshData();
        } else {
          message.error(res.detail || res.description);
        }
      },

      okText: '确认',
      cancelText: '取消',
    });
  };

  const onclickOpen = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认运行吗？',
      onOk: async () => {
        const params = {
          did,
          status: 0,
        };
        const res = await product.operateDeviceRunOrStop({ params });
        if (res.status === 0) {
          refreshData();
        } else {
          message.error(res.detail || res.description);
        }
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  return (
    <>
      <div className={styles.row}>
        <div className={styles.col}>
          <span className={styles.label}>运行状态：</span>
          <span className={styles.text} style={{ color: '#66BD7E' }}>
            {dataInfo.runStatusZn}
          </span>
          <span
            className={styles.mainColor}
            style={{ marginLeft: 12 }}
            onClick={() => {
              dataInfo.runStatus === 0 ? onclickStop() : dataInfo.runStatus === 1 ? onclickOpen() : {};
            }}>
            {dataInfo.runStatus === 0 ? '停止' : dataInfo.runStatus === 1 ? '开启' : ''}
          </span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>连接状态：</span>
          <span className={styles.text}>{dataInfo.connectionStatusZn}</span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>本次运输总量：</span>
          <span className={styles.text}>{Format.weight(dataInfo.weight)}吨</span>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <span className={styles.label}>当前运转速度：</span>
          <span className={styles.text}>{(speedInfo / 10).toFixed(1)}m/s</span>
          <span className={styles.mainColor} style={{ marginLeft: 12 }} onClick={() => setVisible(true)}>
            设置
          </span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>当前运输货品：</span>
          <span className={styles.text}>{dataInfo.goodsType}</span>
        </div>
        <div className={styles.col}></div>
      </div>
      <Modal
        title="修改皮带秤速度"
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        destroyOnClose
        footer={null}>
        <EditBeltScaleSpeed
          did={did}
          onClose={() => setVisible(false)}
          onSubmit={speed => {
            setVisible(false);
            refreshData();
          }}
          speed={(speedInfo / 10).toFixed(1)}
        />
      </Modal>
    </>
  );
};

export default Index;
