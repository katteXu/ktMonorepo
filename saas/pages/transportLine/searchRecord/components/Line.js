import { useState, useCallback, useEffect } from 'react';
import { Search } from '@components';
import { Input, DatePicker, message, Table, Button } from 'antd';
import moment from 'moment';
import { getTruckQueryRecordList } from '@api';
import router from 'next/router';
import { keepState, getState, clearState } from '@utils/common';
const Line = props => {
  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 120,
    },
    {
      title: '查询时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: '查询时间段',
      dataIndex: 'dateRange',
      key: 'dateRange',
      width: 120,
      render: (value, record) => {
        return `${record.beginTime}-${record.endTime}`;
      },
    },
    {
      title: '初始位置',
      dataIndex: 'beginAddress',
      key: 'beginAddress',
      width: 120,
      render: value => {
        return value || '--';
      },
    },
    {
      title: '终止位置',
      dataIndex: 'endAddress',
      key: 'endAddress',
      width: 120,
      render: value => {
        return value || '--';
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      align: 'right',
      width: 120,
      render: (value, record) => {
        const { id, trailerPlateNumber, createdAt, beginTime, endTime, beginAddress, endAddress } = record;
        return (
          <Button
            type="link"
            size="small"
            onClick={() =>
              router.push(
                `/transportLine/searchRecord/detail?id=${id}&trailerPlateNumber=${trailerPlateNumber}&createdAt=${createdAt}&dateRange=${`${beginTime} 至 ${endTime}`}&beginAddress=${beginAddress}&endAddress=${endAddress}`
              )
            }>
            详情
          </Button>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [query, setQuery] = useState({
    pageSize: 10,
    page: 1,
    plateNum: undefined,
    begin: undefined,
    end: undefined,
  });

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery(state);
    getDataList(state);
  }, []);

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery({ ...query, begin, end });
  });

  // 车牌输入
  const handleChangePlate = e => {
    const plateNum = e.target.value;
    setQuery({ ...query, plateNum });
  };

  // 搜索
  const handleSearch = () => {
    // if (!validatePlateNum()) {
    //   message.error('请输入有效的车牌号');
    //   return;
    // }

    // if (!validateDate()) {
    //   message.error('请输入有效的时间范围');
    //   return;
    // }
    const params = { ...query, page: 1 };
    setQuery(params);
    getDataList(params);
  };

  // 重置
  const handleReset = useCallback(() => {
    const params = {
      ...query,
    };
    setQuery(params);
    getDataList(query);
  }, []);

  // 验证车牌号
  const validatePlateNum = () => {
    const { plateNum } = query;
    const _testPlateNum = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Za-z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    if (_testPlateNum.test(plateNum)) {
      return true;
    }
    return false;
  };

  const validateDate = () => {
    const { begin, end } = query;
    if (begin && end) {
      const _begin = moment(begin);
      const _end = moment(end) > moment() ? moment() : moment(end);
      const result = _end.diff(_begin, 'hour');
      if (result < 24) {
        return true;
      }
    }
    return false;
  };

  // 分页
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

  // 查询接口
  const getDataList = async query => {
    setLoading(true);
    const params = {
      trailerPlateNumber: query.plateNum,
      begin: query.begin,
      end: query.end,
      page: query.page,
      limit: query.pageSize,
    };
    const res = await getTruckQueryRecordList({ params });
    if (res.status === 0) {
      setDataList(res.result);

      // 持久化状态
      keepState({
        query,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setLoading(false);
  };

  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} simple>
        <Search.Item label="车牌号">
          <Input allowClear placeholder="请输入车牌号" value={query.plateNum} onChange={handleChangePlate}></Input>
        </Search.Item>
        <Search.Item label="查询时间">
          <DatePicker.RangePicker
            allowClear
            style={{ width: 400 }}
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            format="YYYY-MM-DD HH:mm:ss"
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            placeholder={['开始时间', '结束时间']}
            onChange={handleChangeDate}
          />
        </Search.Item>
      </Search>
      <Table
        style={{ marginTop: 24 }}
        columns={columns}
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

export default Line;
