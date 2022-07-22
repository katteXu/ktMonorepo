/** @format */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Table, message, Tooltip } from 'antd';
import { Content, Msg, TableHeaderConfig, LoadingBtn } from '@components';
import Link from 'next/link';
import { pound, downLoadFile, getColumnsByTable, setColumnsByTable } from '@api';
import { Format, getQuery } from '@utils/common';
const TotalReportDetail = props => {
  const [sort, setSort] = useState('descend');
  const [trailerPlateNumberSort, setTrailerPlateNumberSort] = useState('descend');
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
    'goodsWeight',
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
      sorter: {
        multiple: 2,
      },
      // sortOrder: sort,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '收货企业',
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
      sorter: {
        multiple: 1,
      },
      // sortOrder: trailerPlateNumberSort,
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
      title: '发货净重（吨）',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      align: 'right',
      width: 100,
      render: (value, record) => {
        const { fromGoodsWeight, goodsWeight } = record;
        const weight = fromGoodsWeight || goodsWeight;
        return (weight / 1000).toFixed(2);
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
      // ownerId: userId,
      receiveOrSend: false,
      limit: dump ? undefined : pageSize,
      page: dump ? undefined : page,
      dump,
      startTime: begin,
      endTime: end,
      companyName: customer,
      timeSort,
      goodsType,
      plateSort: plateSort,
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
    console.log(sorter);
    let data;
    if (!sorter.length) {
      data = [sorter];
    } else {
      data = sorter;
    }

    data.map((val, key) => {
      console.log(val.columnKey);
      if (val.columnKey === 'outTime') {
        let timeSort;
        sorter;
        if (val.order === 'ascend') {
          timeSort = false;
          sorter = 'ascend';
        } else if (val.order === 'descend') {
          timeSort = true;
          sorter = 'descend';
        } else if (!val.order) {
          timeSort = undefined;
        }
        setSort(sorter);
        setQuery({ ...query, timeSort, page: 1 });
        // getDataList({ ...query, timeSort });
      } else if (val.columnKey === 'trailerPlateNumber') {
        let trailerPlateNumberSort;
        let plateSort;
        if (val.order === 'ascend') {
          plateSort = false;
          trailerPlateNumberSort = 'ascend';
        } else if (val.order === 'descend') {
          plateSort = true;
          trailerPlateNumberSort = 'descend';
        } else if (!val.order) {
          plateSort = undefined;
        }
        // setTrailerPlateNumberSort(trailerPlateNumberSort);
        setQuery({ ...query, plateSort, page: 1 });
      }
    });
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
      receiveOrSend: false,

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
      downLoadFile(res.result, '汇总发货详情');
      message.success('数据导出成功');
    } else {
      message.error(`数据导出失败，原因：${res.detail || res.description}`);
    }
    setExportLoading(false);
  };

  // 改变表头
  const onChangeColumns = async columns => {
    // 设置展现表头
    setShowColumns([...columns]);
    const params = {
      type: 'fromTotalReportDetailTable',
      titleList: columns.join(' '),
    };
    const res = await setColumnsByTable({ params });
  };

  // 设置表头
  const setColumns = async () => {
    const params = {
      type: 'fromTotalReportDetailTable',
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
      type: 'fromTotalReportDetailTable',
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
              heightDefault={80}
            />
          </span>
        </div>

        <Msg>
          合计：
          <span>
            运输车数<span className="total-num">{dataList.allCount}</span>辆
          </span>
          <span style={{ marginLeft: 32 }}>
            发货净重<span className="total-num">{Format.weight(dataList.allGoodsWeight)}</span>吨
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
            // onShowSizeChange: onChangePageSize,
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
