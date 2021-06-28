/** 按运单结算列表 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DatePicker, Input, Button, Table, message, Select, Dropdown, Menu, Checkbox, Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Search, Msg, Ellipsis, DrawerInfo } from '@components';
import { keepState, getState, clearState, Format } from '@utils/common';
import { transportStatistics, getTimeStamp } from '@api';
import Detail from '@components/TransportManagement/routeList/detail';
import router from 'next/router';
import BatchConfirm from '@components/TransportManagement/routeList/flowPay/BatchConfirm';
import AllConfirm from '@components/TransportManagement/routeList/flowPay/AllConfirm';

const { Option } = Select;
const OrderList = props => {
  const columns = [
    {
      title: '专线类型',
      dataIndex: 'isFleet',
      key: 'isFleet',
      width: 120,
      render: value => {
        return value === 1 ? '车队单' : '个人单';
      },
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 100,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      align: 'right',
      width: 120,
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      width: 120,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      width: 120,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: Format.price,
    },
    {
      //运费总额
      title: '结算运费(元)',
      dataIndex: 'realPrice',
      key: 'realPrice',
      width: 120,
      align: 'right',
      render: Format.price,
    },
    {
      title: '付款方式',
      dataIndex: 'payPath',
      key: 'payPath',
      width: 120,
      render: (value, record, index) => <span>{record.isFleet ? (value ? '延时付' : '即时付') : '-'}</span>,
    },
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 200,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 200,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 120,
      render: value => <Ellipsis value={value} width={100} />,
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'right',
      align: 'right',
      render: value => {
        return (
          <Button type="link" size="small" onClick={() => handleShowDetail(value)}>
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
    trailerPlateNumber: '',
    name: '',
    isFleet: undefined,
    payPath: undefined,
  });

  const [queryMemo, setQueryMemo] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    trailerPlateNumber: '',
    name: '',
    isFleet: undefined,
    payPath: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [total, setTotal] = useState({
    orderCount: 0,
    waitPayNum: 0,
    goodsWeight: 0,
    arrivalGoodsWeight: 0,
  });
  const [isAllTransport, setIsAllTransport] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showModalOwner, setShowModalOwner] = useState(false);
  const [confirmaPay, setConfirmaPay] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);

  // 详情展示
  const [showDetail, setShowDetail] = useState(false);
  const [transportId, setTransportId] = useState();

  const [checkTotal, setCheckTotal] = useState({
    waitPayNum: 0,
    goodsWeight: 0,
    arrivalGoodsWeight: 0,
  });
  const [seletedKeysIndex, setSeletedKeysIndex] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [stamp, setStamp] = useState('');
  const [disShowType, setDisShowType] = useState(false);
  const [disShowPay, setDisShowPay] = useState(false);
  const checkType = useRef({
    isAllTransport: false,
    selectedRowKeys: [],
    stamp: '',
  });

  useEffect(() => {
    setQueryMemo({
      ...query,
    });
  }, [dataList]);

  useEffect(() => {
    checkType.current = {
      isAllTransport: isAllTransport,
      selectedRowKeys: selectedRowKeys,
      stamp: stamp,
    };
  }, [isAllTransport, selectedRowKeys, stamp]);
  // 初始化
  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;

    setQuery(state);
    getRemoteData(state);
  }, []);

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 车牌号
  const handleChangeTrailerPlateNumber = useCallback(e => {
    const trailerPlateNumber = e.target.value;
    setQuery(() => ({ ...query, trailerPlateNumber }));
  });

  // 司机姓名
  const handleChangeName = useCallback(e => {
    const name = e.target.value;
    setQuery(() => ({ ...query, name }));
  });

  // 运单类型
  const handleChangeIsFleet = useCallback(value => {
    const isFleet = value;
    value === '0' ? setDisShowPay(true) : setDisShowPay(false);

    setQuery(() => ({ ...query, isFleet, payPath: undefined }));
  });

  //付款方式
  const handleChangePayType = useCallback(e => {
    const payPath = e;
    e === undefined ? setDisShowType(false) : setDisShowType(true);
    setQuery(() => ({ ...query, payPath, isFleet: '1' }));
  });

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });

    getRemoteData({ ...query, page: 1 });
    setSelectedRowKeys([]);
    setCheckTotal({
      waitPayNum: 0,
      goodsWeight: 0,
      arrivalGoodsWeight: 0,
    });
    setIsAllTransport(false);
  }, [query]);

  useEffect(() => {
    if (query.pageSize === undefined) {
      return;
    }
    setSeletedKeysIndex([...new Array(query.pageSize).keys()]);
  }, [query.pageSize]);
  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      trailerPlateNumber: '',
      name: '',
      isFleet: undefined,
      payPath: undefined,
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
  }, []);

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
  const getRemoteData = async ({ page, pageSize, begin, end, trailerPlateNumber, name, isFleet, payPath }) => {
    setLoading(true);

    const params = {
      page,
      limit: pageSize,
      begin,
      end,
      trailerPlateNumber,
      name,
      isFleet,
      payPath,
    };

    const res = await transportStatistics.getWaitPayTransportList({ params });

    if (res.status === 0) {
      const { waitPayNum, count, arrivalGoodsWeight, goodsWeight } = res.result;

      setDataList(res.result);
      setTotal({
        waitPayNum,
        orderCount: count,
        arrivalGoodsWeight,
        goodsWeight,
      });

      // 持久化状态
      keepState({
        query: {
          page,
          limit: pageSize,
          begin,
          end,
          trailerPlateNumber,
          name,
          isFleet,
          payPath,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
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

  const handleClickPayAll = useCallback(async () => {
    const { isAllTransport, selectedRowKeys, stamp } = checkType.current;
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

  // 展示详情
  const handleShowDetail = id => {
    setShowDetail(true);
    setTransportId(id);
  };

  // 刷新
  const handleReload = useCallback(() => {
    getRemoteData({ ...query });
  }, [query]);

  // 判断选中项是否为空
  const isEmpty = selectedRowKeys.length === 0 ? true : false;

  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} simple>
        <Search.Item label="承运时间" br>
          <DatePicker.RangePicker
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : undefined}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}
            style={{ width: 400 }}
          />
        </Search.Item>
        <Search.Item label="车牌号">
          <Input
            placeholder="请输入车牌号"
            allowClear
            value={query.trailerPlateNumber}
            onChange={handleChangeTrailerPlateNumber}
          />
        </Search.Item>
        <Search.Item label="司机姓名">
          <Input placeholder="请输入司机姓名" allowClear value={query.name} onChange={handleChangeName} />
        </Search.Item>

        <Search.Item label="专线类型">
          <Select
            style={{ width: '100%' }}
            value={query.isFleet}
            placeholder="请选择专线类型"
            allowClear
            disabled={disShowType}
            onChange={handleChangeIsFleet}>
            <Select.Option label="0" key={0}>
              个人单
            </Select.Option>
            <Select.Option label="1" key={1}>
              车队单
            </Select.Option>
          </Select>
        </Search.Item>
        <Search.Item label="付款方式">
          <Select
            value={query.payPath}
            allowClear
            disabled={disShowPay}
            placeholder="请选择付款方式"
            style={{ width: '100%' }}
            onChange={handleChangePayType}>
            <Option value="0">即时付</Option>
            <Option value="1">延时付</Option>
          </Select>
        </Search.Item>
      </Search>

      <header style={{ padding: '12px 0', marginTop: 12, border: 0 }}>
        运单列表
        <Button type="primary" onClick={handleClickPayAll} style={{ float: 'right' }} loading={btnLoading}>
          支付
        </Button>
      </header>
      <Msg>
        <Checkbox onChange={e => onChangeAllPay(e.target.checked)} checked={isAllTransport}>
          全选(支持跨分页)
        </Checkbox>
        {(!isEmpty || isAllTransport) && <span style={{ marginRight: 12 }}>已选</span>}
        <span>
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
          单
        </span>
        <span style={{ marginLeft: 32 }}>
          待支付运费
          <span className="total-num">
            {!loading ? (
              Format.price(isEmpty || isAllTransport ? total.waitPayNum : checkTotal.waitPayNum)
            ) : (
              <LoadingOutlined style={{ fontSize: 20 }} />
            )}
          </span>
          元
        </span>
        <span style={{ marginLeft: 32 }}>
          发货净重
          <span className="total-num">
            {!loading ? (
              Format.weight(isEmpty || isAllTransport ? total.goodsWeight : checkTotal.goodsWeight)
            ) : (
              <LoadingOutlined style={{ fontSize: 20 }} />
            )}
          </span>
          吨
        </span>
        <span style={{ marginLeft: 32 }}>
          收货净重
          <span className="total-num">
            {!loading ? (
              Format.weight(isEmpty || isAllTransport ? total.arrivalGoodsWeight : checkTotal.arrivalGoodsWeight)
            ) : (
              <LoadingOutlined style={{ fontSize: 20 }} />
            )}
          </span>
          吨
        </span>
      </Msg>
      <Table
        rowKey={(record, i) => (isAllTransport ? i : record.id)}
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        scroll={{ x: 'auto' }}
        pagination={{
          onChange: onChangePage,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
        rowSelection={{
          selectedRowKeys: isAllTransport ? seletedKeysIndex : selectedRowKeys,
          onSelect: onSelectRow,
          onSelectAll: onSelectAll,
          getCheckboxProps: record => ({
            disabled: isAllTransport,
          }),

          // onChange: onSelectChange,
        }}
      />
      {/* 结算全部 */}
      <Modal
        maskClosable={false}
        title="全部支付"
        visible={showAllModal}
        destroyOnClose
        onCancel={() => setShowAllModal(false)}
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
        onCancel={() => setShowModalOwner(false)}
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
        {showDetail && <Detail id={transportId} />}
      </DrawerInfo>
    </>
  );
};

export default OrderList;
