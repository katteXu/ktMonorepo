import { useState, useCallback, useEffect } from 'react';
import { Layout, Content } from '@components';
import { message, Table } from 'antd';
import { getTruckQueryRecordDetailList } from '@api';
import styles from './style.less';
import Link from 'next/link';
import { getQuery } from '@utils/common';
const Detail = props => {
  const { id, trailerPlateNumber, createdAt, dateRange, beginAddress, endAddress } = getQuery();
  const routeView = {
    title: '轨迹详情',
    pageKey: 'searchRecord',
    longKey: 'transportLine.searchRecord',
    breadNav: [
      '车辆轨迹',
      <Link href="/transportLine/searchRecord">
        <a>查询记录</a>
      </Link>,
      '轨迹详情',
    ],
    pageTitle: '查询记录',
    useBack: true,
  };
  const columns = [
    {
      title: '停车时长',
      dataIndex: 'timeDiff',
      key: 'timeDiff',
      width: 120,
    },
    {
      title: '停车开始时间',
      dataIndex: 'stopBeginTime',
      key: 'stopBeginTime',
      width: 120,
    },
    {
      title: '停车结束时间',
      dataIndex: 'stopEndTime',
      key: 'estopEndTimend',
      width: 120,
    },
    {
      title: '停车位置',
      dataIndex: 'stopLocation',
      key: 'stopLocation',
      width: 120,
      align: 'right',
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    getDataList(query);
  }, []);

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});

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

  const getDataList = async query => {
    setLoading(true);
    const params = {
      id,
      page: query.page,
      limit: query.pageSize,
    };
    const res = await getTruckQueryRecordDetailList({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <div className={styles.content}>
            <div className={styles.plateNum}>
              <div>车牌号：{trailerPlateNumber}</div>
            </div>
            <div className={styles.date}>
              <div className={styles.item}>查询时间：{createdAt}</div>
              <div className={styles.item}>查询时间段：{dateRange}</div>
            </div>
            <div className={styles.address}>
              <div className={styles.item}>初始位置：{beginAddress}</div>
              <div className={styles.item}>终止位置：{endAddress}</div>
            </div>
          </div>
          <Table
            style={{ marginTop: 24 }}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            dataSource={dataList.data}
            loading={loading}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </Layout>
  );
};

export default Detail;
