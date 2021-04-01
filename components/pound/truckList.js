import React, { useState, useEffect, useCallback, useRef } from 'react';
import router from 'next/router';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Table, DatePicker, Select, Button, Input, message, Popconfirm } from 'antd';
import { Content, Search, Layout, Msg, Ellipsis, TableHeaderConfig, AutoInput } from '@components';
import moment from 'moment';
import { keepState, getState, clearState, Format } from '@utils/common';
import { pound, vehicleRegister, downLoadFile, getColumnsByTable, setColumnsByTable } from '@api';
import LoadingBtn from '@components/LoadingBtn';

const { RangePicker } = DatePicker;
const { Option } = Select;
const TruckList = props => {
  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 120,
      render: value => value || '-',
    },
    {
      title: '磅单类型',
      dataIndex: 'receiveOrSend',
      key: 'receiveOrSend',
      width: 100,
      render: value => {
        return value ? '收货磅单' : '发货磅单';
      },
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 130,
      render: value => <Ellipsis value={value} width={120} />,
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
      // 发货净重
      title: '发货净重',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: 100,
      align: 'righ{t',
      render: (value, data) => {
        return <span>{data.receiveOrSend ? Format.weight(value) : '-'}</span>;
      },
    },
    {
      // 收货净重
      title: '收货净重',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损',
      dataIndex: 'loss',
      key: 'loss',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运输车次',
      dataIndex: 'carCount',
      key: 'carCount',
      width: 100,
      align: 'right',
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    plate: '',
    type: undefined,
    fromCompany: '',
    toCompany: '',
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [total, setTotal] = useState({
    carCountSum: 0,
    goodsWeightSum: 0,
  });
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
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 发货企业
  const handleChangeFromCompany = useCallback(value => {
    const fromCompany = value;
    setQuery(() => ({ ...query, fromCompany }));
  });

  // 收货企业
  const handleChangeToCompany = useCallback(value => {
    const toCompany = value;
    setQuery(() => ({ ...query, toCompany }));
  });

  // 车牌号
  const handleChangePlate = useCallback(e => {
    const plate = e.target.value;
    setQuery(() => ({ ...query, plate }));
  });

  // 磅单类型
  const handleChangeType = useCallback(value => {
    const type = value;
    setQuery(() => ({ ...query, type }));
  });

  // 货品名称
  const handleChangeGoodsType = useCallback(value => {
    const goodsType = value;
    setQuery(() => ({ ...query, goodsType }));
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
      begin: undefined,
      end: undefined,
      plate: '',
      type: undefined,
      fromCompany: '',
      toCompany: '',
      goodsType: '',
    };
    setQuery(query);
    getRemoteData(query);
  }, []);

  // 导出
  const handleExport = useCallback(async () => {
    if (dataList && dataList.data && dataList.data.length > 0) {
      setExportLoading(true);
      const params = {
        ...query,
        dump: true,
      };

      const res = await pound.poundBillPooled({ params });

      await downLoadFile(res.result, '车牌汇总表');

      setExportLoading(false);
    } else {
      message.warning('数据导出失败，原因：没有数据可以导出');
    }
  }, [dataList]);

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

  // 删除条数
  const handleChangeStatus = async (id, deleteUser) => {
    const params = { id };
    const res = deleteUser
      ? await vehicleRegister.getBackDeletePoundBill({ params })
      : await vehicleRegister.deleteReport({ params });
    if (res.status === 0) {
      message.success(`磅单${!deleteUser ? '删除' : '恢复'}成功`);
      // 若为删除成功则计算当前条数 如果是当页最后一条 则查询上一页 否则查询当前页
      if (dataList.data.length === 1 && !deleteUser) {
        query.page = query.page - 1 || 1;
        setQuery({ ...query });
      }
      getRemoteData({ ...query });
    } else {
      message.error(`${!deleteUser ? '删除' : '恢复'}失败，原因：${res.detail || res.description}`);
    }
  };

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page, pageSize, begin, end, plate, type, fromCompany, toCompany, goodsType }) => {
    setLoading(true);

    const params = {
      page,
      limit: pageSize,
      begin,
      end,
      plate,
      type,
      fromCompany,
      toCompany,
      goodsType,
    };

    const res = await pound.poundBillPooled({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        carCountSum: res.result.carCountSum,
        goodsWeightSum: res.result.goodsWeightSum,
      });
      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          begin,
          end,
          plate,
          type,
          fromCompany,
          toCompany,
          goodsType,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  const handleSupplement = () => {
    router.push('/pound/supplement');
  };

  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} simple>
        <Search.Item label="出站时间" br>
          <RangePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm:ss"
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}
          />
        </Search.Item>
        <Search.Item label="磅单类型">
          <Select
            value={query.type}
            allowClear
            placeholder="请选择磅单类型"
            style={{ width: '100%' }}
            onChange={handleChangeType}>
            <Option value="0">发货磅单</Option>
            <Option value="1">收货磅单</Option>
          </Select>
        </Search.Item>
        <Search.Item label="车牌号">
          <Input allowClear value={query.plate} placeholder="请输入车牌号" onChange={handleChangePlate} />
        </Search.Item>
        <Search.Item label="发货企业">
          <AutoInput
            mode="company"
            value={query.fromCompany}
            allowClear
            placeholder="请输入发货企业"
            onChange={handleChangeFromCompany}
          />
        </Search.Item>
        <Search.Item label="收货企业">
          <AutoInput
            mode="company"
            value={query.toCompany}
            allowClear
            placeholder="请输入收货企业"
            onChange={handleChangeToCompany}
          />
        </Search.Item>
        <Search.Item label="货品名称">
          <AutoInput
            mode="goodsType"
            value={query.goodsType}
            allowClear
            placeholder="请输入货品名称"
            onChange={handleChangeGoodsType}
          />
        </Search.Item>
      </Search>

      <header style={{ padding: '12px 0', marginTop: 12, border: 0 }}>
        车牌汇总列表
        <div style={{ float: 'right' }}>
          {(props.isSuperUser || props.permissions.includes('POUND_STATISTICS_MANAGEMENT')) && (
            <Button type="primary" onClick={handleSupplement}>
              磅单补录
            </Button>
          )}

          <LoadingBtn style={{ marginLeft: 12, marginRight: 5 }} onClick={handleExport} loading={exportLoading}>
            导出
          </LoadingBtn>
        </div>
      </header>

      <Msg>
        合计：
        <span style={{ marginRight: 32, marginLeft: 8 }}>
          {/* 运输车次 */}
          运输车次<span className="total-num">{total.carCountSum}</span>次
        </span>
        <span style={{ marginRight: 32, marginLeft: 8 }}>
          {/* 收货净重总和 */}
          当前净重<span className="total-num">{Format.weight(total.goodsWeightSum)}</span>吨
        </span>
      </Msg>

      <Table
        columns={columns}
        pagination={{
          onChange: onChangePage,
          onShowSizeChange: onChangePageSize,
          showSizeChanger: true,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
        dataSource={dataList.data}
        loading={loading}
        scroll={{ x: 'auto' }}
      />
    </>
  );
};

export default TruckList;
