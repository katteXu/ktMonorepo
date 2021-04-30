import { useState, useEffect, useCallback } from 'react';
import { Input, Table } from 'antd';
import { Layout, Content, Search, Msg, Ellipsis, DateRangePicker } from '@components';
import moment from 'moment';
import { Format, getDateRange } from '@utils/common';
import Link from 'next/link';
import { pound } from '@api';
const FromView = () => {
  const routeView = {
    title: '发货已审核',
    pageKey: 'settlment',
    longKey: 'poundManagement.settlment',
    breadNav: [
      '过磅管理',
      <Link href="/poundManagement/settlment">
        <a>人工结算</a>
      </Link>,
      '发货已审核',
    ],
    pageTitle: '发货已审核',
    useBack: true,
  };

  const columns = [
    {
      title: '出站时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '120px',
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: '120px',
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: '120px',
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: '120px',
    },
    {
      title: '毛重(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '皮重(吨)',
      dataIndex: 'carWeight',
      key: 'carWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'toGoodsWeight',
      key: 'toGoodsWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费单价(元/吨)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '结算运费(元)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
  ];

  const [total, setTotal] = useState({
    sum_count: 0,
    sum_fromGoodsWeight: 0,
  });

  const [query, setQuery] = useState(() => {
    const [begin, end] = getDateRange(-1, 'day');
    return {
      page: 1,
      pageSize: 10,
      begin,
      end,
      toCompany: '',
      goodsType: '',
      plate: '',
      dateStatus: 'toYesterday',
    };
  });

  useEffect(() => {
    getRemoteData(query);
  }, []);

  const [dataList, setDataList] = useState({});

  // 查询
  const handleSearch = () => {
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
  };
  const handleReset = () => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      toCompany: '',
      goodsType: '',
      plate: '',
    };
    setQuery(query);
    getRemoteData(query);
  };

  // 时间输入
  const handleChangeDate = useCallback(({ begin, end }, dateStatus) => {
    const _begin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;
    setQuery(() => ({ ...query, begin: _begin, end: _end, dateStatus }));
  });

  // 收货企业
  const handleChangeCompany = e => {
    const toCompany = e.target.value;
    setQuery(() => ({ ...query, toCompany }));
  };

  // 货品名称
  const handleChangeGoodsName = e => {
    const goodsType = e.target.value;
    setQuery(() => ({ ...query, goodsType }));
  };

  // 车牌号
  const handleChangePlate = e => {
    const plate = e.target.value;
    setQuery(() => ({ ...query, plate }));
  };

  const [loading, setLoading] = useState(false);

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

  // 查询
  const getRemoteData = async ({ toCompany, goodsType, plate, page, pageSize, begin, end }) => {
    setLoading(true);
    const hasDate = begin && end;
    const params = {
      type: 0,
      manPayStatus: 1,
      toCompany,
      goodsType,
      plate,
      page,
      limit: pageSize,
      begin: hasDate ? begin : undefined,
      end: hasDate ? end : undefined,
    };

    const res = await pound.getPoundBillList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({ ...res.result });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ position: 'relative' }}>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="出站时间" br>
              <DateRangePicker
                quickBtn={true}
                onChange={handleChangeDate}
                value={{ begin: query.begin, end: query.end }}
                dateStatus={query.dateStatus}
              />
            </Search.Item>
            <Search.Item label="收货企业">
              <Input value={query.toCompany} placeholder="请输入收货企业" onChange={handleChangeCompany} allowClear />
            </Search.Item>
            <Search.Item label="货品名称">
              <Input value={query.goodsType} placeholder="请输入货品名称" onChange={handleChangeGoodsName} allowClear />
            </Search.Item>
            <Search.Item label="车牌号">
              <Input value={query.plate} placeholder="请输入车牌号" onChange={handleChangePlate} allowClear />
            </Search.Item>
          </Search>

          <Msg style={{ marginTop: 16 }}>
            <span style={{ marginRight: 32 }}>
              运输车数
              <span className="total-num">{total.sum_count}</span>辆
            </span>
            <span style={{ marginRight: 32 }}>
              发货净重
              <span className="total-num">{Format.weight(total.sum_fromGoodsWeight)}</span>吨
            </span>
          </Msg>

          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
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
    </Layout>
  );
};

export default FromView;
