import { useState, useCallback, useEffect } from 'react';
import { Layout, Search, Content, Ellipsis } from '@components';
import { Input, Button, Select, Table, Popconfirm, message } from 'antd';
import { station } from '@api';
import { useRouter } from 'next/router';
import { Format } from '@utils/common';
import { QuestionCircleFilled } from '@ant-design/icons';
import PoundBox from '@components/StationManagement/poundBox';

const Index = () => {
  const routeView = {
    title: '站内管理',
    pageKey: 'stationManagement',
    longKey: 'stationManagement',
    breadNav: '站内管理',
    pageTitle: '站内管理',
  };

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'plateNum',
      key: 'plateNum',
      width: 150,
    },
    {
      title: '姓名',
      dataIndex: 'driverName',
      key: 'driverName',
      width: 150,
    },
    {
      title: '手机号',
      dataIndex: 'driverPhone',
      key: 'driverPhone',
      width: 150,
    },
    {
      title: '过磅类型',
      dataIndex: 'receiveOrSend',
      key: 'receiveOrSend',
      width: 150,
      render: value => (value ? '收货' : '发货'),
    },
    {
      title: '发货企业',
      dataIndex: ['weigh', 'route'],
      key: 'fromCompany',
      width: 150,
      render: value => {
        const { fromAddress } = value;
        return <Ellipsis value={fromAddress.companyName} width={130} />;
      },
    },
    {
      title: '收货企业',
      dataIndex: ['weigh', 'route'],
      key: 'toCompany',
      width: 150,
      render: value => {
        const { toAddress } = value;
        return <Ellipsis value={toAddress.companyName} width={130} />;
      },
    },
    {
      title: '货品名称',
      dataIndex: ['weigh', 'route'],
      key: 'goodsName',
      width: 150,
      render: value => {
        const { goodsType } = value;
        return goodsType;
      },
    },
    {
      title: '进站时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '进站重量(吨)',
      dataIndex: ['weigh', 'weight'],
      align: 'right',
      key: 'weight',
      width: 150,
      render: Format.weight,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record, index) => {
        return (
          <>
            <Button size="small" type="link" key="ctrl" onClick={() => handleOut(record)}>
              出站
            </Button>
            <Popconfirm
              title={
                <div>
                  <span>是否删除当前在站车辆？</span>
                </div>
              }
              placement="topRight"
              icon={<QuestionCircleFilled />}
              onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    getRemoteData(query);
    poundMachine_list();
  }, []);

  const router = useRouter();
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    filter: '',
  });
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [poundMachineList, setPoundMachineList] = useState([]);

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
      filter: '',
    };
    setQuery(query);
    getRemoteData(query);
  }, []);

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

  // 发货进站
  const handleInByFrom = () => {
    router.push('/stationManagement/inStationByFrom');
  };

  // 收货进站
  const handleInByTo = () => {
    router.push('/stationManagement/inStationByTo');
  };

  //发货出站||收货出站
  const handleOut = data => {
    if (data.receiveOrSend) router.push('/stationManagement/outStationByTo?id=' + data.id);
    else router.push('/stationManagement/outStationByFrom?id=' + data.id);
  };

  const handleChangeQuery = e => {
    const filter = e.target.value;
    setQuery({ ...query, filter });
  };
  //获取磅机列表
  const poundMachine_list = async () => {
    const res = await station.pound_machine_list();
    if (res.status === 0) {
      setPoundMachineList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 删除车辆
  const handleDelete = async ({ id }) => {
    const params = { id };
    const res = await station.deleteStationTruck({ params });

    if (res.status === 0) {
      message.success('删除车辆成功');

      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }

      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const getRemoteData = async ({ page, pageSize, filter }) => {
    const params = {
      page,
      limit: pageSize,
      plateNum: filter,
    };
    setLoading(true);
    const res = await station.getStationList({ params });
    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 磅机重量变更
  const handleChangeWeight = weight => {};

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <PoundBox onChange={handleChangeWeight} style={{ marginLeft: 10 }} showWeight />
          <div style={{ marginBottom: 16, marginTop: 16 }}>
            <Button.Group>
              <Button type="primary" onClick={handleInByFrom}>
                发货
              </Button>
              <Button type="primary" onClick={handleInByTo} style={{ marginLeft: 8 }}>
                收货
              </Button>
            </Button.Group>
          </div>

          <Search style={{ marginTop: 16 }} onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="筛选">
              <Input placeholder="车牌号/姓名/手机号" onChange={handleChangeQuery} allowClear value={query.filter} />
            </Search.Item>
          </Search>
        </section>
        <section style={{ paddingTop: 0 }}>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </Layout>
  );
};
export default Index;
