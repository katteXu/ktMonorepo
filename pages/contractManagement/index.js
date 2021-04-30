import React, { useState, useEffect, useCallback } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Input, Button, DatePicker, Table, Popconfirm, message, Tooltip, Progress } from 'antd';
import { Content, Search, Layout, Ellipsis } from '@components';
import { contract } from '@api';
import router from 'next/router';
import moment from 'moment';
import { Format, keepState, getState, clearState } from '@utils/common';
import deleteBtn from './deleteBtn.less';
import { Permission } from '@store';

// 合同状态
const contractStatus = {
  1: { name: '未开始', color: '' },
  2: { name: '执行中', color: '#FFB741' },
  3: { name: '已完成', color: '#3D86EF' },
  4: { name: '已超时', color: '#E44040' },
};

// 状态颜色样式
const status_icon_styles = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: 3,
  margin: '0 4px 2px 0',
};

const Index = props => {
  const { permissions, isSuperUser } = Permission.useContainer();
  const routeView = {
    title: '合同列表',
    pageKey: 'contractManagement',
    longKey: 'contractManagement',
    breadNav: '合同管理.合同列表',
    pageTitle: '合同列表',
  };
  const columns = [
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '合同名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '签订对象',
      dataIndex: 'partner_name',
      key: 'partner_name',
      width: 200,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '合同状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: value => {
        return (
          <span>
            <i
              style={{
                ...status_icon_styles,
                background: contractStatus[value].color,
              }}
            />
            {contractStatus[value].name}
          </span>
        );
      },
    },
    {
      title: '业务执行情况',
      dataIndex: 'percent',
      key: 'percent',
      width: 150,
      render: (value, record, index) => {
        const text = (
          <div>
            <div>完成进度：{value}%</div>
            <div>已运输：{Format.weight(record.realCount)}吨</div>
          </div>
        );
        return (
          <Tooltip placement="top" title={text}>
            <Progress
              percent={value}
              showInfo={false}
              status="normal"
              strokeColor={record.status && contractStatus[record.status].color}
            />
          </Tooltip>
        );
      },
    },
    {
      title: '负责人',
      dataIndex: 'principal',
      key: 'principal',
      width: 100,
    },
    {
      title: '货物总量(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 150,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '合同金额(元)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      align: 'right',
      render: Format.price,
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: '120px',
      fixed: 'right',
      align: 'right',
      render: (value, record, index) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/contractManagement/contractDetail?id=${value}`)}>
            详情
          </Button>
          {(isSuperUser || permissions.includes('CONTRACT_MANAGEMENT_OPERATE')) && (
            <Popconfirm
              title={
                <div>
                  <span>是否删除当前合同？</span>
                </div>
              }
              placement="topRight"
              icon={<QuestionCircleFilled />}
              onConfirm={() => deleteData(record.id)}>
              <Button danger type="link" size="small" className={deleteBtn.delete}>
                删除
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    customerId: '',
    attribute: '',
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

  // 翻页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getDataList({ ...query, page });
    },
    [dataList]
  );

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      customerId: '',
      attribute: '',
      begin: undefined,
      end: undefined,
    };
    setQuery(query);
    getDataList(query);
  }, []);

  const getDataList = async ({ page, pageSize, customer_name, principal, begin, end }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      start_time: begin || undefined,
      end_time: end || undefined,
      customer_name,
      principal,
    };

    const res = await contract.contract_list({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setLoading(false);
    } else {
      message.error(`${res.detail || res.description}`);
    }

    keepState({
      query: {
        page,
        pageSize,
        customer_name,
        principal,
        begin,
        end,
      },
    });
  };

  // 切换最大页数
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 签订对象
  const handleChangeSigned = useCallback(e => {
    const customer_name = e.target.value;
    setQuery(() => ({ ...query, customer_name }));
  });

  // 负责人
  const handleChangehead = useCallback(e => {
    const principal = e.target.value;
    setQuery(() => ({ ...query, principal }));
  });
  //合同状态
  const handleChangeStatus = useCallback(() => {
    const status = e.target.value;
    setQuery(() => ({ ...query, status }));
  });

  // 时间输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 删除行
  const deleteData = async id => {
    const params = {
      contract_id: id,
    };
    const res = await contract.del_contract({ params });
    if (res.status === 0) {
      message.success('合同删除成功');
      // 删除最后一条
      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }

      setQuery({ ...query, page });
      getDataList({ ...query, page });
    } else {
      message.error(`合同删除失败，原因：${res.detail || res.description}`);
    }
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Button
            type="primary"
            style={{ marginBottom: 16 }}
            onClick={() => router.push('/contractManagement/addContract')}>
            新增合同
          </Button>
          <Search onSearch={handleSearch} onReset={resetFilter}>
            <Search.Item label="创建时间" br>
              <DatePicker.RangePicker
                value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: 376 }}
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={handleChangeDate}></DatePicker.RangePicker>
            </Search.Item>
            <Search.Item label="签订对象">
              <Input
                value={query.customer_name}
                placeholder="请输入签订对象"
                allowClear
                onChange={handleChangeSigned}
              />
            </Search.Item>
            {/* <Search.Item label="合同状态">
          <Select
            value={query.status}
            allowClear
            style={{ width: '100%' }}
            placeholder="请选择合同状态"
            onChange={handleChangeStatus}>
            <Select.Option value="PENDING_APPROVAL">未开始</Select.Option>
            <Select.Option value="INUSE">执行中</Select.Option>
            <Select.Option value="FINISH">已完成</Select.Option>
            <Select.Option value="OVERDUE">已过期</Select.Option>
          </Select>
        </Search.Item> */}
            <Search.Item label="负责人">
              <Input value={query.principal} placeholder="请输入负责人" allowClear onChange={handleChangehead} />
            </Search.Item>
          </Search>
        </section>
        {/* <header>
          合同列表
          {(props.menu.isSuperUser || props.menu.permissions.includes('CONTRACT_MANAGEMENT_OPERATE')) && (
            <Button
              type="primary"
              style={{ float: 'right' }}
              onClick={() => router.push('/contractManagement/addContract')}>
              新增
            </Button>
          )}
        </header> */}
        <section style={{ paddingTop: 0 }}>
          <Table
            loading={loading}
            size="middle"
            dataSource={dataList.data}
            columns={columns}
            rowKey="id"
            scroll={{ x: 'aotu' }}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}></Table>
        </section>
      </Content>
    </Layout>
  );
};
export default Index;
