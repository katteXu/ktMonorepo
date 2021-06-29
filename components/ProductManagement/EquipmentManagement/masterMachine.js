import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Search, Content, Status, Ellipsis, ChildTitle } from '@components';
import styles from '../../../pages/productManagement/equipmentManagement/equipmentManagement.less';
import Link from 'next/link';
import { Modal, Input, message } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { useRTTask } from '@components/Hooks';
import { Format } from '@utils/common';
import { product } from '@api';
import CardItem from './cardItem';
const Index = props => {
  const { data, did, refreshData, type } = props;
  const inputRef = useRef();

  const [info, setInfo] = useState([]);
  const [dataInfo, setDataInfo] = useState({});

  const refDetail = () => {
    // getDetail();
    refreshData();
  };

  return (
    <>
      {type ? (
        <div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.label}>设备名称：</div>
              <div className={styles.text} style={{ color: '#66BD7E' }}>
                {type}
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.label}>控制设备数量：</div>
              <div className={styles.text} style={{ color: '#66BD7E' }}>
                {/* 运行中 */}
                {data.count}
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.label}>运行设备数量：</div>
              <div className={styles.text} style={{ color: '#66BD7E' }}>
                {/* 运行中 */}
                {data.running_count}
              </div>
            </div>
          </div>
          <div className={styles.row} style={{ marginTop: 16 }}>
            <div className={styles.col}>
              <span className={styles.label}>连接状态：</span>
              <span className={styles.text}>{data.connectionStatusZn || '-'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.label}>运行设备数量：</div>
            <div className={styles.text} style={{ color: '#66BD7E' }}>
              {/* 运行中 */}
              {data.count}
            </div>
          </div>
          <div className={styles.col}>
            <span className={styles.label}>连接状态：</span>
            <span className={styles.text}>{data.connectionStatusZn || '-'}</span>
          </div>
          <div className={styles.col}></div>
        </div>
      )}

      <div className={styles['equipment-box']}>
        <div className={styles.equipmentBlock} style={{ width: (data.column ? data.column : 10) * 142 }}>
          {data.sub_devices &&
            data.sub_devices.map((val, key) => <CardItem data={val} refDetail={refDetail} did={did} key={key} />)}
        </div>
      </div>
    </>
  );
};

export default Index;
