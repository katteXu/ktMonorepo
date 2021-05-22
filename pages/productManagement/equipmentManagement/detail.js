import { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Ellipsis, ChildTitle } from '@components';
import styles from './equipmentManagement.less';
import Link from 'next/link';
import { Table, message } from 'antd';
import PoundDetail from '@components/ProductManagement/EquipmentManagement/poundDetail';
import WashboxDetail from '@components/ProductManagement/EquipmentManagement/washboxDetail';
import Separator from '@components/ProductManagement/EquipmentManagement/separator';
import BeltScale from '@components/ProductManagement/EquipmentManagement/beltScale';
import { useRTTask } from '@components/Hooks';
import { getQuery } from '@utils/common';
import { product } from '@api';
const Index = props => {
  const routeView = {
    title: '设备详情',
    pageKey: 'equipmentManagement',
    longKey: 'productManagement.equipmentManagement',
    breadNav: [
      '智慧工厂',
      <Link href="/productManagement/equipmentManagement">
        <a>设备管理</a>
      </Link>,
      '设备详情',
    ],

    pageTitle: '设备详情',
    useBack: true,
  };

  const columns = [
    {
      title: '调节时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: value => value,
    },
    {
      title: '调节方式',
      dataIndex: 'editTypeZn',
      key: 'editTypeZn',
      width: 120,
      render: value => value,
    },
    {
      title: '调节参数',
      dataIndex: 'content',
      key: 'content',
      width: 180,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      render: value => value,
    },
    {
      title: '操作员',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
      align: 'right',
      render: value => value,
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  const [data, setData] = useState({});
  const { start, destory } = useRTTask({ interval: 5000 });
  const { id: did, type } = getQuery();

  useEffect(() => {
    getDataList(query);
    setDetail();
    start({
      api: getPollingData,
      callback: res => {
        setData(res.result);
      },
    });
    return () => {
      destory();
    };
  }, []);

  // 详情轮询
  const getPollingData = async () => {
    const params = {
      did: did,
    };
    return product.getDeviceDetail({ params });
  };

  const setDetail = async () => {
    const params = { did: did };

    return product.getDeviceDetail({ params });

    // setLoading(false);
  };

  const getDataList = async ({ pageSize, page }) => {
    setLoading(true);
    const params = {
      did: did,
      limit: pageSize,
      page,
    };

    const res = await product.getDeviceEditList({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getDataList({ ...query, page });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );
  //刷新页面
  const refreshData = () => {
    getDataList({ ...query });
    setDetail();
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section className={styles.root}>
          <div className={styles.area}>
            <div className={styles.title}>
              <ChildTitle style={{ color: '#4A4A5A', fontWeight: 600, marginBottom: '8px' }}>基本信息</ChildTitle>
            </div>
            <div className={styles.row}>
              <div className={styles.col}>
                <span className={styles.label}>设备名称：</span>
                <span className={styles.text}>{data.name || '--'}</span>
              </div>
              <div className={styles.col}>
                <span className={styles.label}>接入时间：</span>
                <span className={styles.text}>{data.connectionTime || '--'}</span>
              </div>
              <div className={styles.col}>
                <span className={styles.label}>备注：</span>
                <span className={styles.text}>{data.remark || '--'}</span>
              </div>
            </div>
          </div>
          <div className={styles.area}>
            <div className={styles.title}>
              <ChildTitle style={{ color: '#4A4A5A', fontWeight: 600, marginBottom: '8px' }}>运行数据</ChildTitle>
            </div>
            {/* 磅机 */}
            {data.category === 0 && <PoundDetail data={data} refreshData={refreshData} did={did} />}
            {/* 原煤皮带秤 精煤皮带秤 */}
            {(data.category === 1 || data.category === 5) && (
              <BeltScale data={data} refreshData={refreshData} did={did} />
            )}
            {/* 跳汰机 */}
            {data.category === 2 && <WashboxDetail data={data} refreshData={refreshData} did={did} />}
            {/* 旋流分选机 */}
            {data.category === 3 && <Separator data={data} refreshData={refreshData} did={did} />}
          </div>
          <div className={styles.area}>
            <div className={styles.title}>
              <ChildTitle style={{ color: '#4A4A5A', fontWeight: 600, marginBottom: '8px' }}>动态记录</ChildTitle>
            </div>
            <Table
              style={{ marginTop: 16 }}
              loading={loading}
              dataSource={dataList.data}
              columns={columns}
              scroll={{ x: 'auto' }}
              pagination={{
                onChange: onChangePage,
                pageSize: query.pageSize,
                current: query.page,
                total: dataList.count,
                onShowSizeChange: onChangePageSize,
              }}
            />
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
