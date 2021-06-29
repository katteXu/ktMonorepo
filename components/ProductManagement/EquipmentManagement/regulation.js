import { useState, useEffect, useCallback } from 'react';
import { Layout, Search, Content, Status, Ellipsis, ChildTitle, Image } from '@components';
import { useRTTask } from '@components/Hooks';
import { product } from '@api';
import MasterMachine from '@components/ProductManagement/EquipmentManagement/masterMachine';
import Washbox from '@components/ProductManagement/EquipmentManagement/washbox';
import { message } from 'antd';
import styles from '../../../pages/productManagement/equipmentManagement/equipmentManagement.less';
const noImg = Image.EquipmentNo;

const Index = props => {
  const { start, destory } = useRTTask({ interval: 5000 });
  const [data1, setData1] = useState({});
  const [data2, setData2] = useState({});
  const [data3, setData3] = useState({});
  const [jiggerData, setJiggerData] = useState();

  useEffect(() => {
    start({
      api: () => {
        return getDataList();
      },
      callback: res => {
        if (res.status === 0) {
          setData1(res.result.jiggerData);
          setData2(res.result.master_data);
          setData3(res.result.flotation_data);
        } else {
          message.error(`${res.detail || res.description}`);
        }
      },
    });
  }, []);

  const getDataList = async () => {
    return product.device_regulation();
  };

  //刷新页面
  const refreshData = () => {};

  useEffect(() => {
    if (props.macThicknessData) {
      setJiggerData(props.macThicknessData);
    }
  }, [props.macThicknessData]);

  const noData = Object.keys(data1).length === 0 && Object.keys(data2).length === 0 && Object.keys(data3).length === 0;
  const noConnection =
    data1.connectionStatusZn === '未连接' &&
    data2.connectionStatusZn === '未连接' &&
    data3.connectionStatusZn === '未连接';
  return (
    <Content>
      {noData || noConnection ? (
        <div className={styles.loadingBox}>
          <img src={noImg} className={styles.noImg} />
          <div className={styles.text}>暂无可调控设备</div>
        </div>
      ) : (
        <section>
          {/* 跳汰机 */}
          {data1.connectionStatusZn != '未连接' && data1.thicknessFirstSetValue && (
            <div>
              <ChildTitle style={{ color: '#333333', fontWeight: 600, marginBottom: '8px' }}>跳汰机</ChildTitle>
              <Washbox data={data1} jiggerData={jiggerData} refreshData={refreshData} did={3} />
            </div>
          )}

          {/* 主控机 */}
          {data2.connectionStatusZn != '未连接' && (
            <div style={{ marginTop: 32 }}>
              <ChildTitle style={{ color: '#333333', fontWeight: 600, marginBottom: '8px' }}>主控机</ChildTitle>
              <MasterMachine data={data2} refreshData={refreshData} did={163} type="主控机" />
            </div>
          )}

          {/* 浮选机 */}
          {data3.connectionStatusZn != '未连接' && (
            <div style={{ marginTop: 32 }}>
              <ChildTitle style={{ color: '#333333', fontWeight: 600, marginBottom: '8px' }}>浮选机</ChildTitle>
              <MasterMachine data={data3} refreshData={refreshData} did={162} type="浮选机" />
            </div>
          )}
        </section>
      )}
    </Content>
  );
};

export default Index;
