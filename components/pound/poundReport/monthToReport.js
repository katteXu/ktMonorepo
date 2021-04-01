/** @format */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button, DatePicker, Table, message, Input, Select } from 'antd';
import { Format } from '@utils/common';
import { Content, Search, Msg, AutoInput, Ellipsis } from '@components';
import moment from 'moment';
import { pound, downLoadFile } from '@api';
import MonthPicker from '@components/pound/MonthPicker';
import LoadingBtn from '@components/LoadingBtn';

const { Option } = Select;
const Index = props => {
  const columns = [
    {
      title: '时间',
      dataIndex: 'outDate',
      key: 'outDate',
      width: '10%',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: '15%',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '运输车数(辆)',
      dataIndex: 'count',
      key: 'count',
      width: '10%',
      align: 'right',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货企业',
      dataIndex: 'customer',
      key: 'customer',
      width: '15%',
      render: value => <Ellipsis value={value} width={180} />,
    },
    {
      title: '原发净重(吨)',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: '10%',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '毛重(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: '10%',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '皮重(吨)',
      dataIndex: 'carWeight',
      key: 'carWeight',
      width: '10%',
      align: 'right',
      render: Format.weight,
    },

    {
      title: '实收净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: '10%',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      width: '10%',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '专线剩余(吨)',
      dataIndex: 'remainWeight',
      key: 'remainWeight',
      width: '10%',
      align: 'right',
      render: Format.weight,
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    time_filter: undefined,
    goodsType: '',
    companyName: '',
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const monthpickerRef = useRef(null);
  const [defaultCount, setDefaultCount] = useState(1);
  const [total, setTotal] = useState({
    allCount: 0,
    allFromGoodsWeight: 0,
    allGoodsWeight: 0,
    allLoss: 0,
  });
  const [changeGoodsType, setChangeGoodsType] = useState(false);
  // useEffect(() => {
  //   getRemoteData({ ...query });
  // }, []);
  useEffect(() => {
    if (query.time_filter && defaultCount <= 1) {
      setDefaultCount(defaultCount + 1);
      handleSearch();
    }
  }, [query.time_filter]);

  // 导出
  const handleExport = useCallback(async () => {
    if (dataList && dataList.data && dataList.data.length > 0) {
      setExportLoading(true);
      const { time_filter, goodsType, companyName } = query;
      const params = {
        dump: true,
        startDateTime: time_filter,
        goodsType,
        companyName,
        receiveOrSend: true,
        dump: true,
        bossId: dataList.bossId ? dataList.bossId : undefined,
        childId: dataList.childId ? dataList.childId : undefined,
      };

      const res = await pound.getPoundBillMonthList({ params });
      if (res.status === 0) {
        await downLoadFile(res.result, '收货磅单月报表');
      }

      setExportLoading(false);
    } else {
      message.warning('数据导出失败，原因：没有数据可以导出');
    }
  }, [dataList]);

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });

    getRemoteData({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(async () => {
    const [begin, end] = await monthpickerRef.current.reset();
    const query = {
      page: 1,
      pageSize: 10,
      time_filter: moment(begin).format('YYYY-MM-DD HH:mm:ss'),
      goodsType: '',
      company: '',
    };
    setTimeout(() => {
      setQuery(query);
      getRemoteData(query);
    }, 100);
    //重置搜索条件
    setChangeGoodsType(true);
    setTimeout(() => {
      setChangeGoodsType(false);
    }, 1000);
  }, []);

  // 时间输入
  const handleChangeDate = useCallback((value, string) => {
    const time_filter = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, time_filter }));
  });

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
  const getRemoteData = async ({ page, pageSize, time_filter, goodsType, companyName }) => {
    setLoading(true);

    const params = {
      page,
      limit: pageSize,
      startDateTime: time_filter,
      goodsType,
      companyName,
      receiveOrSend: true,
      dump: false,
    };

    const res = await pound.getPoundBillMonthList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        allCount: res.result.allCount,
        allFromGoodsWeight: res.result.allFromGoodsWeight,
        allGoodsWeight: res.result.allGoodsWeight,
        allLoss: res.result.allLoss,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 收货企业
  const handleChangeCompany = useCallback(e => {
    const companyName = e.target.value;
    setQuery(() => ({ ...query, companyName }));
  });

  // 货品名称
  const handleChangeGoodsType = useCallback(value => {
    const goodsType = value;
    setQuery(() => ({ ...query, goodsType }));
  });
  return (
    <>
      <Content>
        <section>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item br>
              <MonthPicker onChange={handleChangeDate} ref={monthpickerRef} />
            </Search.Item>
            <Search.Item label="货品名称">
              <AutoInput
                mode="goodsType"
                value={query.goodsType}
                allowClear
                placeholder="请输入货品名称"
                changeGoodsType={changeGoodsType}
                onChange={handleChangeGoodsType}
              />
            </Search.Item>
            <Search.Item label="发货企业">
              <Input value={query.companyName} allowClear placeholder="请输入发货企业" onChange={handleChangeCompany} />
            </Search.Item>
          </Search>
        </section>
        <header styel={{ border: 0 }}>
          磅单列表
          <Button onClick={handleExport} style={{ float: 'right' }} loading={exportLoading}>
            导出
          </Button>
        </header>
        <section style={{ paddingTop: 0 }}>
          <Msg>
            合计：
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              运输车数<span className="total-num">{total.allCount}</span>辆
            </span>
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              原发净重
              <span className="total-num">{Format.weight(total.allFromGoodsWeight)}</span>吨
            </span>
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              实收净重
              <span className="total-num">{Format.weight(total.allGoodsWeight)}</span>吨
            </span>
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              路损
              <span className="total-num">{Format.weight(total.allLoss)}</span>吨
            </span>
          </Msg>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey={(r, index) => index}
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
