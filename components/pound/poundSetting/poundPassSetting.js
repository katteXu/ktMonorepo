import { useState, useEffect, useCallback } from 'react';
import { ChildTitle, Ellipsis, DrawerInfo } from '@components';
import { Button, Table, Modal, Popconfirm, Tooltip, message, Tabs } from 'antd';
import { pound } from '@api';
import { Format } from '@utils/common';
import { PoundRulesFrom, AllToPoundRulesFrom, AllFromPoundRulesFrom } from '@components/pound';
import { QuestionCircleFilled } from '@ant-design/icons';
import deleteBtn from '../deleteBtn.less';

const { TabPane } = Tabs;
const PoundManagement = props => {
  const routeView = {
    title: '过磅管理',
    pageKey: 'poundPass',
    longKey: 'poundPass',
    breadNav: '过磅管理.',
    pageTitle: '过磅管理',
  };

  const columns = [
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 150,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 150,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 120,
      render: value => <Ellipsis value={value} width={100} />,
    },
    {
      title: '过磅场景',
      dataIndex: 'receiveOrSend',
      key: 'receiveOrSend',
      width: 120,
      render: value => <span>{value ? '收货' : '发货'}</span>,
    },
    {
      title: '取重规则',
      dataIndex: 'plusOrReduce',
      key: 'plusOrReduce',
      width: 120,
      render: value => <span>{value ? '增加' : '减扣'}</span>,
    },
    {
      title: '重量(吨)',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损最小值(吨)',
      dataIndex: 'abateThreshold',
      key: 'abateThreshold',
      width: 100,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      fixed: 'right',
      align: 'right',
      render: (value, record, index) => (
        <div>
          <Button
            size="small"
            type="link"
            key="detail"
            onClick={() => {
              setType('edit');
              setVisible(true);
              setFormData({ ...record });
            }}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此条磅差取重规则吗？"
            placement="topRight"
            icon={<QuestionCircleFilled />}
            onConfirm={() => deletePound(record)}>
            <Button size="small" type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState('');
  const [formData, setFormData] = useState({});
  const [fromFormData, setFromFormData] = useState({});
  const [toFormData, setToFormData] = useState({});
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    getData(query);
    getPoundRules();
  }, []);

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getData({ ...query, page, pageSize });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getData({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  //删除
  const deletePound = async data => {
    const params = {
      recordId: data.id,
    };
    const { status, result, detail, description } = await pound.delPoundWeightDiff(params);
    if (!status) {
      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }
      setQuery({ ...query, page });
      getData({ ...query, page: 1 });
    } else {
      message.error(detail || description);
    }
  };

  const getData = async ({ page, pageSize }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
    };
    const { status, result, detail, description } = await pound.getPoundWeightDiffList({ params });
    if (!status) {
      setDataList(result);
    } else {
      message.error(detail || description);
    }
    setLoading(false);
  };
  //新增
  const addPoundRules = async (values, routeId) => {
    const params = {
      ...values,
      routeId,
      amount: values.amount ? values.amount * 1000 : undefined,
      abateMethod: values.abateMethod ? 1 : 0,
      abateThreshold: values.abateThreshold * 1000 || 0,
    };
    const { status, result, detail, description } = await pound.setPoundWeightDiff(params);
    if (!status) {
      setQuery({ ...query, page: 1 });
      getData({ ...query, page: 1 });
      setVisible(false);
    } else {
      message.error(detail || description);
    }
  };
  //修改
  const editPoundRules = async (values, routeId) => {
    const params = {
      recordId: formData.id,
      ...values,
      routeId,
      amount: values.amount ? values.amount * 1000 : undefined,
      abateMethod: values.abateMethod ? 1 : 0,
      abateThreshold: values.abateThreshold * 1000 || 0,
    };
    const { status, detail, description } = await pound.modifyPoundWeightDiff(params);
    if (!status) {
      setQuery({ ...query, page: 1 });
      getData({ ...query, page: 1 });
      setVisible(false);
    } else {
      message.error(detail || description);
    }
  };

  //获取磅差设置规则
  const getPoundRules = async () => {
    const { status, result, detail, description } = await pound.getGlobalPoundWeightDiff({});
    if (!status) {
      setFromFormData(result.send);
      setToFormData(result.receive);
    } else {
      message.error(detail || description);
    }
  };

  const tabOnchange = e => {
    setActiveTab(e);
    getPoundRules();
  };

  return (
    <section style={{ background: 'rgb(240, 242, 245)', padding: 0 }}>
      <div style={{ background: '#fff', padding: 16 }}>
        {/* <header style={{ padding: '0 0 12px', height: 46, borderBottom: 0 }}> */}
        <ChildTitle className="hei14" style={{ marginBottom: 16, fontWeight: '600' }}>
          磅差全局设置
          <Tooltip
            placement="top"
            title="若此处设置全局磅差,则所有未单独设置磅差的专线按此处的逻辑进行减扣/增加,单独设置过的专线以设置的进行扣减/增加">
            <QuestionCircleFilled style={{ color: '#D0D4DB', marginLeft: 12 }} />
          </Tooltip>
        </ChildTitle>

        <Tabs defaultActiveKey="1" type="card" size="small" onChange={tabOnchange}>
          <TabPane tab="全局收货" key="1">
            {activeTab === '1' && <AllToPoundRulesFrom formData={toFormData} />}
          </TabPane>
          <TabPane tab="全局发货" key="2">
            {activeTab === '2' && <AllFromPoundRulesFrom formData={fromFormData} />}
          </TabPane>
        </Tabs>
      </div>
      <div
        style={{
          background: '#fff',
          marginTop: 16,
          padding: '0 16px 16px 16px',
        }}>
        <header style={{ marginLeft: -16, height: 48 }}>
          磅差设置列表
          <Tooltip placement="top" title="可根据专线设置此专线下，车辆过磅取重时扣减/增加的重量">
            <QuestionCircleFilled style={{ color: '#D0D4DB', marginLeft: 12 }} />
          </Tooltip>
        </header>
        <Button
          type="primary"
          onClick={() => {
            setType('add');
            setVisible(true);
          }}
          style={{ margin: '16px 0' }}>
          新增
        </Button>
        <Table
          loading={loading}
          dataSource={dataList.data}
          columns={columns}
          pagination={{
            onChange: onChangePage,
            showSizeChanger: true,
            pageSize: query.pageSize,
            current: query.page,
            total: dataList.count,
          }}
          // scroll={{ x: 'auto' }}
        />
      </div>

      <DrawerInfo
        title={type === 'add' ? '新增过磅规则' : '修改过磅规则'}
        onClose={() => {
          setVisible(false);
          setFormData({});
        }}
        showDrawer={visible}
        width={664}>
        <PoundRulesFrom
          formData={type === 'add' ? {} : formData}
          onSubmit={type === 'add' ? addPoundRules : editPoundRules}
          onClose={() => {
            setVisible(false);
          }}
        />
      </DrawerInfo>
    </section>
  );
};

export default PoundManagement;
