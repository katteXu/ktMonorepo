import { useState, useEffect, useCallback } from 'react';
import { Table, Button, DatePicker, message, Input, Select } from 'antd';
import { Content, Status, Search, Msg, DrawerInfo } from '@components';
import Detail from '@components/Transport/detail';
import router from 'next/router';
import { railWay, downLoadFile } from '../../api';
import moment from 'moment';
import { getQuery, Format } from '@utils/common';
import LoadingBtn from '@components/LoadingBtn';

const { RangePicker } = DatePicker;

const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return value ? ((value || 0) / 100).toFixed(2) : '-';
};

const OrderTable = () => {
  // 列名
  const columns = [
    {
      title: '车牌号',
      dataIndex: ['truck', 'trailerPlateNumber'],
      key: 'truck.]trailerPlateNumber',
      width: 120,
    },
    {
      title: '司机姓名',
      dataIndex: ['trucker', 'name'],
      key: 'trucker.name',
      width: 120,
    },

    {
      title: '手机号',
      dataIndex: ['trucker', 'mobilePhoneNumber'],
      key: 'trucker.mobilePhoneNumber',
      width: 120,
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      align: 'right',
      width: 120,
      render(value, record) {
        return record.goodsWeight !== 0 ? (record.goodsWeight / 1000).toFixed(2) + ' ' + record.unitName : '-';
      },
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      align: 'right',
      width: 120,
      render(value, record) {
        const result =
          record.arrivalGoodsWeight !== 0 ? (record.arrivalGoodsWeight / 1000).toFixed(2) + ' ' + record.unitName : '-';
        return result;
      },
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      align: 'right',
      width: 100,
      render(value, record) {
        return record.loss ? `${(record.loss / 1000).toFixed(2)} ${record.unitName}` : 0;
      },
    },
    {
      title: '结算单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 120,
      render: (value, record, index) => {
        return <span>{Format.price((value + record.unitInfoFee).toFixed(0))}</span>;
      },
    },
    {
      title: '运费(元)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 140,
      render: (value, { realPrice }) => {
        return realPrice === 0 ? formatPrice(value) : formatPrice(realPrice);
      },
    },
    {
      title: '运单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value, { applyCancelType }) => {
        return applyCancelType != 0 ? <Status.Order code="APPLY_CANCEL" /> : <Status.Order code={value} />;
      },
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 60,
      fixed: 'right',
      align: 'right',
      render: (value, record) => {
        const { id, status } = record;
        return (
          <Button type="link" size="small" onClick={() => handleShowDetail(id)}>
            详情
          </Button>
        );
      },
    },
  ];

  const [dataList, setData] = useState([]);
  const [currPage, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [realTotalPrice, setRealTotalPrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [goodsWeight, setGoodsWeight] = useState(0);
  const [arrivalGoodsWeight, setArrivalGoodsWeight] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [exporting, setExport] = useState(false);
  // 查询条件
  const [trailerPlateNumber, setTrailerPlateNumber] = useState();
  const [date, setDate] = useState([]);
  const [unitPrice, setUnitPrice] = useState();
  const [status, setStatus] = useState();

  // 开始查询
  const [search, setSearch] = useState(true);

  // 详情展示
  const [showDetail, setShowDetail] = useState(false);
  const [transportId, setTransportId] = useState();

  // 导出函数
  const [exportByQuery, setExportByQuery] = useState();
  // 监听日期变化 && 监听页数变化
  useEffect(() => {
    getData();
  }, [search]);

  // 监听数据变化动态构建导出函数
  useEffect(() => {
    const { id } = getQuery();
    const { userId } = localStorage;
    const [start, end] = date;
    const params = {
      routeId: id,
      id: userId,
      status: status || undefined,
      unitPrice: unitPrice ? unitPrice * 100 : undefined,
      trailerPlateNumber: trailerPlateNumber || undefined,
      start: start || undefined,
      end: end || undefined,
      download: 1,
    };

    // 导出函数
    const _exportByQuery = async () => {
      if (dataList.length === 0) {
        message.warning('数据导出失败，原因：没有数据可以导出');
        return false;
      }
      setExport(true);

      const res = await railWay.railWayTable({ params });
      await downLoadFile(res.result, '运单统计');
      setExport(false);
    };

    setExportByQuery(() => _exportByQuery);
  }, [dataList]);
  const [dataInfoAll, setDataInfoAll] = useState({});
  // 获取数据
  const getData = async () => {
    setLoading(true);
    const { id } = getQuery();
    const { userId } = localStorage;
    const [start, end] = date;
    const params = {
      routeId: id,
      id: userId,
      limit: pageSize,
      startTime: start || undefined,
      endTime: end || undefined,
      page: currPage,
      status: status || undefined,
      unitPrice: unitPrice ? unitPrice * 100 : undefined,
      trailerPlateNumber: trailerPlateNumber || undefined,
    };

    const res = await railWay.railWayTable({ params });
    setDataInfoAll(res.result);
    setData(res.result.data);
    setTotal(res.result.count);
    setRealTotalPrice(res.result.realTotalPrice);
    setPrice(res.result.price);
    setGoodsWeight(res.result.goodsWeight);
    setArrivalGoodsWeight(res.result.arrivalGoodsWeight);
    setLoading(false);
  };

  // 导出
  const exportData = () => {
    exportByQuery && exportByQuery();
  };

  // 翻页
  const onChangePage = (page, pageSize) => {
    setPage(page);
    setPageSize(pageSize);
    setSearch(state => !state);
  };

  // 切换总页码
  const onChangePageSize = (current, pageSize) => {
    setPage(1);
    setPageSize(pageSize);
    setSearch(state => !state);
  };

  // 查询
  const query = () => {
    setPage(1);
    setPageSize(10);
    setSearch(state => !state);
  };

  const handleReset = () => {
    setPage(1);
    setPageSize(10);
    setTrailerPlateNumber(undefined);
    setUnitPrice(undefined);
    setDate([]);
    setStatus(undefined);
    setSearch(state => !state);
  };

  // 展示详情
  const handleShowDetail = id => {
    setShowDetail(true);
    setTransportId(id);
  };

  // 刷新
  const handleReload = useCallback(() => {
    getData();
  }, [query]);

  return (
    <Content style={{ marginTop: 16 }}>
      {/* <header>专线运单</header> */}
      <section>
        <Search simple onSearch={query} onReset={handleReset} exportLoading={exporting} onExport={exportData}>
          <Search.Item label="承运时间" br>
            <RangePicker
              style={{ width: 376 }}
              value={date[0] && date[1] ? [moment(date[0]), moment(date[1])] : []}
              format="YYYY-MM-DD"
              onChange={(obj, str) => setDate(str)}
            />
          </Search.Item>
          <Search.Item label="车牌号">
            <Input
              allowClear
              placeholder="请输入车牌号"
              value={trailerPlateNumber}
              onChange={e => setTrailerPlateNumber(e.target.value)}
            />
          </Search.Item>
          {/* <Search.Item label="运费单价">
            <Input
              allowClear
              placeholder="请输入运费单价"
              value={unitPrice}
              onChange={e => setUnitPrice(e.target.value)}
            />
          </Search.Item> */}
          <Search.Item label="运单状态">
            <Select
              style={{ width: '100%' }}
              value={status}
              placeholder="请选择状态"
              allowClear
              onChange={value => setStatus(value)}>
              {Object.entries(Status.order).map(item => {
                return (
                  <Select.Option label={item[0]} key={item[0]}>
                    {item[1]}
                  </Select.Option>
                );
              })}
            </Select>
          </Search.Item>
        </Search>

        {/* <header style={{ padding: '12px 0', marginTop: 12, border: 0 }}>
          运单列表
          <LoadingBtn style={{ float: 'right' }} loading={exporting} onClick={exportData}>
            导出
          </LoadingBtn>
        </header> */}
        <Msg style={{ marginTop: 16 }}>
          <span>
            运单总数<span className="total-num">{total}</span>单
          </span>
          <span style={{ marginLeft: 32 }}>
            已支付运费{' '}
            <span className="total-num">{Format.price((realTotalPrice + dataInfoAll.realInfoFee).toFixed(0))}</span>元
          </span>
          <span style={{ marginLeft: 32 }}>
            待支付运费 <span className="total-num">{Format.price((price + dataInfoAll.infoFee).toFixed(0))}</span> 元
          </span>
          <span style={{ marginLeft: 32 }}>
            发货净重<span className="total-num">{(goodsWeight / 1000).toFixed(2)}</span>吨
          </span>
          <span style={{ marginLeft: 32 }}>
            收货净重<span className="total-num">{(arrivalGoodsWeight / 1000).toFixed(2)}</span>吨
          </span>
        </Msg>
        <Table
          loading={loading}
          dataSource={dataList}
          columns={columns}
          scroll={{ x: 1360 }}
          pagination={{
            pageSize: pageSize,
            total: total,
            current: currPage,
            onChange: onChangePage,
          }}
        />
      </section>

      <DrawerInfo
        title="运单详情"
        onClose={() => setShowDetail(false)}
        showDrawer={showDetail}
        width="664"
        afterClose={handleReload}>
        {showDetail && <Detail id={transportId} />}
      </DrawerInfo>
    </Content>
  );
};

export default OrderTable;
