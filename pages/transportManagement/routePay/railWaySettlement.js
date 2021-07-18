/** @format */

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, Modal, message, Tooltip, Tag } from 'antd';
import { DateRangePicker, Content, Search, Msg, Layout, DrawerInfo } from '@components';
import { keepState, getState, clearState, Format } from '@utils/common';
import LoadingBtn from '@components/LoadingBtn';
import styles from './styles.less';
import Detail from '@components/Transport/detail';
import router from 'next/router';
import Link from 'next/link';
import moment from 'moment';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { transportStatistics } from '@api';
import { getQuery } from '@utils/common';
const RailWaySettlement = props => {
  const routeView = {
    title: '运单管理',
    pageKey: 'routeList',
    longKey: 'transportManagement.routeList',
    breadNav: [
      '运单管理',
      <Link href="/transportManagement/routeList">
        <a>专线结算支付</a>
      </Link>,
      '按专线结算详情',
    ],
    useBack: true,
  };

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    trailerPlateNumber: '',
    name: '',
    dateStatus: '',
  });

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 130,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
      width: 130,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      align: 'right',
      render: Format.price,
    },
    {
      title: '预计运费(元)',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      align: 'right',
      render: (value, record) => {
        return Format.price(record.price + record.totalInfoFee);
      },
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      minWidth: 250,
      width: 250,
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
          <Button
            type="link"
            size="small"
            // onClick={() => router.push(`/transport/transportStatistics/allDetail?id=${value}`)}
            onClick={() => handleShowDetail(value)}>
            详情
          </Button>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [rides, setRides] = useState('');
  const [routeInfo, setRouteInfo] = useState({});
  const [fleetInfo, setFleetInfo] = useState({});
  const [visible, setVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [settlementInfo, setSettlementInfo] = useState({});
  const [checkTotal, setCheckTotal] = useState({
    waitPayNum: 0,
    goodsWeight: 0,
    arrivalGoodsWeight: 0,
  });
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

  useEffect(() => {
    setTimeout(() => {
      document.body.style.overflow = visible ? 'hidden' : 'visible';
    }, 500);
  }, [visible]);

  const getDataList = async ({ begin, end, trailerPlateNumber, page, pageSize, name }) => {
    setLoading(true);
    const { id } = getQuery();
    const params = {
      status: 'CHECKING',
      limit: pageSize,
      page,
      id,
      begin: begin || undefined,
      end: end || undefined,
      trailerPlateNumber: trailerPlateNumber || undefined,
      name: name || undefined,
    };

    const res = await transportStatistics.getWaitPayFleetTransportDetailList({
      params,
    });
    if (res.status === 0) {
      setDataList(res.result);
      setRouteInfo(res.result.routeInfo);
      setFleetInfo(res.result.fleetInfo);
    }

    setLoading(false);
  };

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      trailerPlateNumber: '',
      name: '',
    };
    setSelectedRowKeys([]);
    setCheckTotal({
      waitPayNum: 0,
      goodsWeight: 0,
      arrivalGoodsWeight: 0,
    });
    setQuery(query);
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

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 日期输入
  const handleChangeDate = useCallback(({ begin, end }, dateStatus) => {
    const _begin = begin ? moment(begin).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setQuery(() => ({ ...query, begin: _begin, end: _end, dateStatus }));
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

  const handleClickSettlementAll = async () => {
    if (dataList.data.length <= 0) {
      message.warn('没有要结算的运单');
      return;
    } else if (selectedRowKeys.length <= 0) {
      message.warn('请选择要结算的运单');
      return;
    }

    let params = {
      tides: selectedRowKeys.join(' '),
    };

    const res = await transportStatistics.calculateCheckingInfo({ params });
    if (res.status === 0) {
      setSettlementInfo(res.result);
      setVisible(true);
    } else {
      message.error(`${res.detail || res.description}`);
      getDataList({ ...query });
      setSelectedRowKeys([]);
    }
    setBtnLoading(false);
  };

  //结算
  const onClickSettlement = async () => {
    let params = {
      tides: selectedRowKeys.join(' '),
      checkTime: settlementInfo.nowTime,
    };

    const res = await transportStatistics.checkTransports({ params });
    if (res.status === 0) {
      setVisible(false);
      setSelectedRowKeys([]);
      getDataList({ ...query });
      message.success('批量结算成功');
    } else {
      message.error(`${res.detail || res.description}`);
      setSelectedRowKeys([]);
      getDataList({ ...query });
      setVisible(false);
    }
  };

  // 展示详情
  const handleShowDetail = id => {
    setShowDetail(true);
    setTransportId(id);
  };

  // 刷新
  const handleReload = useCallback(() => {
    getDataList({ ...query });
    setSelectedRowKeys([]);
    setCheckTotal({
      waitPayNum: 0,
      goodsWeight: 0,
      arrivalGoodsWeight: 0,
    });
  }, [query]);

  useEffect(() => {
    const { id } = getQuery();
    setRides(id);

    if (getState().drawInfo.show) {
      handleShowDetail(getState().drawInfo.transportId);
    }
    getDataList({ ...query });
  }, []);
  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <header style={{ borderRadius: 0 }}>
          专线信息
          <Tag
            color={dataList.transportFleetId ? '#FFF5F5' : '#F5F9FF'}
            style={{
              marginLeft: 10,
              color: dataList.transportFleetId ? '#e44040' : '#477AEF',
              borderColor: dataList.transportFleetId ? '#e44040' : '#477AEF',
              borderWidth: 1,
              position: 'relative',
              top: -1,
            }}>
            {dataList.transportFleetId ? '车队单' : '个人单'}
          </Tag>
          {dataList.transportFleetId && (
            <Tag
              color={dataList.payPath === 0 ? '#FFFBF4' : '#F5FFF8'}
              style={{
                color: dataList.payPath === 0 ? '#FFB741' : '#66BD7E',
                borderColor: dataList.payPath === 0 ? '#FFB741' : '#66BD7E',
                borderWidth: 1,
                position: 'relative',
                top: -1,
              }}>
              {dataList.routeInfo.payPathZn}
            </Tag>
          )}
        </header>
        <section className={styles['pay-fleetDetail-info']}>
          <div className="info-row" style={{ display: 'flex' }}>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                发货企业：
              </div>
              <div className="info-data" style={{ verticalAlign: 'top' }}>
                {routeInfo.fromCompany ? (
                  <Tooltip placement="topLeft" title={routeInfo.fromCompany} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.fromCompany}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                发货地址：
              </div>
              <div className="info-data" style={{ verticalAlign: 'top' }}>
                {routeInfo.fromAddress ? (
                  <Tooltip placement="topLeft" title={routeInfo.fromAddress} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.fromAddress}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0, verticalAlign: 'top' }}>
                货品名称：
              </div>
              <div className="info-data">
                {routeInfo.goodsType ? (
                  <Tooltip placement="topLeft" title={routeInfo.goodsType} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.goodsType}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>
          </div>

          <div className="info-row" style={{ display: 'flex' }}>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                收货企业：
              </div>
              <div className="info-data" style={{ verticalAlign: 'top' }}>
                {routeInfo.toCompany ? (
                  <Tooltip placement="topLeft" title={routeInfo.toCompany} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.toCompany}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                收货地址：
              </div>
              <div className="info-data" style={{ verticalAlign: 'top' }}>
                {routeInfo.toAddress ? (
                  <Tooltip placement="topLeft" title={routeInfo.toAddress} overlayStyle={{ maxWidth: 'max-content' }}>
                    <div className="max-label" style={{ width: 180 }}>
                      {routeInfo.toAddress}
                    </div>
                  </Tooltip>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                运费单价：
              </div>
              <div className="info-data">{Format.price(routeInfo.unitPrice)}元</div>
            </div>
          </div>

          <div className="info-row" style={{ display: 'flex' }}>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                车队长：
              </div>
              <div className="info-data">{fleetInfo.fleetCaptainName || '-'}</div>
            </div>
            <div
              style={{
                flex: 1,
              }}>
              <div className="info-label" style={{ minWidth: 0, padding: 0 }}>
                车队名称：
              </div>
              <div className="info-data">{fleetInfo.fleetName || '-'}</div>
            </div>
            <div
              style={{
                flex: 1,
              }}></div>
          </div>
        </section>
      </Content>
      <Content style={{ marginTop: 16 }}>
        <section style={{ padding: 16 }}>
          <Search onSearch={handleSearch} onReset={handleReset} simple>
            <Search.Item label="承运时间" br>
              {/* <DatePickerTime
                onChange={handleChangeDate}
                value={{ begin: query.begin, end: query.end }}
                dateStatus={query.dateStatus}
                style={{ width: 400 }}
              /> */}
              <DateRangePicker
                quickBtn={true}
                onChange={handleChangeDate}
                value={{ begin: query.begin, end: query.end }}
                dateStatus={query.dateStatus}
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
          </Search>
          <div style={{ border: 0, margin: '4px 0', padding: '4px 0' }}>
            {dataList.transportFleetId && (
              <header style={{ border: 0, padding: '4px 0', height: 42 }}>
                {/* 运单列表 */}
                <LoadingBtn
                  type="primary"
                  onClick={handleClickSettlementAll}
                  style={{ float: 'left' }}
                  loading={btnLoading}>
                  结算
                </LoadingBtn>
              </header>
            )}
          </div>
          {dataList.transportFleetId ? (
            <Msg>
              <span style={{ marginRight: 32 }}>
                {selectedRowKeys.length > 0 ? <span style={{ marginRight: 12 }}>已选</span> : ''}
                运单数
                <span className="total-num">
                  {selectedRowKeys.length > 0 ? selectedRowKeys.length : dataList.count}
                </span>
                单
              </span>

              <span style={{ marginRight: 32 }}>
                发货净重
                <span className="total-num">
                  {Format.weight(selectedRowKeys.length > 0 ? checkTotal.goodsWeight : dataList.goodsWeight)}
                </span>
                吨
              </span>
              <span>
                收货净重
                <span className="total-num">
                  {/* {Format.weight(dataList.arrivalGoodsWeight || 0)} */}
                  {Format.weight(
                    selectedRowKeys.length > 0 ? checkTotal.arrivalGoodsWeight : dataList.arrivalGoodsWeight
                  )}
                </span>
                吨
              </span>
            </Msg>
          ) : (
            <Msg style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 32 }}>
                运单数
                <span className="total-num">{dataList.count}</span>单
              </span>

              <span style={{ marginRight: 32 }}>
                发货净重
                <span className="total-num">
                  {Format.weight(selectedRowKeys.length > 0 ? checkTotal.goodsWeight : dataList.goodsWeight)}
                </span>
                吨
              </span>
              <span>
                收货净重
                <span className="total-num">
                  {/* {Format.weight(dataList.arrivalGoodsWeight || 0)} */}
                  {Format.weight(
                    selectedRowKeys.length > 0 ? checkTotal.arrivalGoodsWeight : dataList.arrivalGoodsWeight
                  )}
                </span>
                吨
              </span>
            </Msg>
          )}

          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            rowSelection={
              dataList.transportFleetId
                ? {
                    selectedRowKeys: selectedRowKeys,
                    onSelect: onSelectRow,
                    onSelectAll: onSelectAll,
                    // getCheckboxProps: record => ({
                    //   disabled: isAllTransport,
                    // }),
                  }
                : undefined
            }
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
      <Modal
        title="批量结算"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={
          <div>
            <Button onClick={() => setVisible(false)}>我再想想</Button>
            <Button type="primary" onClick={onClickSettlement}>
              确认结算
            </Button>
          </div>
        }>
        <div style={{ paddingLeft: 72 }}>
          <ExclamationCircleFilled
            style={{
              color: '#FFB741FF',
              fontSize: 20,
              height: 20,
              width: 20,
              position: 'absolute',
              left: 64,
              top: 75,
            }}
          />
          <div style={{ color: '#333333', fontSize: 16, fontWeight: 600 }}>
            批量结算无法修改运费，如需修改请单笔结算
          </div>
          <div
            style={{
              marginBottom: 6,
              marginTop: 24,
              color: '#333333',
              fontSize: 14,
            }}>
            运输车次：<span>{settlementInfo.transportCount}</span>次
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 16,
              color: '#333333',
              fontSize: 14,
            }}>
            <div style={{ marginRight: 24 }}>
              发货净重：
              <span>{Format.weight(settlementInfo.totalGoodsWeight)}</span>吨
            </div>
            <div>
              收货净重：
              <span>{Format.weight(settlementInfo.totalArrivalGoodsWeight)}</span>吨
            </div>
          </div>
          <div style={{ marginTop: 16, color: '#333333' }}>
            结算运费：
            <span style={{ color: '#477AEF', fontSize: 16 }}>
              {Format.price(settlementInfo.realPrice + settlementInfo.totalInfoFee)}
            </span>
            元
          </div>
        </div>
      </Modal>

      <DrawerInfo
        title="运单详情"
        onClose={() => setShowDetail(false)}
        showDrawer={showDetail}
        width="664"
        afterClose={handleReload}>
        {showDetail && <Detail id={transportId} close={() => setShowDetail(false)} />}
      </DrawerInfo>
    </Layout>
  );
};

export default RailWaySettlement;
