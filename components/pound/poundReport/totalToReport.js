/** @format */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Input, Select, Button, Table, message, Dropdown, Menu } from 'antd';
import { Content, Search, Layout, Msg, Ellipsis } from '@components';
import moment from 'moment';
import { pound, downLoadFile } from '@api';
import { keepState, getState, clearState, Format } from '@utils/common';
import router from 'next/router';
import DatePicker from '@components/pound/DatePicker/static';
import LoadingBtn from '@components/LoadingBtn';

const Index = props => {
  const columns = [
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: '120px',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '运输车辆',
      dataIndex: 'count',
      key: 'count',
      width: '160px',
      align: 'right',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货企业',
      dataIndex: 'customer',
      key: 'customer',
      width: '180px',
      render: value => <Ellipsis value={value} width={150} />,
    },

    {
      title: '原发净重（吨）',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: '160px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '毛重（吨）',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: '160px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '皮重（吨）',
      dataIndex: 'carWeight',
      key: 'carWeight',
      width: '160px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '实收净重（吨）',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: '160px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损（吨）',
      dataIndex: 'loss',
      key: 'loss',
      width: '100px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '操作',
      key: 'detail',
      width: '140px',
      align: 'right',
      fixed: 'right',
      render: (value, record) => {
        const { customer, goodsType } = record;
        return (
          <Button type="link" size="small" onClick={() => handleToDetail(customer, goodsType)}>
            详情
          </Button>
        );
      },
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: props.dateTime.begin,
    end: props.dateTime.end,
    goodsType: undefined,
    dateStatus: props.dateTime.dateStatus,
    company: '',
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [total, setTotal] = useState({
    allCount: 0,
    allFromGoodsWeight: 0,
    allGoodsWeight: 0,
    allLoss: 0,
  });

  const [goodsTypes, setGoodsTypes] = useState([]);
  const [companys, setCompanys] = useState([]);

  const [remoteDate, setRemoteDate] = useState({
    begin: undefined,
    end: undefined,
  });
  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery({ ...query, ...state });
    getRemoteData({ ...query, ...state });
  }, []);

  // 跳转详情
  const handleToDetail = useCallback(
    (customer, goodsType) => {
      const { begin, end } = query;
      let queryString = '';
      if (begin) queryString += `&start=${begin}`;
      if (end) queryString += `&end=${end}`;
      router.push(
        `/poundManagement/poundReport/totalToDetail?companyName=${customer}&goodsType=${goodsType}${queryString}`
      );
    },
    [dataList]
  );

  // 同步外层日期
  const syncDateTime = query => {
    props.setDateTime &&
      props.setDateTime({ begin: query.begin, end: query.end, dateStatus: query.dateStatus, ...query });
  };

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });

    getRemoteData({ ...query, page: 1 });
    setSelectedRowKeys([]);
    setGoodsTypes([]);
    setCompanys([]);

    syncDateTime(query);
  }, [query]);

  // 重置
  const handleReset = useCallback(async () => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      goodsType: undefined,
      company: '',
    };
    setTimeout(() => {
      setQuery(query);
      getRemoteData(query);
    }, 100);

    setSelectedRowKeys([]);

    syncDateTime(query);
  }, []);

  // 日期输入
  const handleChangeDate = useCallback(({ begin, end }, dateStatus) => {
    const _begin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setQuery(() => ({ ...query, begin: _begin, end: _end, dateStatus }));
  });

  // 货品名称
  const handleChangeType = useCallback(e => {
    const goodsType = e.target.value;
    setQuery(() => ({ ...query, goodsType }));
  });

  // 收货企业
  const handleChangeCompany = useCallback(e => {
    const companyName = e.target.value;
    setQuery(() => ({ ...query, companyName }));
  });

  // 导出菜单点击
  const handleMenuClick = useCallback(
    e => {
      if (e.key === '1') {
        //导出汇总表
        exportExcelAll();
      } else {
        //导出明细
        exportExcel();
      }
    },
    [goodsTypes]
  );

  // 导出详细
  const exportExcel = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要导出的数据');
      return;
    }

    setExportLoading(true);

    const res = await exportList('detail');

    if (res.status === 0) {
      await downLoadFile(res.result, '收货明细表');
      message.success('数据导出成功');
    } else {
      message.error(`数据导出失败，原因：${res.detail || res.description}`);
    }

    setExportLoading(false);
  };

  const exportExcelAll = async () => {
    if (goodsTypes.length === 0) {
      message.warning('请选择要导出的数据');
      return;
    }
    setExportLoading(true);

    const res = await exportList();

    if (res.status === 0) {
      await downLoadFile(res.result, '收货汇总表');
      message.success('数据导出成功');
    } else {
      message.error(`数据导出失败，原因：${res.detail || res.description}`);
    }

    setExportLoading(false);
  };

  // 导出列表
  const exportList = type => {
    const { page, begin, end } = query;

    const params = {
      receiveOrSend: true,
      startTime: begin || undefined,
      endTime: end || undefined,
      companyName: companys.join(','),
      goodsType: goodsTypes.join(','),
      dump: true,
      bossId: dataList.bossId ? dataList.bossId : undefined,
      childId: dataList.childId ? dataList.childId : undefined,
    };
    if (type === 'detail') {
      return pound.getPoundBillDetailList({ params });
    } else {
      return pound.getPoundBillSummaryList({ params });
    }
  };

  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page, pageSize, begin, end, goodsType, companyName, dateStatus }) => {
    setLoading(true);
    const params = {
      receiveOrSend: true,
      page,
      limit: pageSize,
      startTime: begin,
      endTime: end,
      goodsType,
      companyName,
      dump: false,
    };
    const res = await pound.getPoundBillSummaryList({ params });
    if (res.status === 0) {
      const { allCount, allFromGoodsWeight, allGoodsWeight, allLoss } = res.result;
      setDataList(res.result);
      setTotal({
        allCount,
        allFromGoodsWeight,
        allGoodsWeight,
        allLoss,
      });

      setRemoteDate({
        begin: res.result.begin,
        end: res.result.end,
      });

      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          begin,
          end,
          dateStatus,
          goodsType,
          companyName,
        },
      });

      syncDateTime({
        begin,
        end,
        dateStatus,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">导出汇总表</Menu.Item>
      <Menu.Item key="2">导出明细</Menu.Item>
    </Menu>
  );
  return (
    <>
      <Content>
        <section>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item br>
              <DatePicker
                onChange={handleChangeDate}
                value={{ begin: query.begin, end: query.end }}
                dateStatus={query.dateStatus}
                remoteBegin={remoteDate.begin}
                remoteEnd={remoteDate.end}
              />
            </Search.Item>
            <Search.Item label="货品名称">
              <Input value={query.goodsType} allowClear placeholder="请输入货品名称" onChange={handleChangeType} />
            </Search.Item>
            <Search.Item label="发货企业">
              <Input value={query.companyName} allowClear placeholder="请输入发货企业" onChange={handleChangeCompany} />
            </Search.Item>
          </Search>
        </section>
        <header style={{ border: 0 }}>
          磅单列表
          <Dropdown overlay={menu}>
            <Button style={{ float: 'right' }} loading={exportLoading}>
              导出
              <DownOutlined />
            </Button>
          </Dropdown>
        </header>
        <section style={{ minHeight: 620, paddingTop: 0 }}>
          <Msg>
            合计：
            <span>
              运输车数
              <span className="total-num">{total.allCount}</span>辆
            </span>
            <span style={{ marginLeft: 32 }}>
              原发净重
              <span className="total-num">{Format.weight(total.allFromGoodsWeight)}</span>吨
            </span>
            <span style={{ marginLeft: 32 }}>
              实收净重
              <span className="total-num">{Format.weight(total.allGoodsWeight)}</span>吨
            </span>
            <span style={{ marginLeft: 32 }}>
              路损
              <span className="total-num">{Format.weight(total.allLoss)}</span>吨
            </span>
          </Msg>
          <Table
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              onChange: (_selectedRowKeys, selectedRows) => {
                const _goodsTypes = [];
                const _companys = [];
                selectedRows.forEach(item => {
                  _goodsTypes.push(item.goodsType);
                  _companys.push(item.customer);
                });

                setGoodsTypes(_goodsTypes);
                setCompanys(_companys);
                setSelectedRowKeys(_selectedRowKeys);
              },
            }}
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey={(record, index) => `${record.customer}${record.goodsType}`}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </>
  );
};

export default Index;
