/** @format */

import { useState, useEffect, useCallback } from 'react';
import Layout from '@components/Layout';
import { Button, Table, message, Input, Tooltip, Select, Popconfirm } from 'antd';
import { Content, Search, Status } from '@components';
import { customer } from '@api';
import router from 'next/router';
import { QuestionCircleFilled } from '@ant-design/icons';
import { keepState, getState, clearState } from '@utils/common';

const { Option } = Select;

const Company = props => {
  const routeView = {
    title: '客户管理',
    pageKey: 'company',
    longKey: 'customerManagement.company',
    breadNav: '我的客户.客户管理',
    pageTitle: '客户管理',
  };

  const columns = [
    {
      title: '客户名称',
      dataIndex: 'companyName',
      key: 'companyName',
      width: '25%',
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 200 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'customerType',
      key: 'customerType',
      width: '10%',
      render: value => {
        return <span>{Status.customerTypeText[value] || '-'}</span>;
      },
    },
    {
      title: '属性',
      dataIndex: 'attribute',
      key: 'attribute',
      width: '10%',
      render: value => {
        return <span>{Status.customerAttributeText[value] || '-'}</span>;
      },
    },
    {
      title: '标签',
      dataIndex: 'tag',
      key: 'tag',
      width: '20%',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '联系人',
      dataIndex: 'companyContactName',
      key: 'companyContactName',
      width: '20%',
      render: value => {
        return value || '-';
      },
    },

    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      fixed: 'right',
      align: 'right',
      width: 60,
      render: (value, record) => {
        return (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                router.push(`/customerManagement/company/customerDetail?id=${value}`);
              }}>
              详情
            </Button>
            <Popconfirm
              title={
                <div>
                  <span>是否删除当前客户？</span>
                </div>
              }
              placement="topRight"
              icon={<QuestionCircleFilled />}
              onConfirm={() => delData(value)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [id, setId] = useState('');
  const [showUpdate, setShowUpdate] = useState(false);
  const [editData, setEditData] = useState('');
  const [errorText, setErrorText] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    companyName: '',
    customerType: undefined,
    attribute: '',
    begin: undefined,
    end: undefined,
    tag: '',
    companyContactName: '',
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

  // 绑定数据
  const getDataList = async ({
    page,
    pageSize,
    companyName,
    customerType,
    attribute,
    begin,
    end,
    tag,
    companyContactName,
  }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      companyName,
      companyContactName,
      customerType: customerType || undefined,
      attribute: attribute || undefined,
      tag,
      begin,
      end,
    };
    const res = await customer.customer_list({ params });

    if (res.status === 0) {
      setDataList(res.result);
      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          companyName,
          customerType,
          attribute,
          begin,
          end,
          tag,
          companyContactName,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 删除确认
  const delData = async id => {
    const params = {
      customer_id: id,
    };
    const res = await customer.del_customer({ params });
    if (res.status === 0) {
      message.success('客户删除成功');
      // 删除最后一条
      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }

      setQuery({ ...query, page });
      getDataList({ ...query, page });
    } else {
      message.error(`客户删除失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 新建企业
  const newData = () => {
    router.push('/customerManagement/company/addCustomer');
  };

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

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      companyName: '',
      customerType: undefined,
      attribute: undefined,
      begin: undefined,
      end: undefined,
      tag: '',
      companyContactName: '',
    };
    setQuery(query);
    getDataList(query);
  }, []);

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 企业名称
  const handleChangeCompanyName = useCallback(e => {
    const companyName = e.target.value;
    setQuery(() => ({ ...query, companyName }));
  });

  // 企业联系人
  const handleChangeCompanyContact = useCallback(e => {
    const companyContactName = e.target.value;
    setQuery(() => ({ ...query, companyContactName }));
  });

  const handleChangeType = useCallback(value => {
    const customerType = value;
    setQuery(() => ({ ...query, customerType }));
  });

  const handleChangeAttribute = useCallback(value => {
    const attribute = value;
    setQuery(() => ({ ...query, attribute }));
  });
  const handleChangeLabel = useCallback(value => {
    const tag = value.target.value;
    setQuery(() => ({ ...query, tag }));
  });

  // 导出
  const handleExport = useCallback(async () => {
    if (dataList && dataList.data && dataList.data.length > 0) {
      setBtnLoading(true);
      const { customerType, attribute, companyName, tag, begin, end } = query;
      const params = {
        customerType: customerType || undefined,
        attribute: attribute || undefined,
        companyName,
        tag,
        dump: true,
        companyContactName,
        begin: begin || undefined,
        end: end || undefined,
      };

      const res = await pound.getPoundBillMonthList({ params });
      if (res.status === 0) {
        await downLoadFile(res.result, '发货磅单月报表');
      }

      setBtnLoading(false);
    } else {
      message.warning('数据导出失败，原因：没有数据可以导出');
    }
  }, [dataList]);

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Button style={{ marginBottom: 16 }} type="primary" onClick={newData}>
            新增客户
          </Button>
          <Search onSearch={handleSearch} onReset={resetFilter}>
            <Search.Item label="客户名称">
              <Input
                value={query.companyName}
                placeholder="请输入客户名称"
                allowClear
                onChange={handleChangeCompanyName}
              />
            </Search.Item>
            <Search.Item label="类型">
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="请选择类型"
                value={query.customerType}
                allowClear
                onChange={handleChangeType}>
                {Status.customerType.map((item, key) => {
                  return <Option value={item.value}>{item.name}</Option>;
                })}
              </Select>
            </Search.Item>
            <Search.Item label="属性">
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="请选择属性"
                value={query.attribute}
                allowClear
                onChange={handleChangeAttribute}>
                {Status.customerAttribute.map((item, key) => {
                  return <Option value={item.value}>{item.name}</Option>;
                })}
              </Select>
            </Search.Item>
            <Search.Item label="标签">
              <Input value={query.tag} placeholder="请输入标签" onChange={handleChangeLabel} />
            </Search.Item>
            <Search.Item label="联系人">
              <Input
                value={query.companyContactName}
                placeholder="请输入联系人"
                allowClear
                onChange={handleChangeCompanyContact}
              />
            </Search.Item>
          </Search>
        </section>
        {/* <Button onClick={handleExport} style={{ marginLeft: 8 }} loading={btnLoading}>
              导出
            </Button> */}
        <section style={{ paddingTop: 0 }}>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey="id"
            pagination={{
              onChange: onChangePage,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
          />
        </section>
      </Content>
    </Layout>
  );
};

export default Company;
