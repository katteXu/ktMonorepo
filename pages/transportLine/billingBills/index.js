/** @format */

import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, DatePicker, Table, Popconfirm, message, Tooltip, Progress, Select } from 'antd';
import { Content, Search, Layout, Ellipsis, Msg } from '@components';
import { contract } from '@api';
import router from 'next/router';
import moment from 'moment';
import { Format, keepState } from '@utils/common';
import { truckQueryRecordList } from '@api';
const Index = () => {
  const routeView = {
    title: '计费账单',
    pageKey: 'billingBills',
    longKey: 'transportLine.billingBills',
    breadNav: '车辆轨迹.计费账单',
    pageTitle: '计费账单',
  };
  const columns = [
    {
      title: '业务类型',
      dataIndex: 'typeZn',
      key: 'typeZn',
      width: 100,
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 100,
      // render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '查询时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '消费金额(元)',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: Format.price,
    },
    {
      title: '余额(元)',
      dataIndex: 'walletAfter',
      key: 'walletAfter',
      width: 120,
      align: 'right',
      render: Format.price,
    },
    {
      title: '查询时间段',
      dataIndex: 'reqBegin',
      key: 'reqBegin',
      width: 150,
      render: (value, data) => {
        return <div>{value == '' ? '' : `${data.reqBegin} ~ ${data.reqEnd}`}</div>;
      },
    },
    {
      title: '计费方式',
      dataIndex: 'costType',
      key: 'costType',
      align: 'right',
      width: 100,
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [total, setTotal] = useState({
    countTrail: 0,
    countPosition: 0,
    costMoney: 0,
    userWallet: 0,
  });

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    trailerPlateNumber: '',
    begin: undefined,
    end: undefined,
    type: undefined,
  });
  useEffect(() => {
    getDataList(query);
  }, []);

  // 翻页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getDataList({ ...query, page, pageSize });
    },
    [dataList]
  );

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      trailerPlateNumber: '',
      begin: undefined,
      end: undefined,
      type: undefined,
    };
    setQuery(query);
    getDataList(query);
  }, []);

  const getDataList = async ({ page, pageSize, type, trailerPlateNumber, begin, end }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      begin: begin || undefined,
      end: end || undefined,
      type,
      trailerPlateNumber,
    };

    const res = await truckQueryRecordList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setLoading(false);
      setTotal({
        countTrail: res.result.countTrail,
        countPosition: res.result.countPosition,
        costMoney: res.result.costMoney,
        userWallet: res.result.userWallet,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 切换最大页数
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 业务类型
  const handleChangeStatus = useCallback(e => {
    const type = e;
    setQuery(() => ({ ...query, type }));
  });

  // 车牌号
  const handleChangehead = useCallback(e => {
    const trailerPlateNumber = e.target.value;
    setQuery(() => ({ ...query, trailerPlateNumber }));
  });

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  return (
    <Layout {...routeView}>
      <Search onSearch={handleSearch} onReset={resetFilter}>
        <Search.Item label="查询时间" br>
          <DatePicker.RangePicker
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: 376 }}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            placeholder={['开始时间', '结束时间']}
            onChange={handleChangeDate}></DatePicker.RangePicker>
        </Search.Item>

        <Search.Item label="业务类型">
          <Select
            value={query.type}
            allowClear
            style={{ width: '100%' }}
            placeholder="请选择业务类型"
            onChange={handleChangeStatus}>
            <Select.Option value="1">轨迹查询</Select.Option>
            <Select.Option value="0">实时位置查询</Select.Option>
          </Select>
        </Search.Item>
        <Search.Item label="车牌号">
          <Input value={query.trailerPlateNumber} placeholder="请输入车牌号" allowClear onChange={handleChangehead} />
        </Search.Item>
      </Search>
      <Content>
        <header>
          账单列表
          <span style={{ marginLeft: 16, fontSize: 16 }}>
            余额：<span style={{ color: '#3d86ef', fontSize: 20 }}>{Format.price(total.userWallet)}</span> 元
          </span>
        </header>
        <section>
          <Msg>
            合计：
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              轨迹查询车次<span className="total-num">{total.countTrail}</span>次
            </span>
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              实时位置查询次数<span className="total-num">{total.countPosition}</span>次
            </span>
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              总消费金额<span className="total-num">{Format.price(total.costMoney)}</span>元
            </span>
          </Msg>
          <Table
            loading={loading}
            size="middle"
            dataSource={dataList.data}
            columns={columns}
            rowKey="id"
            scroll={{ x: 'aotu' }}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}></Table>
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
