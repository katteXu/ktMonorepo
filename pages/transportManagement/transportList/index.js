import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@components';
import { LoadingOutlined } from '@ant-design/icons';
import { Input, Button, Table, message, Select, Tabs, Checkbox, Modal } from 'antd';
import moment from 'moment';
import { transportStatistics, getTimeStamp } from '@api';
import {
  Content,
  Search,
  Msg,
  Status,
  Ellipsis,
  TableHeaderConfig,
  DrawerInfo,
  LoadingBtn,
  DateRangePicker,
} from '@components';
import Detail from '@components/Transport/detail';
import { keepState, getState, clearState, Format, getQuery } from '@utils/common';
import { downLoadFile, getColumnsByTable, setColumnsByTable } from '@api';
import TopMsg from '@components/TransportManagement/routeList/topMsg';
import styles from './styles.less';
import BatchConfirm from '@components/Transport/flowPay/BatchConfirm';
import AllConfirm from '@components/Transport/flowPay/AllConfirm';

const { Option } = Select;
const { TabPane } = Tabs;

const TransportList = props => {
  const routeView = {
    title: '运单列表',
    pageKey: 'transportList',
    longKey: 'transportManagement.transportList',
    breadNav: '运单管理.运单列表',
    pageTitle: '运单列表',
  };

  const defaultColumns = [
    'trailerPlateNumber',
    'goodsWeight',
    'arrivalGoodsWeight',
    'price',
    'taxCharge',
    'fromCompany',
    'toCompany',
    'goodsType',
    'status',
    'createdAt',
    'ctrl',
  ];
  // 详情展示
  const [showDetail, setShowDetail] = useState();
  useEffect(() => {
    if (typeof showDetail === 'boolean') {
      keepState({
        drawInfo: {
          show: showDetail,
          transportId: transportId,
        },
      });
    }
  }, [showDetail]);

  const [transportId, setTransportId] = useState();

  const [showColumns, setShowColumns] = useState(defaultColumns);
  const showColumnsRef = useRef(showColumns);
  const [disShowType, setDisShowType] = useState(false);
  const [disShowPay, setDisShowPay] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (showColumns.length > 0) {
      showColumnsRef.current = showColumns;
    } else {
      showColumnsRef.current = defaultColumns;
    }
  }, [showColumns]);

  const columns = [
    {
      title: '专线类型',
      dataIndex: 'transportFleetId',
      key: 'transportFleetId',
      width: 120,
      render: value => <span>{value ? '车队单' : '个人单'}</span>,
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 150,
      render: value => value || '-',
    },
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: value => value || '-',
    },
    {
      title: '手机号',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: value => value || '-',
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 150,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      width: 150,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      align: 'right',
      width: 150,
      render: Format.weight,
    },
    {
      title: '结算单价(元/吨)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 150,
      render: (value, record, index) => {
        return <span>{Format.price((value + record.unitInfoFee).toFixed(0))}</span>;
      },
    },
    {
      title: '运费(元)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 150,
      render: (value, { realPrice, totalInfoFee }) => {
        return realPrice === 0
          ? Format.price((value + totalInfoFee).toFixed(0))
          : Format.price((realPrice + totalInfoFee).toFixed(0));
      },
    },
    {
      title: '补差运费(元)',
      dataIndex: 'taxCharge',
      key: 'taxCharge',
      align: 'right',
      width: 150,
      render: value => Format.price(value),
    },
    {
      title: '付款方式',
      dataIndex: 'payPath',
      key: 'payPath',
      width: 120,
      render: (value, record, index) => <span>{record.transportFleetId ? (value ? '延时付' : '即时付') : '-'}</span>,
    },
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 180,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 180,
      render: value => <Ellipsis value={value} width={150} />,
    },

    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 150,
      render: value => <Ellipsis value={value} width={120} />,
    },

    {
      title: '车队长',
      dataIndex: 'fleetCaptain',
      key: 'fleetCaptain',
      width: 100,
      render: value => value || '-',
    },
    {
      title: '运单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value, { applyCancelType }) => {
        return applyCancelType != 0 ? <Status.Order code="APPLY_CANCEL" /> : <Status.Order code={value} />;
      },
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '发货磅单上传时间',
      dataIndex: 'fromPoundTime',
      key: 'fromPoundTime',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '收货磅单上传时间',
      dataIndex: 'toPoundTime',
      key: 'toPoundTime',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '结算时间',
      dataIndex: 'payTime',
      key: 'payTime',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '运单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 200,
      render: value => <Ellipsis value={value} width={170} />,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      width: 80,
      render: (value, { id, status }) => {
        return (
          <Button type="link" size="small" onClick={() => handleShowDetail(id)}>
            详情
          </Button>
        );
      },
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    payBegin: undefined,
    payEnd: undefined,
    status: '',
    trailerPlateNumber: '',
    fromCompany: '',
    toCompany: '',
    goodsType: '',
    unitPrice: '',
    payPath: '',
    isFleet: '',
    dateStatus: '',
  });
  const [queryMemo, setQueryMemo] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    trailerPlateNumber: '',
    name: '',
    isFleet: '',
    payPath: '',
  });
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [total, setTotal] = useState({
    count: 0,
    realTotalPrice: 0,
    price: 0,
    goodsWeight: 0,
    arrivalGoodsWeight: 0,
  });

  const [transportStatus, setTransportStatus] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [seletedKeysIndex, setSeletedKeysIndex] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [isAllTransport, setIsAllTransport] = useState(false);
  const [checkTotal, setCheckTotal] = useState({
    waitPayNum: 0,
    goodsWeight: 0,
    arrivalGoodsWeight: 0,
  });
  const [stamp, setStamp] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const checkType = useRef({
    isAllTransport: false,
    selectedRowKeys: [],
    stamp: '',
  });
  const [confirmaPay, setConfirmaPay] = useState({});
  const [showAllModal, setShowAllModal] = useState(false);
  const [showModalOwner, setShowModalOwner] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      document.body.style.overflow = showAllModal ? 'hidden' : 'visible';
    }, 500);
  }, [showAllModal]);

  useEffect(() => {
    setTimeout(() => {
      document.body.style.overflow = showModalOwner ? 'hidden' : 'visible';
    }, 500);
  }, [showModalOwner]);

  useEffect(() => {
    checkType.current = {
      isAllTransport: isAllTransport,
      selectedRowKeys: selectedRowKeys,
      stamp: stamp,
    };
  }, [isAllTransport, selectedRowKeys, stamp]);
  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // // 获取持久化数据
    const state = getState().query;
    const { tab } = getQuery();
    setQuery({
      ...query,
      ...state,
      status: tab ? tab : state.status != '' ? state.status : '',
    });
    getRemoteData({
      ...query,
      ...state,
      status: tab ? tab : state.status != '' ? state.status : '',
    });
    setTransportStatus(tab ? tab : state.status != '' ? state.status : '');

    if (getState().drawInfo.show) {
      handleShowDetail(getState().drawInfo.transportId);
    }

    // 设置表头
    setColumns();
  }, []);

  useEffect(() => {
    setQueryMemo({
      ...query,
    });
  }, [dataList]);

  useEffect(() => {
    if (query.pageSize === undefined) {
      return;
    }
    setSeletedKeysIndex([...new Array(query.pageSize).keys()]);
  }, [query.pageSize]);

  // 日期输入
  const handleChangeDate = useCallback(({ begin, end }, dateStatus) => {
    const _begin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setQuery(() => ({ ...query, begin: _begin, end: _end, dateStatus }));
  });

  // 结算日期输入
  const handleChangePayDate = useCallback(({ begin, end }, string) => {
    const payBegin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const payEnd = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setQuery(() => ({ ...query, payBegin, payEnd }));
  });

  // 车牌号
  const handleChangeTrailerPlateNumber = useCallback(e => {
    const trailerPlateNumber = e.target.value;
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

  // 运费单价
  const handleChangeUnitPrice = useCallback(e => {
    const unitPrice = e.target.value;
    setQuery(() => ({ ...query, unitPrice }));
  });

  //运单类型
  const handleChangeRouteType = useCallback(e => {
    const isFleet = e;
    e === '0' ? setDisShowPay(true) : setDisShowPay(false);

    setQuery(() => ({ ...query, isFleet, payPath: '' }));
  });

  //付款方式
  const handleChangePayType = useCallback(e => {
    const payPath = e;
    console.log(e);
    e === '' ? setDisShowType(false) : setDisShowType(true);
    setQuery(() => ({ ...query, payPath, isFleet: '1' }));
  });

  // 刷新
  const handleReload = useCallback(() => {
    ref.current.start();
    getRemoteData({ ...query });
    setSelectedRowKeys([]);
  }, [query]);

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
      begin: undefined,
      end: undefined,
      payBegin: undefined,
      payEnd: undefined,
      trailerPlateNumber: '',
      fromCompany: '',
      toCompany: '',
      goodsType: '',
      unitPrice: '',
      payPath: '',
      isFleet: '',
      status: transportStatus,
      dateStatus: '',
    };
    setQuery(query);
    getRemoteData(query);
    setSelectedRowKeys([]);
    setCheckTotal({
      waitPayNum: 0,
      goodsWeight: 0,
      arrivalGoodsWeight: 0,
    });
    setIsAllTransport(false);
    setDisShowPay(false);
    setDisShowType(false);
  }, [transportStatus]);

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

      const params = {
        ...query,
        unitPrice: query.unitPrice * 100 || undefined,
        keyList: keyList.join(' '),
        titleList: titleList.join(' '),
        dump: true,
        payPath: query.payPath,
        isFleet: query.isFleet,
      };

      const res = await transportStatistics.getDataList({ params });
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
      type: 'orderDetailTable',
      titleList: columns.join(' '),
    };
    const res = await setColumnsByTable({ params });
  };

  // 设置表头
  const setColumns = async () => {
    const params = {
      type: 'orderDetailTable',
    };
    const res = await getColumnsByTable({ params });
    if (res.result !== '') {
      setShowColumns(res.result.split(' '));
    } else {
      setShowColumns([]);
    }
  };

  const onRestore = async () => {
    const params = {
      type: 'orderDetailTable',
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

  // 展示详情
  const handleShowDetail = id => {
    setShowDetail(true);
    setTransportId(id);
  };

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({
    page,
    pageSize,
    begin,
    end,
    payBegin,
    payEnd,
    status,
    trailerPlateNumber,
    fromCompany,
    toCompany,
    goodsType,
    unitPrice,
    payPath,
    isFleet,
    dateStatus,
  }) => {
    setLoading(true);

    const params = {
      page,
      limit: pageSize,
      begin,
      end,
      payBegin,
      payEnd,
      status,
      trailerPlateNumber,
      fromCompany,
      toCompany,
      goodsType,
      unitPrice: unitPrice * 100 || undefined,
      payPath,
      isFleet,
    };

    const res = await transportStatistics.getDataList({ params });

    if (res.status === 0) {
      const { arrivalGoodsWeight, count, goodsWeight, price, realTotalPrice } = res.result;
      setDataList(res.result);
      setTotal({
        arrivalGoodsWeight,
        count,
        goodsWeight,
        price,
        realTotalPrice,
      });
      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          begin,
          end,
          payBegin,
          payEnd,
          status,
          trailerPlateNumber,
          fromCompany,
          toCompany,
          goodsType,
          unitPrice,
          payPath,
          isFleet,
          dateStatus,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  const statusTabs = value => {
    const status = value;
    setTransportStatus(status);
    setQuery(() => ({ ...query, status, page: 1, pageSize: 10 }));
    getRemoteData({ ...query, status, page: 1, pageSize: 10 });
    setSelectedRowKeys([]);
    setCheckTotal({
      waitPayNum: 0,
      goodsWeight: 0,
      arrivalGoodsWeight: 0,
    });
    setIsAllTransport(false);
  };

  // 选中单一值
  const onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    const realPrice = record.realPrice;
    const arrivalGoodsWeight = record.arrivalGoodsWeight;
    const goodsWeight = record.goodsWeight;
    const key = record.id;
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      setSelectedRowKeys([...selectedRowKeys]);
    }

    // 计算总净重 & 运费总额
    let _realPrice = 0;
    let _arrivalGoodsWeight = 0;
    let _goodsWeight = 0;
    _realPrice += realPrice || 0;
    _arrivalGoodsWeight += arrivalGoodsWeight || 0;
    _goodsWeight += goodsWeight || 0;
    if (selected) {
      setCheckTotal(total => {
        return {
          waitPayNum: total.waitPayNum + _realPrice,
          goodsWeight: total.goodsWeight + _goodsWeight,
          arrivalGoodsWeight: total.arrivalGoodsWeight + _arrivalGoodsWeight,
        };
      });
    } else {
      setCheckTotal(total => {
        return {
          waitPayNum: total.waitPayNum - _realPrice,
          goodsWeight: total.goodsWeight - _goodsWeight,
          arrivalGoodsWeight: total.arrivalGoodsWeight - _arrivalGoodsWeight,
        };
      });
    }
  };

  const onChangeAllPay = async e => {
    setIsAllTransport(e);
    if (!e) {
      setSelectedRowKeys([]);
      setCheckTotal({
        waitPayNum: 0,
        goodsWeight: 0,
        arrivalGoodsWeight: 0,
      });
    } else {
      const time = await getStamp();
      setStamp(time);
    }
  };

  const getStamp = async () => {
    let params = {
      level: 'ms',
    };
    const res = await getTimeStamp({ params });
    if (res.status === 0) {
      let time = moment(Number(res.result)).format('YYYY-MM-DD HH:mm:ss');
      return time;
    } else {
      return false;
    }
  };

  // 选中所有
  const onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.forEach(record => {
      const realPrice = record.realPrice;
      const arrivalGoodsWeight = record.arrivalGoodsWeight;
      const goodsWeight = record.goodsWeight;
      const key = record.id;

      const i = selectedRowKeys.indexOf(key);
      if (selected) {
        if (i === -1) selectedRowKeys.push(key);
      } else {
        selectedRowKeys.splice(i, 1);
      }

      // 计算总净重 & 运费总额
      let _realPrice = 0;
      let _arrivalGoodsWeight = 0;
      let _goodsWeight = 0;
      _realPrice += realPrice || 0;
      _arrivalGoodsWeight += arrivalGoodsWeight || 0;
      _goodsWeight += goodsWeight || 0;
      if (selected) {
        if (i === -1) {
          setCheckTotal(total => {
            return {
              waitPayNum: total.waitPayNum + _realPrice,
              goodsWeight: total.goodsWeight + _goodsWeight,
              arrivalGoodsWeight: total.arrivalGoodsWeight + _arrivalGoodsWeight,
            };
          });
        }
      } else {
        setCheckTotal(total => {
          return {
            waitPayNum: total.waitPayNum - _realPrice,
            goodsWeight: total.goodsWeight - _goodsWeight,
            arrivalGoodsWeight: total.arrivalGoodsWeight - _arrivalGoodsWeight,
          };
        });
      }
    });

    setSelectedRowKeys([...selectedRowKeys]);
  };
  //支付
  const handleClickPayAll = useCallback(async () => {
    const { isAllTransport, selectedRowKeys, stamp } = checkType.current;
    console.log(isAllTransport);
    if (selectedRowKeys.length <= 0 && !isAllTransport) {
      message.warn('请选择要支付的运单');
      return;
    }
    if (dataList.data.length <= 0 && isAllTransport) {
      message.warn('没有要支付的运单');
      return;
    }
    setBtnLoading(true);
    let params;
    isAllTransport
      ? (params = {
          isAll: '1',
          ...query,
          payTime: stamp,
          begin: query.begin ? query.begin : undefined,
          end: query.end ? query.end : undefined,
        })
      : (params = {
          tides: (selectedRowKeys + '').replace(/,/g, ' '),
        });

    const res = await transportStatistics.calculateWaitPayInfo({ params });
    if (res.status === 0) {
      setBtnLoading(false);
      setConfirmaPay(res.result);
      isAllTransport ? setShowAllModal(true) : setShowModalOwner(true);
    } else {
      message.error(`${res.detail || res.description}`);
      setBtnLoading(false);
    }
  }, [dataList]);
  // 判断选中项是否为空
  const isEmpty = selectedRowKeys.length === 0 ? true : false;
  return (
    <Layout {...routeView}>
      <div
        style={{
          background: '#fff',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <TopMsg type="transport" ref={ref} />
        <div style={{ padding: '0 16px', paddingBottom: 12, background: '#fff' }}>
          <Search onSearch={handleSearch} onReset={handleReset} onExport={handleExport} exportLoading={exportLoading}>
            <Search.Item label="承运时间" br>
              <DateRangePicker
                quickBtn={true}
                onChange={handleChangeDate}
                value={{ begin: query.begin, end: query.end }}
                dateStatus={query.dateStatus}
              />
            </Search.Item>
            <Search.Item label="结算时间" br>
              <DateRangePicker onChange={handleChangePayDate} value={{ begin: query.payBegin, end: query.payEnd }} />
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
            <Search.Item label="运费单价">
              <Input value={query.unitPrice} placeholder="请输入运费单价" allowClear onChange={handleChangeUnitPrice} />
            </Search.Item>
            <Search.Item label="专线类型">
              <Select
                value={query.isFleet}
                placeholder="请选择专线类型"
                style={{ width: '100%' }}
                disabled={disShowType}
                onChange={handleChangeRouteType}>
                <Option value="">全部</Option>
                <Option value="1">车队单</Option>
                <Option value="0">个人单</Option>
              </Select>
            </Search.Item>
            <Search.Item label="付款方式">
              <Select
                value={query.payPath}
                placeholder="请选择付款方式"
                style={{ width: '100%' }}
                disabled={disShowPay}
                onChange={handleChangePayType}>
                <Option value="">全部</Option>
                <Option value="0">即时付</Option>
                <Option value="1">延时付</Option>
              </Select>
            </Search.Item>
          </Search>
          <Content>
            <Tabs onChange={statusTabs} type="card" style={{ marginTop: 16 }} activeKey={query.status}>
              <TabPane tab="全部" key=""></TabPane>
              <TabPane tab="待装货" key="WAIT_CONFIRMED"></TabPane>
              <TabPane tab="待卸货" key="PROCESS"></TabPane>
              <TabPane tab="待结算" key="CHECKING"></TabPane>
              <TabPane tab="待支付" key="WAIT_PAY"></TabPane>
              <TabPane tab="支付中" key="PAYING"></TabPane>
              <TabPane tab="已完成" key="DONE"></TabPane>
              <TabPane tab="待取消" key="APPLY_CANCEL"></TabPane>
              <TabPane tab="已驳回" key="REJECT"></TabPane>
            </Tabs>
            <div className={styles.headerColumns} style={{ marginRight: -14 }}>
              <TableHeaderConfig
                columns={columns}
                showColumns={showColumns.length > 0 ? showColumns : defaultColumns}
                onChange={onChangeColumns}
                onRestore={onRestore}
                type="transport"
              />
            </div>
            {transportStatus === 'WAIT_PAY' && (
              <div className={styles.payBtn}>
                <LoadingBtn type="primary" onClick={handleClickPayAll} loading={btnLoading}>
                  支付
                </LoadingBtn>
              </div>
            )}

            <section style={{ minHeight: 620, padding: 0 }}>
              <Msg style={{ borderRadius: 0 }}>
                {transportStatus === 'WAIT_PAY' && (
                  <Checkbox onChange={e => onChangeAllPay(e.target.checked)} checked={isAllTransport}>
                    全选(支持跨分页)
                  </Checkbox>
                )}
                {(!isEmpty || isAllTransport) && <span style={{ marginRight: 12 }}>已选</span>}
                运单数
                <span className="total-num">
                  {!loading ? (
                    isEmpty || isAllTransport ? (
                      dataList.count
                    ) : (
                      selectedRowKeys.length
                    )
                  ) : (
                    <LoadingOutlined style={{ fontSize: 20 }} />
                  )}
                </span>
                <span style={{ marginRight: 32 }}>单</span>
                发货净重
                <span className="total-num">
                  {!loading ? (
                    Format.weight(isEmpty || isAllTransport ? total.goodsWeight : checkTotal.goodsWeight)
                  ) : (
                    <LoadingOutlined style={{ fontSize: 20 }} />
                  )}
                </span>
                <span style={{ marginRight: 32 }}>吨</span>
                收货净重
                <span className="total-num">
                  {!loading ? (
                    Format.weight(isEmpty || isAllTransport ? total.arrivalGoodsWeight : checkTotal.arrivalGoodsWeight)
                  ) : (
                    <LoadingOutlined style={{ fontSize: 20 }} />
                  )}
                </span>
                <span style={{ marginRight: 32 }}>吨</span>
              </Msg>
              <Table
                loading={loading}
                rowKey={(record, i) => (isAllTransport ? i : record.id)}
                dataSource={dataList.data}
                columns={columns.filter(({ key }) => {
                  if (key === 'ctrl') {
                    return true;
                  }
                  return showColumns.length > 0 ? showColumns.includes(key) : defaultColumns.includes(key);
                })}
                pagination={{
                  onChange: onChangePage,
                  pageSize: query.pageSize,
                  current: query.page,
                  total: dataList.count,
                }}
                rowSelection={
                  transportStatus === 'WAIT_PAY'
                    ? {
                        selectedRowKeys: isAllTransport ? seletedKeysIndex : selectedRowKeys,
                        onSelect: onSelectRow,
                        onSelectAll: onSelectAll,
                        getCheckboxProps: record => ({
                          disabled: isAllTransport,
                        }),
                      }
                    : undefined
                }
                scroll={{ x: 'auto' }}
              />
            </section>
          </Content>
        </div>
      </div>

      {/* 结算全部 */}
      <Modal
        maskClosable={false}
        title="全部支付"
        visible={showAllModal}
        destroyOnClose
        onCancel={() => {
          setShowAllModal(false);
          setTimeout(() => {
            document.body.style.overflow = 'visible';
          });
        }}
        footer={null}>
        <AllConfirm
          payInfo={confirmaPay}
          payAllFilter={queryMemo}
          onFinish={() => {
            setIsAllTransport(false);
            setShowAllModal(false);
            getRemoteData({ ...query });
          }}
        />
      </Modal>

      {/* 批量支付  */}
      <Modal
        maskClosable={false}
        title="批量支付"
        visible={showModalOwner}
        destroyOnClose
        onCancel={() => {
          setShowModalOwner(false);
          setTimeout(() => {
            document.body.style.overflow = 'visible';
          });
        }}
        footer={null}>
        <BatchConfirm
          payInfo={confirmaPay}
          payId={selectedRowKeys + ''}
          onFinish={() => {
            setSelectedRowKeys([]);
            setCheckTotal({
              waitPayNum: 0,
              goodsWeight: 0,
              arrivalGoodsWeight: 0,
            });
            setShowModalOwner(false);
            getRemoteData({ ...query });
          }}
        />
      </Modal>
      <DrawerInfo
        title="运单详情"
        onClose={() => setShowDetail(false)}
        showDrawer={showDetail}
        width="664"
        afterClose={handleReload}>
        {showDetail && (
          <Detail
            id={transportId}
            close={() => {
              setShowDetail(false);
            }}
            userInfo={props.userInfo}
          />
        )}
      </DrawerInfo>
    </Layout>
  );
};

export default TransportList;
