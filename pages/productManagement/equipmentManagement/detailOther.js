import { useState, useEffect, useCallback } from 'react';
import { Layout, Search, Content, Status, Ellipsis, ChildTitle } from '@components';
import styles from './equipmentManagement.less';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Table, message } from 'antd';
import MasterMachine from '@components/ProductManagement/EquipmentManagement/masterMachine';
import { useRTTask } from '@components/Hooks';
import { product } from '@api';
import { getQuery } from '@utils/common';
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
      width: 300,
      render: value => <Ellipsis value={value} width={280} />,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   width: 120,
    //   render: value => value,
    // },
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
  const [dataList, setDataList] = useState({});
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  const [data, setData] = useState({});
  const { start, destory } = useRTTask({ interval: 5000 });
  const router = useRouter();
  const { id } = getQuery();

  useEffect(() => {
    getDetail(query);
    // setDetail();
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
      deviceId: id,
    };
    return product.device_detail({ params });
  };

  const getDetail = async ({ pageSize, page }) => {
    const params = {
      deviceId: id,
      limit: pageSize,
      page,
    };

    const res = await product.device_detail({ params });

    if (res.status === 0) {
      // setInfo(res.result.sub_devices);
      setDataList(res.result.log);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const getAllDetail = async () => {
    const params = {
      deviceId: id,
    };

    const res = await product.device_detail({ params });

    if (res.status === 0) {
      // setInfo(res.result.sub_devices);
      setData(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getDetail({ ...query, page });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDetail({ ...query, page: 1, pageSize });
    },
    [dataList]
  );
  //刷新页面
  const refreshData = () => {
    getDetail({ ...query });
    getAllDetail();
    // setDetail();
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section className={styles.root}>
          <div className={styles.area}>
            <div className={styles.title}>
              <ChildTitle style={{ color: '#333333', fontWeight: 600, marginBottom: '8px' }}>基本信息</ChildTitle>
            </div>
            <div className={styles.row}>
              <div className={styles.col}>
                <span className={styles.label}>设备名称：</span>
                <span className={styles.text}>{(data && data.name) || '--'}</span>
              </div>
              <div className={styles.col}>
                <span className={styles.label}>接入时间：</span>
                <span className={styles.text}>{(data && data.createAt) || '--'}</span>
              </div>
              <div className={styles.col}>
                <span className={styles.label}>备注：</span>
                <span className={styles.text}>{(data && data.remark) || '--'}</span>
              </div>
            </div>
          </div>
          <div className={styles.area}>
            <div className={styles.title}>
              <ChildTitle style={{ color: '#333333', fontWeight: 600, marginBottom: '8px' }}>运行数据</ChildTitle>
            </div>
            {/* 浮选机 */}
            {/* {dataList.category === 4 && <FlotationMachine data={dataList} refreshData={refreshData} did={did} />}
            {/* 主控机 */}
            {/* {dataList.category === 6 && <MasterMachine data={dataList} refreshData={refreshData} did={did} />} */}
            <MasterMachine data={data} refreshData={refreshData} did={id} />
          </div>
          <div className={styles.area}>
            <div className={styles.title}>
              <ChildTitle style={{ color: '#333333', fontWeight: 600, marginBottom: '8px' }}>动态记录</ChildTitle>
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
