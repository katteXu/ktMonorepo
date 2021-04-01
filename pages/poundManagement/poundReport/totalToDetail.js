/** @format */

import React, { useState, useEffect, useCallback } from 'react';
import { Table, message, Tooltip } from 'antd';
import { Content, Msg, Layout, LoadingBtn } from '@components';
import Link from 'next/link';
import { pound, downLoadFile } from '@api';
import { Format, getQuery } from '@utils/common';

const TotalReportDetail = () => {
  const routeView = {
    title: '汇总收货详情',
    pageKey: 'poundReport',
    longKey: 'poundManagement.poundReport',
    breadNav: [
      '过磅管理',
      <Link href="/poundManagement/poundReport">
        <a>磅单报表</a>
      </Link>,
      '汇总收货详情',
    ],
    useBack: true,
    pageTitle: '汇总收货详情',
  };

  const [sort, setSort] = useState('descend');
  const [dataList, setDataList] = useState({});
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 150,
      sorter: true,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 200,
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
      title: '发货企业',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
    },
    {
      title: '原发净重（吨）',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      align: 'right',
      width: 100,
      render: (value, record) => {
        const { fromGoodsWeight } = record;

        return Format.weight(fromGoodsWeight);
      },
    },

    {
      title: '毛重（吨）',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      align: 'right',
      width: 100,
      render: Format.weight,
    },
    {
      title: '皮重（吨）',
      dataIndex: 'carWeight',
      key: 'carWeight',
      align: 'right',
      width: 100,
      render: Format.weight,
    },
    {
      title: '实收净重（吨）',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      align: 'right',
      width: 100,
      render: Format.weight,
    },
    {
      title: '路损（吨）',
      dataIndex: 'loss',
      key: 'loss',
      align: 'right',
      width: 100,
      render: Format.weight,
    },

    {
      title: '出场时间',
      dataIndex: 'outTime',
      key: 'outTime',
      width: 180,
      align: 'right',
      sorter: true,
      // sortOrder: sort,
      render: value => {
        return value || '-';
      },
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    dump: false,
    timeSort: undefined,
    plateSort: undefined,
  });

  // 设置数据列表
  const getDataList = async query => {
    console.log(query);
    setLoading(true);
    const res = await getList(query);
    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  };

  // 获取数据列表
  const getList = ({ page, timeSort, pageSize, dump, plateSort }) => {
    const { start, end, companyName, goodsType } = getQuery();
    const params = {
      receiveOrSend: true,
      limit: dump ? undefined : pageSize,
      page: dump ? undefined : page,
      dump,
      startTime: start,
      endTime: end,
      companyName,
      timeSort,
      goodsType,
      plateSort,
      bossId: !dump ? undefined : dataList.bossId ? dataList.bossId : undefined,
      childId: !dump ? undefined : dataList.childId ? dataList.childId : undefined,
    };
    return pound.getPoundBillDetailList({ params });
  };

  // 分页
  // const onChangePage = useCallback(
  //   page => {
  //     console.log(page);
  //     setQuery({ ...query, page });
  //   },
  //   [dataList]
  // );

  const onChangePage = page => {
    setQuery({ ...query, page });
    // getDataList({ ...query, page });
  };

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      // getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  useEffect(() => {
    getDataList(query);
  }, [query.page, query.timeSort, query.pageSize, query.plateSort]);

  const handleTableChange = (pagination, filters, sorter) => {
    let data;
    if (!sorter.length) {
      data = [sorter];
    } else {
      data = sorter;
    }

    data.map((val, key) => {
      if (val.columnKey === 'outTime') {
        let timeSort;
        sorter;
        if (val.order === 'ascend' || !val.order) {
          timeSort = false;
          sorter = 'ascend';
        } else if (val.order === 'descend') {
          timeSort = true;
          sorter = 'descend';
        }
        // setSort(sorter);
        setQuery({ ...query, timeSort, page: 1 });
        // getDataList({ ...query, timeSort });
      } else if (val.columnKey === 'trailerPlateNumber') {
        let trailerPlateNumberSort;
        let plateSort;
        if (val.order === 'ascend' || !val.order) {
          plateSort = false;
          trailerPlateNumberSort = 'ascend';
        } else if (val.order === 'descend') {
          plateSort = true;
          trailerPlateNumberSort = 'descend';
        }
        // setTrailerPlateNumberSort(trailerPlateNumberSort);
        setQuery({ ...query, plateSort, page: 1 });
      }
    });
    // getDataList({ ...query, timeSort });
  };

  // 导出
  const exportData = async () => {
    if (dataList.count === 0) {
      message.warning('数据导出失败，原因：没有数据可以导出');
      return;
    }
    setExportLoading(true);
    const res = await getList({ ...query, dump: true });

    if (res.status === 0) {
      downLoadFile(res.result, '收货汇总详情');
      message.success('数据导出成功');
    } else {
      message.error(`数据导出失败，原因：${res.detail || res.description}`);
      console.log(res);
    }
    setExportLoading(false);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <header>
          磅单列表
          <LoadingBtn style={{ float: 'right' }} loading={exportLoading} onClick={exportData}>
            导出
          </LoadingBtn>
        </header>
        <section style={{ minHeight: 620 }}>
          <Msg>
            合计：
            <span>
              运输车数<span className="total-num">{dataList.allCount}</span>辆
            </span>
            <span style={{ marginLeft: 32 }}>
              原发净重
              <span className="total-num">{Format.weight(dataList.allFromGoodsWeight)}</span>吨
            </span>
            <span style={{ marginLeft: 32 }}>
              实收净重
              <span className="total-num">{Format.weight(dataList.allGoodsWeight)}</span>吨
            </span>
          </Msg>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            sortDirections={['ascend', 'descend', 'ascend']}
            onChange={handleTableChange}
            scroll={{ x: 'auto' }}
            showSorterTooltip={false}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}></Table>
        </section>
      </Content>
    </Layout>
  );
};

export default TotalReportDetail;
