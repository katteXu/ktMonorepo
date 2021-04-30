import { useState, useEffect, useCallback } from 'react';
import { Table, DatePicker, message } from 'antd';
import { Search } from '@components';
import moment from 'moment';
import { vehicleRegister, downLoadFile } from '@api';
import { getState, clearState } from '@utils/common';
import router from 'next/router';
import styles from './styles.less';
const { MonthPicker } = DatePicker;

//获取当前月份
const getCurrenyTime = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  let mydate = year + '-' + month;
  return mydate;
};

const Month = props => {
  const columns = [
    {
      title: '时间',
      children: [
        {
          title: <span style={{ display: 'table', margin: '0 auto' }}>月</span>,
          dataIndex: 'month',
          key: 'month',
          width: 50,
        },
        {
          title: <span style={{ display: 'table', margin: '0 auto' }}>日</span>,
          dataIndex: 'day',
          key: 'day',
          width: 50,
        },
      ],
    },
    {
      title: '检查车辆总数(辆)',
      dataIndex: 'totalTrucks',
      key: 'totalTrucks',
      width: 150,
      align: 'right',
    },
    {
      title: '符合标准装载出厂车辆(辆)',
      dataIndex: 'standardTrucks',
      key: 'standardTrucks',
      width: 150,
      align: 'right',
    },
    {
      title: '装载出厂货物总量(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 150,
      align: 'right',
      render: (text, data, index) => {
        return <span>{(data.totalWeight / 1000).toFixed(2)}</span>;
      },
    },
    {
      title: '发现无牌无证或证照不全车辆(辆)',
      dataIndex: 'nonstandardTrucks',
      key: 'nonstandardTrucks',
      width: 200,
      align: 'right',
      render: (text, data, index) => {
        const date = `${query.filter}-${data.day}`;
        return (
          <div
            onClick={() => {
              sessionStorage.setItem('defaultNum', '1');
              text > 0 ? router.push(`/poundManagement/register?date=${date}&violationType=1`) : '';
            }}>
            <span style={{ textDecoration: text > 0 ? 'underline' : '' }}>{text}</span>
          </div>
        );
      },
    },
    {
      title: '发现超限超载车辆(辆)',
      dataIndex: 'overloadTrucks',
      key: 'overloadTrucks',
      width: 200,
      align: 'right',
      render: (text, data, index) => {
        const date = `${query.filter}-${data.day}`;
        return (
          <div
            onClick={() => {
              sessionStorage.setItem('defaultNum', '1');
              router.push(`/poundManagement/poundReport?tab=register&date=${date}&violationType=2`);
            }}>
            <span style={{ textDecoration: text > 0 ? 'underline' : '' }}>{text}</span>
          </div>
        );
      },
    },
    {
      title: '发现非法改装车辆(辆)',
      dataIndex: 'illegalTrucks',
      key: 'illegalTrucks',
      width: 200,
      align: 'right',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 100,
      align: 'right',
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    filter: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery({ filter: query.filter ? query.filter : getCurrenyTime(), ...state });
    getDataList(state);
  }, []);

  const getDataList = async ({ pageSize, page, filter, dateString }) => {
    let userId = localStorage.getItem('userId');
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      ownerId: userId,
    };

    if (dateString === '' || dateString === undefined) {
      params.filter = getCurrenyTime() + '-01';
    } else {
      params.filter = dateString + '-01';
    }
    const res = await vehicleRegister.new_get_poundbill_month_report({ params });
    if (res.status === 0) {
      setLoading(false);
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
      setLoading(false);
    }
  };

  //当前月份之后的月份不可选
  const disabledDate = current => {
    return current && current.valueOf() > Date.now();
  };

  // 切换最大页数
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  // 翻页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getDataList({ ...query, page });
    },
    [dataList]
  );

  const exportDump = useCallback(async () => {
    let userId = localStorage.getItem('userId');
    setExportLoading(true);
    let params = {
      dump: true,
      ownerId: userId,
      type: 'out',
    };
    if (dateString === '' || dateString === undefined) {
      params.filter = getCurrenyTime() + '-01';
    } else {
      params.filter = query.filter + '-01';
    }
    const res = await vehicleRegister.new_get_poundbill_month_report({ params });
    if (res.status === 0) {
      await downLoadFile(res.result, '车辆装载逐日统计月报表');
    }
    setExportLoading(false);
  }, [dataList]);

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      filter: undefined,
      page: 1,
      pageSize: 10,
    };
    setDateString('');
    setQuery(query);
    getDataList(query);
  }, []);

  // 修改月份
  const onChangeMonthPicker = useCallback((date, dateString) => {
    console.log(dateString);
    const filter = dateString && moment(dateString);
    setDateString(dateString);
    setQuery(() => ({ ...query, filter: dateString, dateString }));
  });

  return (
    <>
      <Search onSearch={handleSearch} onReset={resetFilter} onExport={exportDump} exportLoading={exportLoading}>
        <Search.Item label="选择月份">
          <MonthPicker
            allowClear={false}
            style={{ width: 376 }}
            value={query.filter ? moment(query.filter) : moment(getCurrenyTime())}
            defaultValue={moment(getCurrenyTime())}
            placeholder="请选择"
            disabledDate={disabledDate}
            onChange={onChangeMonthPicker}
          />
        </Search.Item>
      </Search>
      <div className={styles.rootTable}>
        <Table
          loading={loading}
          dataSource={dataList.data}
          columns={columns}
          style={{ marginTop: 16 }}
          rowKey="day"
          scroll={{ x: 'auto' }}
          pagination={{
            onChange: onChangePage,
            onShowSizeChange: onChangePageSize,
            pageSize: query.pageSize,
            current: query.page,
            total: dataList.count,
          }}
        />
      </div>
    </>
  );
};

export default Month;
