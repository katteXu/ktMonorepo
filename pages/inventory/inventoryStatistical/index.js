import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Row, Col, Tooltip, Table, message } from 'antd';
import { Ellipsis, Layout, Content, Icon, Image } from '@components';
import { Format } from '@utils/common';
import { getGoodsType, inventory } from '@api';
import router from 'next/router';
import moment from 'moment';
import styles from './index.less';
const imgSrc = Image.InventoryBg;
import { useRTTask } from '@components/Hooks';
const Index = props => {
  const routeView = {
    title: '实时库存',
    pageKey: 'inventoryStatistical',
    longKey: 'inventory.inventoryStatistical',
    breadNav: '库存管理.实时库存',
    pageTitle: '实时库存',
  };
  const columns = [
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 150 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '货物类型',
      dataIndex: 'dataType',
      key: 'dataType',
      render: value => {
        const v = GoodsType[value];
        return v ? <Ellipsis value={v} width={130} /> : '-';
      },
    },
    {
      title: '当前库存(吨)',
      dataIndex: 'inventoryValue',
      key: 'inventoryValue',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '发货总量(吨)',
      dataIndex: 'poundOutSum',
      key: 'poundOutSum',
      // width: '280px',
      align: 'right',
      render: (value, data) => {
        return (
          <span
            style={{ color: value > 0 ? '#3d86ef' : '#4a4a5a', cursor: value > 0 ? 'pointer' : '' }}
            onClick={() => {
              value > 0 &&
                router.push(`/inventory/inventoryWater?waterTab=outbound&type=POUND&goodsName=${data.goodsName}`);
            }}>
            {Format.weight(value)}
          </span>
        );
      },
    },
    {
      title: '收货总量(吨)',
      dataIndex: 'poundInSum',
      key: 'poundInSum',
      // width: '280px',
      align: 'right',
      render: (value, data) => {
        return (
          <span
            style={{ color: value > 0 ? '#3d86ef' : '#4a4a5a', cursor: value > 0 ? 'pointer' : '' }}
            onClick={() => {
              value > 0 &&
                router.push(`/inventory/inventoryWater?waterTab=storage&type=POUND&goodsName=${data.goodsName}`);
            }}>
            {Format.weight(value)}
          </span>
        );
      },
    },
    {
      title: '选洗消耗总量(吨)',
      dataIndex: 'coalWashOutSum',
      key: 'coalWashOutSum',
      // width: '280px',
      align: 'right',
      render: (value, data) => {
        return (
          <span
            style={{ color: value > 0 ? '#3d86ef' : '#4a4a5a', cursor: value > 0 ? 'pointer' : '' }}
            onClick={() => {
              value > 0 &&
                router.push(`/inventory/inventoryWater?waterTab=outbound&type=COAL_WASH&goodsName=${data.goodsName}`);
            }}>
            {Format.weight(value)}
          </span>
        );
      },
    },
    {
      title: '选洗产出总量(吨)',
      dataIndex: 'coalWashInSum',
      key: 'coalWashInSum',
      // width: '280px',
      align: 'right',
      render: (value, data) => {
        return (
          <span
            style={{ color: value > 0 ? '#3d86ef' : '#4a4a5a', cursor: value > 0 ? 'pointer' : '' }}
            onClick={() => {
              value > 0 &&
                router.push(`/inventory/inventoryWater?waterTab=storage&type=COAL_WASH&goodsName=${data.goodsName}`);
            }}>
            {Format.weight(value)}
          </span>
        );
      },
    },
    {
      title: '配煤消耗总量(吨)',
      dataIndex: 'coleBlendingOutSum',
      key: 'coleBlendingOutSum',
      // width: '280px',
      align: 'right',
      render: (value, data) => {
        return (
          <span
            style={{ color: value > 0 ? '#3d86ef' : '#4a4a5a', cursor: value > 0 ? 'pointer' : '' }}
            onClick={() => {
              value > 0 &&
                router.push(
                  `/inventory/inventoryWater?waterTab=outbound&type=COAL_BLENDING&goodsName=${data.goodsName}`
                );
            }}>
            {Format.weight(value)}
          </span>
        );
      },
    },
    {
      title: '配煤产出总量(吨)',
      dataIndex: 'coleBlendingInSum',
      key: 'coleBlendingInSum',
      // width: '280px',
      align: 'right',
      render: (value, data) => {
        return (
          <span
            style={{ color: value > 0 ? '#3d86ef' : '#4a4a5a', cursor: value > 0 ? 'pointer' : '' }}
            onClick={() => {
              value > 0 &&
                router.push(
                  `/inventory/inventoryWater?waterTab=storage&type=COAL_BLENDING&goodsName=${data.goodsName}`
                );
            }}>
            {Format.weight(value)}
          </span>
        );
      },
    },
  ];
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  const queryRef = useRef(query);
  const [inventoryInfo, setInventoryInfo] = useState({});
  const { start, destory } = useRTTask({ interval: 5000 });
  const [GoodsType, setGoodsType] = useState({});
  // 初始化
  useEffect(() => {
    // 初始化货物类型
    initGoodsType();
    getStatisticalData(query);
    start({
      api: getData,
      callback: res => {
        setInventoryInfo(res.result);
        setDataList(res.result);
      },
    });
    // return () => {
    //   destory();
    // };
  }, []);

  // 初始化货物类型
  const initGoodsType = async () => {
    const res = await getGoodsType();
    if (res.status === 0) {
      const _goods = {};
      res.result.forEach(v => {
        _goods[v.key] = v.name;
      });
      setGoodsType(_goods);
    }
  };

  const getData = async () => {
    const query = queryRef.current;
    const params = {
      page: query.page,
      limit: query.pageSize,
    };
    return inventory.inventoryListTotalSum({ params });
  };

  const getStatisticalData = async ({ page, pageSize }) => {
    setLoading(true);
    const params = {
      page,
      limit: pageSize,
    };
    const res = await inventory.inventoryListTotalSum({ params });
    if (res.status === 0) {
      setInventoryInfo(res.result);
      setDataList(res.result);
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  };
  useEffect(() => {
    queryRef.current = query;
  }, [dataList]);

  useEffect(() => {
    return () => destory();
  }, []);

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getStatisticalData({ ...query, page, pageSize });
      destory();
      setTimeout(() => {
        start({
          api: getData,
          callback: res => {
            setInventoryInfo(res.result);
            setDataList(res.result);
          },
        });
      }, 3000);
    },
    [dataList]
  );
  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getStatisticalData({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  const startTime = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
  return (
    <Layout {...routeView}>
      <Row gutter={24} style={{ marginTop: 0, background: 'rgb(240, 242, 245)', marginBottom: 16 }}>
        <Col style={{ width: '25%' }}>
          <div className={`${styles['today-card']}`} style={{ backgroundImage: `url(${imgSrc})` }}>
            <div className={styles['total']}>
              <div className={styles.title}>
                仓储
                <img src={Icon.WareHousing} className={styles.warehousing} />
              </div>
              <div
                className={styles.numText}
                onClick={() =>
                  inventoryInfo.totalOutSum > 0 &&
                  router.push(`/inventory/inventoryWater?waterTab=outbound&startTime=${startTime}&nowTime=${nowTime}`)
                }>
                今日出库总量
                <span className={styles.num}>{Format.weight(inventoryInfo.totalOutSum) || 0}</span>吨
              </div>
              <div
                className={styles.numText}
                onClick={() =>
                  inventoryInfo.totalInSum > 0 &&
                  router.push(`/inventory/inventoryWater?waterTab=storage&startTime=${startTime}&nowTime=${nowTime}`)
                }>
                今日入库总量
                <span className={styles.num}>{Format.weight(inventoryInfo.totalInSum) || 0}</span>吨
              </div>
            </div>
          </div>
        </Col>
        <Col style={{ width: '25%' }}>
          <div className={`${styles['today-card']}`} style={{ backgroundImage: `url(${imgSrc})` }}>
            <div className={styles['in']}>
              <div className={styles.title}>
                过磅
                <img src={Icon.Weighting} className={styles.weighing} />
              </div>
              <div
                className={styles.numText}
                onClick={() =>
                  inventoryInfo.poundOutSum > 0 &&
                  router.push(
                    `/inventory/inventoryWater?waterTab=outbound&startTime=${startTime}&nowTime=${nowTime}&type=POUND`
                  )
                }>
                今日发货总量
                <span className={styles.num}>{Format.weight(inventoryInfo.poundOutSum) || 0}</span>吨
              </div>
              <div
                className={styles.numText}
                onClick={() =>
                  inventoryInfo.poundInSum > 0 &&
                  router.push(
                    `/inventory/inventoryWater?waterTab=storage&startTime=${startTime}&nowTime=${nowTime}&type=POUND`
                  )
                }>
                今日收货总量
                <span className={styles.num}>{Format.weight(inventoryInfo.poundInSum) || 0}</span>吨
              </div>
            </div>
          </div>
        </Col>
        <Col style={{ width: '25%' }}>
          <div className={`${styles['today-card']}`} style={{ backgroundImage: `url(${imgSrc})` }}>
            <div className={styles['out']}>
              <div className={styles.title}>
                洗煤
                <img src={Icon.Washing} className={styles.washing} />
              </div>
              <div
                className={styles.numText}
                onClick={() =>
                  inventoryInfo.coalWashInSum > 0 &&
                  router.push(
                    `/inventory/inventoryWater?waterTab=outbound&startTime=${inventoryInfo.coalWashBeginAt}&nowTime=${
                      inventoryInfo.coalWashEndAt != '' ? inventoryInfo.coalWashEndAt : nowTime
                    }&type=COAL_WASH`
                  )
                }>
                本次原煤洗选量
                <span className={styles.num}>{Format.weight(inventoryInfo.coalWashInSum) || 0}</span>吨
              </div>
              <div
                className={styles.numText}
                onClick={() =>
                  inventoryInfo.coalWashOutSum > 0 &&
                  router.push(
                    `/inventory/inventoryWater?waterTab=storage&startTime=${inventoryInfo.coalWashBeginAt}&nowTime=${
                      inventoryInfo.coalWashEndAt != '' ? inventoryInfo.coalWashEndAt : nowTime
                    }&type=COAL_WASH`
                  )
                }>
                本次精煤产出量
                <span className={styles.num}>{Format.weight(inventoryInfo.coalWashOutSum) || 0}</span>吨
              </div>
            </div>
          </div>
        </Col>
        <Col style={{ width: '25%' }}>
          <div className={`${styles['today-card']}`} style={{ backgroundImage: `url(${imgSrc})` }}>
            <div className={styles['consume']}>
              <div className={styles.title}>
                配煤
                <img src={Icon.Blending} className={styles.blending} />
              </div>
              <div
                className={styles.numText}
                onClick={() =>
                  inventoryInfo.coleBlendingOutSum > 0 &&
                  router.push(
                    `/inventory/inventoryWater?waterTab=outbound&startTime=${startTime}&nowTime=${nowTime}&type=COAL_BLENDING`
                  )
                }>
                今日原料消耗量
                <span className={styles.num}>{Format.weight(inventoryInfo.coleBlendingOutSum) || 0}</span>吨
              </div>
              <div
                className={styles.numText}
                onClick={() =>
                  inventoryInfo.coleBlendingInSum > 0 &&
                  router.push(
                    `/inventory/inventoryWater?waterTab=storage&startTime=${startTime}&nowTime=${nowTime}&type=COAL_BLENDING`
                  )
                }>
                今日成品产出量
                <span className={styles.num}>{Format.weight(inventoryInfo.coleBlendingInSum) || 0}</span>吨
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <section style={{ paddingTop: 0 }}>
          <header style={{ padding: '7px 16px', margin: '0 -16px 16px' }}>库存列表</header>
          <Table
            rowKey={r => r.dataType + r.goodsName}
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </Layout>
  );
};

// export default StockTaking;
export default Index;
