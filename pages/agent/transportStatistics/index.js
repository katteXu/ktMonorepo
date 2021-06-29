import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Layout, Content, Search, TableHeaderConfig, Status, Msg } from '@components';
import { LoadingOutlined } from '@ant-design/icons';
import { Input, Button, Select, Table, DatePicker, message, Modal, Tag } from 'antd';
import moment from 'moment';
import { keepState, getState, clearState, Format } from '@utils/common';
import agent from '@api/agent';
import router from 'next/router';
import s from './styles.less';
import SelectCompany from '@components/Agent/selectCompany';
import { downLoadFile, getColumnsByTable, setColumnsByTable } from '@api';

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

const TransportStatistics = props => {
  const routeView = {
    title: '运费明细',
    pageKey: 'agent/transportStatistics',
    longKey: 'agent/transportStatistics',
    breadNav: '运费明细',
    pageTitle: '运费明细',
  };

  const defaultColumns = [
    'orderNo',
    'trailerPlateNumber',
    'name',
    'username',
    'createdAt',
    'companyName',
    'fromCompany',
    'toCompany',
    'goodsType',
    'unitPrice',
    'goodsWeight',
    'arrivalGoodsWeight',
    'loss',
    'status',
    'fleetCaptain',
    'price',
    'payStatus',
    'payTime',
    'ctrl',
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

  const columns = [
    {
      title: '运单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
    },
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '司机账号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'left',
    },
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
    },
    {
      title: '货物类型',
      dataIndex: 'goodsType',
      key: 'goodsType',
    },
    {
      title: '企业名称',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: '运费单价(元/吨)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: Format.price,
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运单状态',
      dataIndex: 'status',
      key: 'status',
      render: (value, { applyCancelType }) => {
        return applyCancelType != 0 ? <Status.Order code="APPLY_CANCEL" /> : <Status.Order code={value} />;
      },
    },
    {
      title: '车队长',
      dataIndex: 'fleetCaptain',
      key: 'fleetCaptain',
      render: value => value || '-',
    },
    {
      title: '运费金额(元)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (value, { realPrice }) => {
        return realPrice === 0 ? formatPrice(value) : formatPrice(realPrice);
      },
    },
    {
      title: '支付方式',
      dataIndex: 'payStatus',
      key: 'payStatus',
      render: value => {
        return value === 'ONLINE_PAY' ? '线上支付' : '线下支付';
      },
    },
    {
      title: '支付时间',
      dataIndex: 'payTime',
      key: 'payTime',
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      render: (value, { id }) => (
        <Button type="link" size="small" onClick={() => router.push(`/agent/transportStatistics/detail?id=${id}`)}>
          详情
        </Button>
      ),
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: moment().format('YYYY-MM-DD 00:00:00'),
    end: moment().format('YYYY-MM-DD 23:59:59'),
    trailerPlateNumber: '',
    fromCompany: '',
    toCompany: '',
    goodsType: '',
    status: undefined,
    unitPrice: '',
    companyList: [],
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [total, setTotal] = useState({
    count: 0,
    totalPayPrice: 0,
    totalWaitPayPrice: 0,
    totalGoodsWeight: 0,
    totalArrivalGoodsWeight: 0,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery({ ...query, ...state });
    getRemoteData({ ...query, ...state });

    // 设置表头
    setColumns();
  }, []);

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 车牌号
  const handleChangeTrailerPlateNumber = useCallback(e => {
    const plate = e.target.value;
    setQuery(() => ({ ...query, trailerPlateNumber }));
  });

  // 发货企业
  const handleChangeFromCompany = useCallback(e => {
    const fromCompany = e.target.value;
    setQuery(() => ({ ...query, fromCompany }));
  });

  // 收货企业
  const handleChangeToCompany = useCallback(e => {
    const toCompany = e.target.value;
    setQuery(() => ({ ...query, toCompany }));
  });

  // 货品名称
  const handleChangeGoodsType = useCallback(e => {
    const goodsType = e.target.value;
    setQuery(() => ({ ...query, goodsType }));
  });

  // 运单类型
  const handleChangeStatus = useCallback(value => {
    const status = value;
    setQuery(() => ({ ...query, status }));
  });

  // 运费单价
  const handleChangeUnitPrice = useCallback(e => {
    const unitPrice = e.target.value;
    setQuery(() => ({ ...query, unitPrice }));
  });

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });

    getRemoteData({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: moment().format('YYYY-MM-DD 00:00:00'),
      end: moment().format('YYYY-MM-DD 23:59:59'),
      trailerPlateNumber: '',
      fromCompany: '',
      toCompany: '',
      goodsType: '',
      status: undefined,
      unitPrice: '',
      companyList: [],
    };
    setQuery(query);
    getRemoteData(query);
  }, []);
  // 导出
  const handleExport = useCallback(async () => {
    if (dataList && dataList.data && dataList.data.length > 0) {
      setExportLoading(true);
      // 导出表头key值
      const keyList = [];
      // 导出表头title值
      const titleList = [];

      columns.forEach(column => {
        if (showColumnsRef.current.includes(column.key)) {
          if (column.key === 'ctrl') return;
          keyList.push(column.key);
          titleList.push(column.title);
        }
      });
      const userIds = query.companyList.length > 0 ? query.companyList.map(item => item.userId).join(' ') : undefined;
      const params = {
        ...query,
        unitPrice: query.unitPrice * 100 || undefined,
        keyList: keyList.join(' '),
        titleList: titleList.join(' '),
        userIds,
        dump: 1,
      };

      const res = await agent.getTransportList({ params });

      if (res.status === 0) {
        await downLoadFile(res.result, '运单明细表');
      }

      setExportLoading(false);
    } else {
      message.warning('数据导出失败，原因：没有数据可以导出');
    }
  }, [dataList]);

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

  // 改变表头
  const onChangeColumns = async columns => {
    // 设置展现表头
    setShowColumns([...columns]);

    const params = {
      type: 'agentTransportStatisticsTable',
      titleList: columns.join(' '),
    };
    const res = await setColumnsByTable({ params });
  };

  // 设置表头
  const setColumns = async () => {
    const params = {
      type: 'agentTransportStatisticsTable',
    };
    const res = await getColumnsByTable({ params });
    if (res.result !== '') {
      setShowColumns(res.result.split(' '));
    } else {
      setShowColumns([]);
    }
  };

  // 选择企业完成
  const handleSelectCompany = useCallback(companyList => {
    setQuery(() => ({ ...query, companyList }));
    setShowModal(false);
  });

  // 删除选中企业
  const removeTag = value => {
    const companyList = query.companyList.filter(item => item.id !== value);
    setQuery(() => ({ ...query, companyList }));
  };

  // 查询数据
  const getRemoteData = async ({
    page,
    pageSize,
    begin,
    end,
    trailerPlateNumber,
    fromCompany,
    toCompany,
    goodsType,
    status,
    unitPrice,
    companyList,
  }) => {
    setLoading(true);

    const params = {
      page,
      limit: pageSize,
      begin,
      end,
      trailerPlateNumber,
      fromCompany,
      toCompany,
      goodsType,
      status,
      unitPrice: unitPrice * 100 || undefined,
      userIds: companyList.length > 0 ? companyList.map(item => item.userId).join(' ') : undefined,
    };

    const res = await agent.getTransportList({ params });
    if (res.status === 0) {
      const { count, totalWaitPayPrice, totalPayPrice, totalGoodsWeight, totalArrivalGoodsWeight } = res.result;
      setDataList(res.result);
      setTotal({
        count,
        totalWaitPayPrice,
        totalPayPrice,
        totalGoodsWeight,
        totalArrivalGoodsWeight,
      });
      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          begin,
          end,
          status,
          trailerPlateNumber,
          fromCompany,
          toCompany,
          goodsType,
          unitPrice,
          companyList,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <Layout {...routeView}>
      <div style={{ background: '#fff', padding: 16 }}>
        <Button type="primary" onClick={() => setShowModal(true)} style={{ marginBottom: 16 }}>
          选择企业
        </Button>
        {query.companyList.length > 0 && (
          <div style={{ marginBottom: 16, background: '#f6f7f9ff', padding: '16px 12px' }} className={s.tagStyle}>
            {query.companyList.map(
              (item, index) =>
                index < 8 && (
                  <Tag
                    color="#108ee9"
                    closable
                    onClose={() => removeTag(item.id)}
                    style={{
                      fontSize: 14,
                      padding: '0 10px',
                      border: '1px solid #477AEF',
                      background: '#f5f9ff',
                      color: '#477AEF',
                      borderRadius: 2,
                    }}
                    key={item.id}>
                    {item.companyName}
                  </Tag>
                )
            )}
            <span>
              {query.companyList.length
                ? `${query.companyList.length > 8 ? '等,' : ''}共${query.companyList.length}家`
                : ''}
            </span>
          </div>
        )}

        <Search onSearch={handleSearch} onReset={handleReset} onExport={handleExport} exportLoading={exportLoading}>
          <Search.Item label="承运时间" br>
            <DatePicker.RangePicker
              style={{ width: 376 }}
              value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              onChange={handleChangeDate}
            />
          </Search.Item>
          <Search.Item label="车牌号">
            <Input
              value={query.trailerPlateNumber}
              placeholder="请输入车牌号"
              allowClear
              onChange={handleChangeTrailerPlateNumber}
            />
          </Search.Item>
          <Search.Item label="发货企业">
            <Input
              value={query.fromCompany}
              placeholder="请输入发货企业"
              allowClear
              onChange={handleChangeFromCompany}
            />
          </Search.Item>
          <Search.Item label="收货企业">
            <Input value={query.toCompany} placeholder="请输入收货企业" allowClear onChange={handleChangeToCompany} />
          </Search.Item>
          <Search.Item label="货品名称">
            <Input value={query.goodsType} placeholder="请输入货品名称" allowClear onChange={handleChangeGoodsType} />
          </Search.Item>
          <Search.Item label="运单状态">
            <Select
              style={{ width: '100%' }}
              value={query.status}
              placeholder="请选择状态"
              allowClear
              onChange={handleChangeStatus}>
              {Object.entries(Status.order).map(item => {
                return (
                  <Select.Option label={item[0]} key={item[0]}>
                    {item[1]}
                  </Select.Option>
                );
              })}
            </Select>
          </Search.Item>
          <Search.Item label="运费单价">
            <Input value={query.unitPrice} placeholder="请输入运费单价" allowClear onChange={handleChangeUnitPrice} />
          </Search.Item>
        </Search>

        <Content style={{ marginTop: 16 }}>
          <Msg>
            <span>已支付运费</span>
            <span className={'total-num'}>
              {!loading ? ((total.totalPayPrice || 0) / 100).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
            </span>
            元<span style={{ marginLeft: 32 }}>待支付运费</span>
            <span className={'total-num'}>
              {!loading ? (
                ((total.totalWaitPayPrice || 0) / 100).toFixed(2)
              ) : (
                <LoadingOutlined style={{ fontSize: 20 }} />
              )}
            </span>
            元<span style={{ marginLeft: 32 }}>发货净重</span>
            <span className={'total-num'}>
              {!loading ? (
                ((total.totalGoodsWeight || 0) / 1000).toFixed(2)
              ) : (
                <LoadingOutlined style={{ fontSize: 20 }} />
              )}
            </span>
            吨<span style={{ marginLeft: 32 }}>收货净重</span>
            <span className={'total-num'}>
              {!loading ? (
                ((total.totalArrivalGoodsWeight || 0) / 1000).toFixed(2)
              ) : (
                <LoadingOutlined style={{ fontSize: 20 }} />
              )}
            </span>
            吨<span style={{ marginLeft: 32 }}>运费车次</span>
            <span className={'total-num'}>
              {!loading ? total.count || 0 : <LoadingOutlined style={{ fontSize: 20 }} />}
            </span>
            单
            <div className={s.btnArea} style={{ float: 'right' }}>
              <TableHeaderConfig
                columns={columns}
                showColumns={showColumns.length > 0 ? showColumns : defaultColumns}
                onChange={onChangeColumns}
              />
            </div>
          </Msg>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns.filter(({ key }) => {
              if (key === 'ctrl') {
                return true;
              }
              return showColumns.length === 0 ? defaultColumns.includes(key) : showColumns.includes(key);
            })}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
        </Content>
      </div>

      {/* 选择企业弹窗 */}
      <Modal destroyOnClose visible={showModal} footer={null} onCancel={() => setShowModal(false)} title="选择企业">
        <SelectCompany
          selectValue={query.companyList}
          onChange={handleSelectCompany}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </Layout>
  );
};

export default TransportStatistics;
