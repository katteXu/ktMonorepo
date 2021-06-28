import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Table, message, Input } from 'antd';
import { Format } from '@utils/common';
import { Content, Search, Msg, AutoInput, Ellipsis } from '@components';
import moment from 'moment';
import { pound, downLoadFile } from '@api';
import MonthPicker from '@components/pound/MonthPicker';

const Index = props => {
  const columns = [
    {
      title: '出站时间',
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
      title: '收货企业',
      dataIndex: 'customer',
      key: 'customer',
      width: '15%',
      render: value => <Ellipsis value={value} width={180} />,
    },

    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
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
  const [total, setTotal] = useState({
    allCount: 0,
    allGoodsWeight: 0,
  });
  const monthpickerRef = useRef(null);
  const [defaultCount, setDefaultCount] = useState(1);
  const [changeGoodsType, setChangeGoodsType] = useState(false);

  // useEffect(() => {
  //   getRemoteData({ ...query });
  // }, []);

  useEffect(() => {
    console.log(query.time_filter);
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
        receiveOrSend: false,
        dump: true,
        bossId: dataList.bossId ? dataList.bossId : undefined,
        childId: dataList.childId ? dataList.childId : undefined,
      };

      const res = await pound.getPoundBillMonthList({ params });
      if (res.status === 0) {
        await downLoadFile(res.result, '发货磅单月报表');
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
      companyName: '',
    };
    setTimeout(() => {
      setQuery(query);
      getRemoteData(query);
    }, 100);
    console.log('ddddd');
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
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
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
      receiveOrSend: false,
      dump: false,
    };

    const res = await pound.getPoundBillMonthList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        allCount: res.result.allCount,
        allGoodsWeight: res.result.allGoodsWeight,
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
        <section style={{ padding: 0 }}>
          <Search onSearch={handleSearch} onReset={handleReset} onExport={handleExport} exportLoading={exportLoading}>
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
            <Search.Item label="收货企业">
              <Input value={query.companyName} allowClear placeholder="请输入收货企业" onChange={handleChangeCompany} />
            </Search.Item>
          </Search>

          <Msg style={{ marginTop: 16 }}>
            合计：
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              运输车数<span className="total-num">{total.allCount}</span>辆
            </span>
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              发货净重<span className="total-num">{Format.weight(total.allGoodsWeight)}</span>吨
            </span>
          </Msg>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey={(r, index) => index}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
          />
        </section>
      </Content>
    </>
  );
};

export default Index;
