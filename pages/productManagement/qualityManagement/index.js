import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Search, Ellipsis } from '@components';
import moment from 'moment';
import { Input, Button, Table, message, DatePicker, Select } from 'antd';
import { keepState, getState, clearState, Format } from '@utils/common';
import router from 'next/router';
import { quality } from '@api';

const routeView = {
  title: '质检管理',
  pageKey: 'qualityManagement',
  longKey: 'productManagement.qualityManagement',
  breadNav: '智慧工厂.质检管理',
  pageTitle: '质检管理',
};

const QualityManagement = props => {
  // 列数据
  const columns = [
    {
      title: '采样编号',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 120,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 150,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '水分(% Mad)',
      dataIndex: 'waterContent',
      key: 'waterContent',
      align: 'right',
      width: 150,
      render: Format.percent,
    },
    {
      title: '灰分(% Ad)',
      dataIndex: 'ashContent',
      key: 'ashContent',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '挥发(% Vdaf)',
      dataIndex: 'volatilization',
      key: 'volatilization',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '焦渣特征(1-8 CRC)',
      dataIndex: 'cinder',
      key: 'cinder',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '全硫(% Std)',
      dataIndex: 'sulfur',
      key: 'sulfur',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '回收(% r)',
      dataIndex: 'recovery',
      key: 'recovery',
      align: 'right',
      width: 150,
      render: Format.percent,
    },
    {
      title: '粘结指数(GRI)',
      dataIndex: 'bond',
      key: 'bond',
      align: 'right',
      width: 140,
      render: Format.percent,
    },
    {
      title: '胶质层(Y)',
      dataIndex: 'colloid',
      key: 'colloid',
      align: 'right',
      width: 140,
      render: Format.percent,
    },

    {
      title: '质检类型',
      dataIndex: 'purchaseOrSale',
      key: 'purchaseOrSale',
      align: 'right',
      width: 150,
      render: value => {
        return value === 1 ? '采购质检' : '销售质检';
      },
    },
    {
      title: '车牌',
      dataIndex: 'plateNum',
      key: 'plateNum',
      width: 150,
    },
    {
      title: '合作方',
      dataIndex: 'cooperation',
      key: 'cooperation',
      align: 'right',
      width: 150,
    },
    {
      title: '质检时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
    },
    {
      title: '质检员',
      dataIndex: 'operator',
      key: 'operator',
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record, index) => (
        <Button
          size="small"
          type="link"
          key="detail"
          onClick={() => router.push(`/productManagement/qualityManagement/detail?id=${record.id}`)}>
          详情
        </Button>
      ),
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    reportId: '',
    goodsName: '',
    purchaseOrSale: undefined,
    plateNum: '',
    operator: '',
    cooperation: '',
    begin: null,
    end: null,
  });

  const [loading, setLoading] = useState(false);

  const [dataList, setDataList] = useState({});

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

  // 日期输入
  const handleChangeDate = useCallback(
    (value, string) => {
      const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
      const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
      setQuery(() => ({ ...query, begin, end }));
    },
    [query]
  );

  // 采样编号
  const handleChangeReportId = useCallback(e => {
    const reportId = e.target.value;
    setQuery({ ...query, reportId });
  });

  // 货品名称
  const handleChangeGoodsName = useCallback(e => {
    const goodsName = e.target.value;
    setQuery({ ...query, goodsName });
  });

  // 质检类型
  const handleChangePurchaseOrSale = useCallback(value => {
    const purchaseOrSale = value;
    setQuery({ ...query, purchaseOrSale });
  });

  // 质检类型
  const handleChangePlateNum = useCallback(e => {
    const plateNum = e.target.value;
    setQuery({ ...query, plateNum });
  });

  // 质检员
  const handleChangeOperator = useCallback(e => {
    const operator = e.target.value;
    setQuery({ ...query, operator });
  });

  // 合作方
  const handleChangeCooperation = useCallback(e => {
    const cooperation = e.target.value;
    setQuery({ ...query, cooperation });
  });

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

  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
  }, [query]);

  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      reportId: '',
      goodsName: '',
      purchaseOrSale: undefined,
      plateNum: '',
      operator: '',
      cooperation: '',
      begin: null,
      end: null,
    };
    setQuery(query);
    getRemoteData(query);
  });

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({
    reportId,
    goodsName,
    plateNum,
    purchaseOrSale,
    operator,
    cooperation,
    begin,
    end,
    page,
    pageSize = 10,
  }) => {
    setLoading(true);

    const params = {
      reportId,
      goodsName,
      plateNum,
      operator,
      purchaseOrSale,
      cooperation,
      beginTime: begin || undefined,
      endTime: end || undefined,
      limit: pageSize,
      page,
    };

    const res = await quality.getDataList({ params });

    if (res.status === 0) {
      setDataList(res.result);

      // 持久化状态
      keepState({
        query: {
          reportId,
          goodsName,
          plateNum,
          purchaseOrSale,
          operator,
          cooperation,
          page,
          pageSize,
          begin,
          end,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setLoading(false);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="质检时间" br>
              <DatePicker.RangePicker
                style={{ width: 376 }}
                value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={handleChangeDate}
              />
            </Search.Item>

            <Search.Item label="采样编号">
              <Input allowClear value={query.reportId} placeholder="请输入采样编号" onChange={handleChangeReportId} />
            </Search.Item>

            <Search.Item label="货品名称">
              <Input allowClear value={query.goodsName} placeholder="请输入货品名称" onChange={handleChangeGoodsName} />
            </Search.Item>

            <Search.Item label="质检类型">
              <Select
                value={query.purchaseOrSale || undefined}
                allowClear
                placeholder="请选择质检类型"
                style={{ width: '100%' }}
                onChange={handleChangePurchaseOrSale}>
                <Select.Option value="1">采购质检</Select.Option>
                <Select.Option value="0">销售质检</Select.Option>
              </Select>
            </Search.Item>

            <Search.Item label="车牌号">
              <Input allowClear value={query.plateNum} placeholder="请输入车牌号" onChange={handleChangePlateNum} />
            </Search.Item>

            <Search.Item label="质检员">
              <Input allowClear value={query.operator} placeholder="请输入质检员姓名" onChange={handleChangeOperator} />
            </Search.Item>

            <Search.Item label="合作方">
              <Input
                allowClear
                value={query.cooperation}
                placeholder="请输入买方企业名称"
                onChange={handleChangeCooperation}
              />
            </Search.Item>
          </Search>
        </section>
        <header className="tab-header">化验单列表</header>
        <section>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              showSizeChanger: true,
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

QualityManagement.getInitialProps = async props => {
  const { isServer } = props;
  return { isServer };
};

export default QualityManagement;
