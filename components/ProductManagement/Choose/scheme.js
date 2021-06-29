// 方案
import React, { useState, useEffect } from 'react';
import { Table, Progress } from 'antd';
import { RosePie } from '@components/Charts';
import styles from './styles.less';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Format } from '@utils/common';
const Scheme = props => {
  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '水分(% Mad)',
      dataIndex: 'data1',
      key: 'data1',
      width: 120,
      align: 'right',
    },
    {
      title: '灰分(% Ad)',
      dataIndex: 'data2',
      key: 'data2',
      width: 120,
      align: 'right',
    },
    {
      title: '挥发(% Vdaf)',
      dataIndex: 'data3',
      key: 'data3',
      width: 120,
      align: 'right',
    },
    {
      title: '全硫(% Std)',
      dataIndex: 'data4',
      key: 'data4',
      width: 120,
      align: 'right',
    },
    {
      title: '固定碳(% Fcd)',
      dataIndex: 'data5',
      key: 'data5',
      width: 120,
      align: 'right',
    },
    {
      title: '回收(% r)',
      dataIndex: 'data6',
      key: 'data6',
      width: 120,
      align: 'right',
    },
    {
      title: '粘结指数(% GRI)',
      dataIndex: 'data7',
      key: 'data7',
      width: 120,
      align: 'right',
    },
    {
      title: '胶质层(% Y)',
      dataIndex: 'data8',
      key: 'data8',
      align: 'right',
      width: 120,
      align: 'right',
    },
  ];
  const [AIPieData, setAIPieData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataInfo, setDataInfo] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [inputScheme, setInputScheme] = useState({});
  const [inventory, setInventory] = useState({});
  const [newPieData, setNewPieData] = useState([]);
  useEffect(() => {
    const aiDataPieInfo = (props.dataInfo && props.dataInfo.rawMaterial) || [];
    if (aiDataPieInfo.length > 0) {
      setAIPieData(
        aiDataPieInfo.map(item => ({
          key: `${item.inventoryId === '' ? '(推荐)' : ''}${
            item.goodsName.length > 10 ? item.goodsName.substring(0, 10) + '...' : item.goodsName
          }:${item.proportion / 100}%`,
          value: item.proportion / 100,
        }))
      );
    } else {
      setAIPieData([{ key: '空', value: 0 }]);
    }

    const newDataPieInfo =
      (props.dataInfo && props.dataInfo.inputScheme && props.dataInfo.inputScheme.rawMaterial) || [];
    if (newDataPieInfo.length > 0) {
      setNewPieData(
        newDataPieInfo.map(item => ({
          key: `${item.goodsName}:${item.proportion / 100}%`,
          value: item.proportion / 100,
        }))
      );
    } else {
      setNewPieData([{ key: '空', value: 0 }]);
    }

    setInputScheme(props.dataInfo && props.dataInfo.inputScheme);
    setDataInfo(props.dataInfo);
    setInventory(props.dataInfo && props.dataInfo.inventory);
  }, [props.dataInfo]);

  useEffect(() => {
    const inventory = props.dataInfo && props.dataInfo.inventory;

    const dataInfo = props.dataInfo && props.dataInfo;
    let dataSource = dataInfo && [
      {
        name: '指标',
        data1: inventory && Format.range(inventory.waterContentMin, inventory.waterContentMax),
        data2: inventory && Format.range(inventory.ashContentMin, inventory.ashContentMax),
        data3: inventory && Format.range(inventory.volatilizationMin, inventory.volatilizationMax),
        data4: inventory && Format.range(inventory.sulfurMin, inventory.sulfurMax),
        data5: inventory && Format.range(inventory.carbonMin, inventory.carbonMax),
        data6: inventory && Format.range(inventory.recoveryMin, inventory.recoveryMax),
        data7: inventory && Format.range(inventory.bondMin, inventory.bondMax),
        data8: inventory && Format.range(inventory.colloidMin, inventory.colloidMax),
      },
      {
        name: 'AI预测',
        data1: (dataInfo.predictWaterContent / 100).toFixed(2),
        data2: (dataInfo.predictAshContent / 100).toFixed(2),
        data3: (dataInfo.predictVolatilization / 100).toFixed(2),
        data4: (dataInfo.predictSulfur / 100).toFixed(2),
        data5: (dataInfo.predictCarbon / 100).toFixed(2),
        data6: (dataInfo.predictRecovery / 100).toFixed(2),
        data7: (dataInfo.predictBond / 100).toFixed(2),
        data8: (dataInfo.predictColloid / 100).toFixed(2),
      },
      {
        name: '实际产出',
        data1: (dataInfo.waterContent / 100).toFixed(2),
        data2: (dataInfo.ashContent / 100).toFixed(2),
        data3: (dataInfo.volatilization / 100).toFixed(2),
        data4: (dataInfo.sulfur / 100).toFixed(2),
        data5: (dataInfo.carbon / 100).toFixed(2),
        data6: (dataInfo.recovery / 100).toFixed(2),
        data7: (dataInfo.bond / 100).toFixed(2),
        data8: (dataInfo.colloid / 100).toFixed(2),
      },
    ];
    setDataSource(dataSource);
  }, [props.dataInfo]);

  const aiProcess = dataInfo ? (dataInfo.predictUnitPrice / 100).toFixed(2) : 0;
  const currProcess = inputScheme ? Format.price(inputScheme.unitPrice) * 1 : 0;
  const actualProcess = dataInfo ? (dataInfo.unitPrice / 100).toFixed(2) : 0;
  let total = Math.max(aiProcess, currProcess, actualProcess);
  try {
    total = total < 1000 ? 1000 : (total.toString()[0] + 1) * (total.toString().length - 1);
    // 用于调试
    window.total = total;
  } catch {
    total = 0;
  }

  let ctrlNum = aiProcess && currProcess ? Math.abs(((aiProcess - currProcess) / currProcess) * 100) : 0;

  return (
    <div className={styles.scheme}>
      <div className={styles['scheme-block']}>
        <div className={styles['ai-scheme']}>
          <div className={styles.title}>AI配比方案</div>
          <RosePie key="1" data={AIPieData} />
        </div>
        <div className={styles['curr-scheme']}>
          <div className={styles.title}>现配比方案</div>
          <RosePie key="2" data={newPieData} />
        </div>
      </div>

      <div className={styles['cost-block']}>
        <div className={styles.title}>
          成本控制
          {ctrlNum ? (
            <span className={`${styles['ctrl-num']} ${aiProcess < currProcess ? styles.fall : styles.growth}`}>
              {ctrlNum ? `${ctrlNum.toFixed(2)}%` : ''}
              {aiProcess > currProcess ? (
                <RiseOutlined style={{ fontSize: 40 }} />
              ) : (
                <FallOutlined style={{ fontSize: 40 }} />
              )}
            </span>
          ) : null}
        </div>
        <div className={styles.body}>
          <div className={styles.progress}>
            <span className={styles.desc}>AI优化成本</span>
            <span className={styles.num}>{(dataInfo && Format.price(dataInfo.predictUnitPrice)) || 0}</span>
          </div>
          <Progress percent={(aiProcess / total) * 100} showInfo={false} strokeColor="#477AEF" strokeWidth={10} />
          <div className={styles.progress}>
            <span className={styles.desc}>现配比成本</span>
            <span className={styles.num}>{inputScheme && Format.price(inputScheme.unitPrice)}</span>
          </div>
          <Progress percent={(currProcess / total) * 100} showInfo={false} strokeColor="#FF8742" strokeWidth={10} />
          <div className={styles.progress}>
            <span className={styles.desc}>实际产出</span>
            <span className={styles.num}>{dataInfo ? (dataInfo.unitPrice / 100).toFixed(2) : 0}</span>
          </div>
          <Progress percent={(actualProcess / total) * 100} showInfo={false} strokeColor="#46B8AF" strokeWidth={10} />
        </div>
      </div>

      <Table columns={columns} pagination={false} dataSource={dataSource} loading={loading} scroll={{ x: 'auto' }} />
    </div>
  );
};

export default Scheme;
