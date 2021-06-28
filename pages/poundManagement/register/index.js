import { useState, useEffect, useCallback } from 'react';
import { Button, Select, Table, message, DatePicker, Input, Popconfirm } from 'antd';
import { Search } from '@components';
import moment from 'moment';
import { vehicleRegister, downLoadFile } from '@api';
import router from 'next/router';
import { keepState, getState, clearState } from '@utils/common';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Permission } from '@store';

const { RangePicker } = DatePicker;

const Register = props => {
  const { permissions, isSuperUser } = Permission.useContainer();

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 100,
    },
    {
      title: '车辆类型',
      dataIndex: 'truckType',
      key: 'truckType',
      width: 180,
    },
    {
      title: '车辆轴数',
      dataIndex: 'shaftNumber',
      key: 'shaftNumber',
      width: 100,
    },
    {
      title: '车辆所属企业',
      dataIndex: 'businessName',
      key: 'businessName',
      width: 250,
    },
    {
      title: '道路运输证号',
      dataIndex: 'roadNumber',
      key: 'roadNumber',
      width: 200,
    },
    {
      title: '驾驶人姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '从业资格证号码',
      dataIndex: 'qualificationNumber',
      key: 'qualificationNumber',
      width: 200,
    },
    {
      title: '驾驶人所属企业',
      dataIndex: 'address',
      key: 'address',
      width: 250,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 150,
    },
    {
      title: '货品装载单编号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
    },
    {
      title: '车货总量(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 120,
      render: value => {
        return (value / 1000).toFixed(2);
      },
    },
    {
      title: '行驶证核定载质(吨)',
      dataIndex: 'truckLoad',
      key: 'truckLoad',
      width: 180,
      render: value => {
        return (value / 1000).toFixed(2);
      },
    },
    {
      title: '车辆出场时间',
      dataIndex: 'outTime',
      key: 'outTime',
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      width: 150,
      render: (text, data, index) => {
        return (
          <>
            <Button type="link" size="small" onClick={() => router.push('/virtualDetail?id=' + data.id)}>
              电子磅单
            </Button>
            {(isSuperUser || permissions.includes('SMART_POUND_MANAGEMENT')) && (
              <Popconfirm
                title="是否删除该磅单？"
                placement="topRight"
                icon={<QuestionCircleFilled />}
                onConfirm={() => deleteLine(data)}>
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            )}
          </>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [exportLoading, setExportLoading] = useState(false);

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    fromCompany: '',
    toCompany: '',
    violationType: undefined,
  });

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    const { date, violationType } = router.query;
    const { defaultNum } = sessionStorage;

    // 获取持久化数据
    const dataInfo =
      date !== undefined
        ? {
            begin: moment(date).format('YYYY-MM-DD' + ' 00:00:00'),
            end: moment(date).format('YYYY-MM-DD' + ' 23:59:59'),
            violationType: violationType || undefined,
          }
        : {};
    const state = {
      ...getState().query,
      ...dataInfo,
    };
    const state1 = {
      ...getState().query,
    };
    setQuery(defaultNum === '1' ? state : state1);
    getDataList(state);
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.setItem('defaultNum', '2'), clearState();
    };
  }, []);

  const getDataList = async ({ violationType, pageSize, page, fromCompany, toCompany, begin, end }) => {
    setLoading(true);
    const { userId } = localStorage;
    const params = {
      violationType: violationType || undefined,
      limit: pageSize,
      page,
      ownerId: userId,
      begin: begin || undefined,
      end: end || undefined,
      fromCompany,
      toCompany,
    };
    const res = await vehicleRegister.getTableData({ params });
    if (res.status === 0) {
      setLoading(false);
      setDataList(res.result);
      keepState({
        query: {
          fromCompany,
          toCompany,
          violationType: violationType || undefined,
          page,
          pageSize,
          begin,
          end,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
      setLoading(false);
    }
  };

  // 导出
  const exportByQuery = useCallback(async () => {
    const { userId } = localStorage;
    if (dataList.data.length === 0) {
      message.warning('数据导出失败，原因：没有数据可以导出');
      return;
    }
    setExportLoading(true);
    let params = {
      dump: true,
      ownerId: userId,
      fromCompany: query.fromCompany || undefined,
      toCompany: query.toCompany || undefined,
      receiveOrSend: query.receiveOrSend || undefined,
      begin: query.begin || undefined,
      end: query.end || undefined,
      violationType: query.violationType || undefined,
    };

    const res = await vehicleRegister.getTableData({ params });
    if (res.status === 0) {
      await downLoadFile(res.result, '车辆装载登记表');
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setExportLoading(false);
  }, [dataList]);

  // 日期输入
  const onChangeDatePicker = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  const onChangeViolationType = useCallback(value => {
    const violationType = value && value;
    setQuery(() => ({ ...query, violationType }));
  });

  // 翻页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getDataList({ ...query, page, pageSize });
    },
    [dataList]
  );

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  const deleteLine = useCallback(async data => {
    const params = {
      id: data.id,
    };
    const res = await vehicleRegister.deleteReport({ params });
    if (res.status === 0) {
      message.success('磅单删除成功');
      // 删除最后一条
      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }

      setQuery({ ...query, page });
      getDataList({ ...query, page });
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  });

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

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

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      fromCompany: '',
      toCompany: '',
      receiveOrSend: undefined,
    };
    setQuery(query);
    getDataList(query);
  }, []);

  return (
    <>
      <Search onSearch={handleSearch} onReset={resetFilter} onExport={exportByQuery} exportLoading={exportLoading}>
        <Search.Item label="出站时间" br>
          <RangePicker
            style={{ width: 376 }}
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            showTime={{
              format: 'HH:mm:ss',
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            format="YYYY-MM-DD HH:mm:ss"
            onChange={onChangeDatePicker}
            size="default"
          />
        </Search.Item>
        <Search.Item label="异常数据">
          <Select
            value={query.violationType}
            style={{ width: '100%' }}
            placeholder="请选择异常数据"
            allowClear
            onChange={onChangeViolationType}>
            <Select.Option value="1">无牌无证或证照不全车辆</Select.Option>
            <Select.Option value="2">超限超载车辆</Select.Option>
            <Select.Option value="3">非法改装车辆</Select.Option>
          </Select>
        </Search.Item>
        <Search.Item label="发货企业">
          <Input value={query.fromCompany} placeholder="请输入发货企业" allowClear onChange={handleChangeFromCompany} />
        </Search.Item>
        <Search.Item label="收货企业">
          <Input value={query.toCompany} placeholder="请输入收货企业" allowClear onChange={handleChangeToCompany} />
        </Search.Item>
      </Search>
      <Table
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        rowKey="id"
        style={{ marginTop: 16 }}
        pagination={{
          onChange: onChangePage,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
        scroll={{ x: 'auto' }}
      />
    </>
  );
};

export default Register;
