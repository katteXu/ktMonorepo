import React, { useState, useEffect, useCallback } from 'react';
import { Input, Table, DatePicker, message, Select, Modal } from 'antd';
import moment from 'moment';
import router from 'next/router';
import { Content, Search } from '@components';
import { keepState, getState, clearState } from '@utils/common';
import { Steps } from 'antd';
import { pound } from '@api';
const { Step } = Steps;
const Option = Select.Option;
const { RangePicker } = DatePicker;

const LicenseRecord = props => {
  //查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    trailerPlateNumber: undefined,
    enterBegin: undefined,
    enterEnd: undefined,
    leaveBegin: undefined,
    leaveEnd: undefined,
    status: undefined,
  });
  const [dataList, setDataList] = useState({});
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '进厂识别时间',
      dataIndex: 'enterFactoryScreenTime',
      key: 'enterFactoryScreenTime',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '进厂识别次数',
      dataIndex: 'enterFactoryScreenNum',
      key: 'enterFactoryScreenNum',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '出厂识别时间',
      dataIndex: 'leaveFactoryScreenTime',
      key: 'leaveFactoryScreenTime',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '出厂识别次数',
      dataIndex: 'leaveFactoryScreenNum',
      key: 'leaveFactoryScreenNum',
      width: 200,
      render: (text, data) => {
        return (
          <div
            onClick={async () => {
              if (text >= 2) {
                const id = data.id;
                let a = await getScreenTime({ recordId: id });
                console.log(a);
                info(a);
              }
            }}>
            <span style={text >= 2 ? { color: '#3D86EF' } : { color: 'black' }}>{text || '-'}</span>
          </div>
        );
      },
    },
    {
      title: '是否有过磅单',
      dataIndex: 'poundBillId',
      key: 'poundBillId',
      width: 200,
      render: value => {
        if (value) {
          return '有';
        } else if (value == null) {
          return '无';
        } else {
          return '-';
        }
      },
    },
    {
      title: '状态',
      dataIndex: 'statusZn',
      key: 'statusZn',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '值班司磅员',
      dataIndex: 'sendGoodsMan',
      key: 'sendGoodsMan',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      align: 'right',
      width: 200,
      fixed: 'right',
      render: (text, data) => {
        return (
          <div
            onClick={() => {
              if (data.poundBillId) {
                router.push(`/virtualDetail?id=${data.poundBillId}`);
              }
            }}>
            <span style={data.poundBillId ? { color: '#3D86EF' } : { color: 'black' }}>
              {data.poundBillId ? '查看详情' : '-'}
            </span>
          </div>
        );
      },
    },
  ];
  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    getDataList(state);
  }, []);

  const getScreenTime = async ({ recordId }) => {
    const params = {
      recordId,
    };
    const res = await pound.leaveScreenLog({ params });
    if (res.status === 0) {
      return res.result.data;
    }
  };

  const getDataList = async ({
    pageSize,
    page,
    enterBegin,
    enterEnd,
    leaveBegin,
    leaveEnd,
    trailerPlateNumber,
    status,
  }) => {
    setLoading(true);
    const { userId } = localStorage;
    const params = {
      trailerPlateNumber: trailerPlateNumber || '',
      enterBegin: enterBegin || undefined,
      enterEnd: enterEnd || undefined,
      leaveBegin: leaveBegin || undefined,
      leaveEnd: leaveEnd || undefined,
      status: undefined || status,
      limit: pageSize,
      page,
      ownerId: userId,
    };
    const res = await pound.carScreenRecord({ params });
    if (res.status === 0) {
      setLoading(false);
      setDataList(res.result);
      keepState({
        query: {
          page,
          pageSize,
          trailerPlateNumber,
          enterBegin,
          enterEnd,
          leaveBegin,
          leaveEnd,
          status,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
      setLoading(false);
    }
  };

  // 翻页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getDataList({ ...query, page });
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

  // 进厂时间
  const handleEnterTime = useCallback(value => {
    const enterBegin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const enterEnd = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    console.log(query.enterBegin && query.enterEnd ? [moment(query.begin), moment(query.end)] : null);
    setQuery(() => ({ ...query, enterBegin, enterEnd }));
  });
  // 出厂时间
  const handleLeaveTime = useCallback(value => {
    const leaveBegin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const leaveEnd = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, leaveBegin, leaveEnd }));
  });

  // 车牌号
  const handleChangeTrailerPlateNumber = useCallback(e => {
    const trailerPlateNumber = e.target.value;
    setQuery(() => ({ ...query, trailerPlateNumber }));
  });

  // 状态
  const onChangeRecordState = useCallback(value => {
    const status = value && value;
    setQuery(() => ({ ...query, status }));
  });

  //  查询
  const handleSearch = useCallback(() => {
    console.log(query);
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      trailerPlateNumber: '',
      enterBegin: undefined,
      enterEnd: undefined,
      leaveBegin: undefined,
      leaveEnd: undefined,
      status: undefined,
    };
    setQuery(query);
    getDataList(query);
  }, []);

  //模态框
  function info(a) {
    Modal.info({
      title: '出厂识别记录',
      content: (
        <div>
          <Steps progressDot current={a.length} direction="vertical">
            {a.map((item, index) => {
              console.log(item);
              return <Step title={`第${index + 1}次`} description={item.screenTime} />;
            })}
          </Steps>
        </div>
      ),
      onOk() {},
    });
  }
  return (
    <>
      <Content>
        <section style={{ minHeight: 620 }}>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="进厂时间" br>
              <RangePicker
                style={{ width: 376 }}
                value={query.enterBegin && query.enterEnd ? [moment(query.enterBegin), moment(query.enterEnd)] : null}
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={handleEnterTime}></RangePicker>
            </Search.Item>
            <Search.Item label="出厂时间" br>
              <RangePicker
                style={{ width: 376 }}
                value={query.leaveBegin && query.leaveEnd ? [moment(query.leaveBegin), moment(query.leaveEnd)] : null}
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={handleLeaveTime}></RangePicker>
            </Search.Item>
            <Search.Item label="车牌号">
              <Input
                allowClear
                placeholder="请输入车牌号"
                onChange={handleChangeTrailerPlateNumber}
                value={query.trailerPlateNumber}
              />
            </Search.Item>
            <Search.Item label="状态">
              <Select
                value={query.status}
                placeholder="请选择"
                style={{ width: '100%' }}
                onChange={onChangeRecordState}>
                <Option value={0}>正常</Option>
                <Option value={1}>异常</Option>
              </Select>
            </Search.Item>
          </Search>
          <div style={{ marginTop: 16 }}>
            <Table
              loading={loading}
              dataSource={dataList.data}
              columns={columns}
              pagination={{
                onChange: onChangePage,
                onShowSizeChange: onChangePageSize,
                pageSize: query.pageSize,
                current: query.page,
                total: dataList.count,
              }}
              scroll={{ x: 'auto' }}
            />
          </div>
        </section>
      </Content>
    </>
  );
};

export default LicenseRecord;
