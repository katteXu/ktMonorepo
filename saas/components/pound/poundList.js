import React, { useState, useEffect, useCallback, useRef } from 'react';
import router from 'next/router';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Table, DatePicker, Select, Button, Input, message, Popconfirm } from 'antd';
import { Search, Msg, Ellipsis, TableHeaderConfig, AutoInput } from '@components';
import moment from 'moment';
import { keepState, getState, clearState, Format } from '@utils/common';
import { pound, vehicleRegister, downLoadFile, getColumnsByTable, setColumnsByTable } from '@api';
import LoadingBtn from '@components/LoadingBtn';

const { RangePicker } = DatePicker;
const { Option } = Select;
const PoundList = props => {
  /**
   * 表头设置
   * 应用组件中需要如下配置
   * 1. 默认表头：当用户选择为空或为选择是展示的表头
   * 2. 选中表头：当用户选择时候的展示表头
   * 3. 全部表头：用户可筛选的表头
   * 4. 选中表头ref：用于导出时传参
   * 5. 监听选中表头：更新表头ref
   */
  const defaultColumns = [
    'trailerPlateNumber',
    'name',
    'fromCompany',
    'toCompany',
    'goodsType',
    'goodsWeight',
    'fromGoodsWeight',
    'createdAt',
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
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 120,
      render: value => value || '-',
    },
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: value => value || '-',
    },
    {
      title: '司机电话',
      dataIndex: 'mobilePhoneNumber',
      key: 'mobilePhoneNumber',
      width: 100,
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
      width: 130,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      // 发货净重
      title: '发货净重',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '毛重',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '皮重',
      dataIndex: 'carWeight',
      key: 'carWeight',
      width: 100,
      align: 'right',
      render: Format.weight,
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
      title: '实际重量',
      dataIndex: 'modifyGoodsWeight',
      key: 'modifyGoodsWeight',
      width: 100,
      align: 'right',
      render: (value, data) => {
        return <span>{value > 0 ? Format.weight(value) : Format.weight(data.goodsWeight)}</span>;
      },
    },
    {
      title: '重量修改人',
      dataIndex: 'modifyUser',
      key: 'modifyUser',
      width: 100,
      render: value => value || '-',
    },
    {
      title: '删除人',
      dataIndex: 'deleteUser',
      key: 'deleteUser',
      width: 100,
      render: value => value || '-',
    },
    {
      title: '出站时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record) => {
        const { id, isDelete, deleteUser } = record;
        return (
          <div style={{ display: 'flex' }}>
            <Button size="small" type="link" onClick={() => router.push(`/virtualDetail?id=${id}`)}>
              电子磅单
            </Button>
            {(props.isSuperUser || props.permissions.includes('POUND_STATISTICS_MANAGEMENT')) && (
              <Popconfirm
                title={`是否${!isDelete ? '删除' : '恢复'}该磅单？`}
                placement="topRight"
                icon={<QuestionCircleFilled />}
                onConfirm={() => handleChangeStatus(id, isDelete)}>
                <Button size="small" type="link" danger>
                  {!isDelete ? '删除' : '恢复'}
                </Button>
              </Popconfirm>
            )}
          </div>
        );
      },
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
    isModify: undefined,
    isDelete: undefined,
    goodsType: '',
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [total, setTotal] = useState({
    sum_fromGoodsWeight: 0,
    sum_goodsWeight: 0,
    sum_count: 0,
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

    // 设置表头
    setColumns();
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

  // 是否修改
  const handleChangeIsModify = useCallback(value => {
    const isModify = value;
    setQuery(() => ({ ...query, isModify }));
  });

  // 是否删除
  const handleChangeIsDelete = useCallback(value => {
    const isDelete = value;
    setQuery(() => ({ ...query, isDelete }));
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
      isModify: undefined,
      isDelete: undefined,
      goodsType: '',
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

      const params = {
        ...query,
        keyList: keyList.join(' '),
        titleList: titleList.join(' '),
        dump: true,
      };

      const res = await pound.getBillReport({ params });

      await downLoadFile(res.result, '磅单明细表');

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
      type: 'poundDetailTable',
      titleList: columns.join(' '),
    };
    const res = await setColumnsByTable({ params });
  };

  // 删除条数
  const handleChangeStatus = async (id, isDelete) => {
    const params = { id };
    const res = isDelete
      ? await vehicleRegister.getBackDeletePoundBill({ params })
      : await vehicleRegister.deleteReport({ params });
    if (res.status === 0) {
      message.success(`磅单${!isDelete ? '删除' : '恢复'}成功`);
      // 若为删除成功则计算当前条数 如果是当页最后一条 则查询上一页 否则查询当前页
      if (dataList.data.length === 1 && !isDelete) {
        query.page = query.page - 1 || 1;
        setQuery({ ...query });
      }
      getRemoteData({ ...query });
    } else {
      message.error(`${!isDelete ? '删除' : '恢复'}失败，原因：${res.detail || res.description}`);
    }
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
    plate,
    type,
    fromCompany,
    toCompany,
    isModify,
    isDelete,
    goodsType,
  }) => {
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
      isModify,
      isDelete,
      goodsType,
    };

    const res = await pound.getBillReport({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        sum_goodsWeight: res.result.sum_goodsWeight,
        sum_fromGoodsWeight: res.result.sum_fromGoodsWeight,
        sum_count: res.result.sum_count,
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
          isModify,
          isDelete,
          goodsType,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 设置表头
  const setColumns = async () => {
    const params = {
      type: 'poundDetailTable',
    };
    const res = await getColumnsByTable({ params });
    if (res.result !== '') {
      setShowColumns(res.result.split(' '));
    } else {
      setShowColumns([]);
    }
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
        <Search.Item label="是否修改">
          <Select
            value={query.isModify}
            allowClear
            placeholder="请选择"
            style={{ width: '100%' }}
            onChange={handleChangeIsModify}>
            <Option value={true}>是</Option>
            <Option value={false}>否</Option>
          </Select>
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
        <Search.Item label="是否删除">
          <Select
            value={query.isDelete}
            allowClear
            placeholder="请选择"
            style={{ width: '100%' }}
            onChange={handleChangeIsDelete}>
            <Option value={true}>是</Option>
            <Option value={false}>否</Option>
          </Select>
        </Search.Item>
      </Search>
      <header style={{ padding: '12px 0', marginTop: 12, border: 0 }}>
        磅单列表
        <div style={{ float: 'right' }}>
          {(props.isSuperUser || props.permissions.includes('POUND_STATISTICS_MANAGEMENT')) && (
            <Button type="primary" onClick={handleSupplement}>
              磅单补录
            </Button>
          )}

          <LoadingBtn style={{ marginLeft: 12, marginRight: 5 }} onClick={handleExport} loading={exportLoading}>
            导出
          </LoadingBtn>
          {/* 表头设置 */}
          <TableHeaderConfig
            columns={columns}
            showColumns={showColumns.length > 0 ? showColumns : defaultColumns}
            onChange={onChangeColumns}
          />
        </div>
      </header>
      <Msg>
        合计：
        <span style={{ marginRight: 32, marginLeft: 8 }}>
          {/* 运输车次 */}
          运输车次<span className="total-num">{total.sum_count}</span>次
        </span>
        <span style={{ marginRight: 32, marginLeft: 8 }}>
          {/* 收货净重总和 */}
          当前净重
          <span className="total-num">{Format.weight(total.sum_goodsWeight)}</span>吨
        </span>
        <span>
          {/* 发货净重总和 */}
          实际净重
          <span className="total-num">{Format.weight(total.sum_fromGoodsWeight)}</span>吨
        </span>
      </Msg>

      <Table
        columns={columns.filter(({ key }) => {
          if (key === 'ctrl') {
            return true;
          }
          return showColumns.length > 0 ? showColumns.includes(key) : defaultColumns.includes(key);
        })}
        pagination={{
          onChange: onChangePage,
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

export default PoundList;
