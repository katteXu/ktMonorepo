/** @format */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Table, message, Tooltip } from 'antd';
import { Content, Msg, Layout, LoadingBtn, TableHeaderConfig } from '@components';
import router from 'next/router';
import Link from 'next/link';
import { pound, downLoadFile, getColumnsByTable, setColumnsByTable } from '@api';
import { Format, getQuery } from '@utils/common';
const TotalReportDetail = props => {
  const [sort, setSort] = useState('descend');
  const [dataList, setDataList] = useState({});
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const defaultColumns = [
    'outTime',
    'customer',
    'goodsType',
    'trailerPlateNumber',
    'totalWeight',
    'carWeight',
    'fromGoodsWeight',
    'goodsWeight',
    'loss',
  ];

  const [showColumns, setShowColumns] = useState(defaultColumns);
  const showColumnsRef = useRef(showColumns);

  useEffect(() => {
    if (showColumns.length > 0) {
      showColumnsRef.current = showColumns;
    } else {
      showColumnsRef.current = defaultColumns;
    }
  }, [showColumns]);

  useEffect(() => {
    // 设置表头
    setColumns();
  }, []);
  const columns = [
    {
      title: '出站时间',
      dataIndex: 'outTime',
      key: 'outTime',
      width: 180,
      // align: 'right',
      sorter: true,
      // sortOrder: sort,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货企业',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 150,
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 120 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
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
      title: '路损（吨）',
      dataIndex: 'loss',
      key: 'loss',
      align: 'right',
      width: 100,
      render: Format.weight,
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
    const { customer, goodsType } = props.info;
    const { begin, end } = props.queryDetail;

    const params = {
      receiveOrSend: true,
      limit: dump ? undefined : pageSize,
      page: dump ? undefined : page,
      dump,
      startTime: begin,
      endTime: end,
      companyName: customer,
      timeSort,
      goodsType,
      plateSort,
      bossId: !dump ? undefined : dataList.bossId ? dataList.bossId : undefined,
      childId: !dump ? undefined : dataList.childId ? dataList.childId : undefined,
    };
    return pound.getPoundBillDetailList({ params });
  };

  const onChangePage = (page, pageSize) => {
    setQuery({ ...query, page, pageSize });
    // getDataList({ ...query, page });
  };

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
    // 导出表头key值
    const keyList = [];
    // 导出表头title值
    const titleList = [];
    columns.forEach(column => {
      if (showColumnsRef.current.includes(column.key)) {
        // if (column.key === 'ctrl') return;
        keyList.push(column.key);
        titleList.push(column.title);
      }
    });

    const { customer, goodsType } = props.info;
    const { begin, end } = props.queryDetail;
    const { page, timeSort, pageSize, plateSort } = query;
    const params = {
      receiveOrSend: true,
      dump: true,
      startTime: begin,
      endTime: end,
      companyName: customer,
      timeSort,
      goodsType,
      plateSort: plateSort,
      bossId: dataList.bossId ? dataList.bossId : undefined,
      childId: dataList.childId ? dataList.childId : undefined,
      keyList: keyList.join(' '),
      titleList: titleList.join(' '),
    };

    const res = await pound.getPoundBillDetailList({ params });

    if (res.status === 0) {
      downLoadFile(res.result, '收货汇总详情');
      message.success('数据导出成功');
    } else {
      message.error(`数据导出失败，原因：${res.detail || res.description}`);
      console.log(res);
    }
    setExportLoading(false);
  };

  // 改变表头
  const onChangeColumns = async columns => {
    // 设置展现表头
    setShowColumns([...columns]);
    const params = {
      type: 'toTotalReportDetailTable',
      titleList: columns.join(' '),
    };
    const res = await setColumnsByTable({ params });
  };

  // 设置表头
  const setColumns = async () => {
    const params = {
      type: 'toTotalReportDetailTable',
    };
    const res = await getColumnsByTable({ params });
    if (res.result !== '') {
      setShowColumns(res.result.split(' '));
    } else {
      setShowColumns([]);
    }
  };
  //恢复默认表头
  const onRestore = async () => {
    const params = {
      type: 'toTotalReportDetailTable',
      titleList: '',
    };
    const res = await setColumnsByTable({ params });
    if (!res.status) {
      message.success('恢复默认设置成功');
      setColumns();
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  return (
    <>
      <Content>
        <div style={{ marginBottom: 16 }}>
          <LoadingBtn loading={exportLoading} onClick={exportData}>
            导出
          </LoadingBtn>
          <span style={{ float: 'right' }}>
            <TableHeaderConfig
              columns={columns}
              showColumns={showColumns.length > 0 ? showColumns : defaultColumns}
              onChange={onChangeColumns}
              onRestore={onRestore}
              heightDefault={110}
            />
          </span>
        </div>

        <Msg>
          合计：
          <span>
            运输车数<span className="total-num">{dataList.allCount}</span>辆
          </span>
          <span style={{ marginLeft: 32 }}>
            原发净重<span className="total-num">{Format.weight(dataList.allFromGoodsWeight)}</span>吨
          </span>
          <span style={{ marginLeft: 32 }}>
            实收净重<span className="total-num">{Format.weight(dataList.allGoodsWeight)}</span>吨
          </span>
        </Msg>
        <Table
          loading={loading}
          dataSource={dataList.data}
          columns={columns.filter(({ key }) => {
            return showColumns.length > 0 ? showColumns.includes(key) : defaultColumns.includes(key);
          })}
          sortDirections={['ascend', 'descend', 'ascend']}
          onChange={handleTableChange}
          scroll={{ x: 'auto' }}
          showSorterTooltip={false}
          pagination={{
            onChange: onChangePage,
            pageSize: query.pageSize,
            current: query.page,
            total: dataList.count,
          }}
        />
      </Content>
    </>
  );
};

export default TotalReportDetail;
