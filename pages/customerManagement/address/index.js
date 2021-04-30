import { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, message, Input, Popconfirm, DatePicker } from 'antd';
import { Content, Search, Layout, Ellipsis } from '@components';
import AddressForm from '@components/CustomerDetail/address/form';
import { customer } from '@api';
import moment from 'moment';
import { QuestionCircleFilled } from '@ant-design/icons';
import { keepState, getState, clearState } from '@utils/common';

const address = props => {
  const routeView = {
    title: '地址管理',
    pageKey: 'address',
    longKey: 'customerManagement.address',
    breadNav: '客户管理.地址管理',
    pageTitle: '地址管理',
  };

  const columns = [
    {
      title: '地址简称',
      dataIndex: 'loadAddressName',
      key: 'loadAddressName',
      width: 150,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '所在地区',
      dataIndex: 'place',
      key: 'place',
      width: 180,
      render: (value, record) => {
        const { province, city, district } = record;
        return <Ellipsis value={`${province}${city}${district}`} width={130} />;
      },
    },
    {
      title: '详细地址',
      dataIndex: 'detailAddress',
      key: 'detailAddress',
      width: 180,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 120,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '联系人电话',
      dataIndex: 'contactMobile',
      key: 'contactMobile',
      width: 150,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      width: 110,
      render: (value, record) => {
        const {
          province,
          loadAddressName,
          contact2Mobile,
          contactMobile,
          contactName,
          contact2Name,
          detailAddress,
          countyCode,
          id,
          city,
          district,
          companyId,
        } = record;
        const editData = {
          province,
          loadAddressName,
          contact2Mobile,
          contactMobile,
          contactName,
          contact2Name,
          detailAddress,
          countyCode,
          city,
          district,
          companyId,
        };
        return (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                setType('edit');
                setVisible(true);
                setEditData({ ...editData }, setId(id));
              }}>
              编辑
            </Button>
            <Popconfirm
              title="是否删除该地址？"
              placement="topRight"
              icon={<QuestionCircleFilled />}
              onConfirm={() => delData(record)}>
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

  const [id, setId] = useState('');
  const [editData, setEditData] = useState('');

  const [visible, setVisible] = useState(false);
  const [type, setType] = useState('');
  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    companyName: '',
    companyContact: '',
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
    getDataList(state);
  }, []);

  // 绑定数据
  const getDataList = async ({ addressName, addressContact, page, pageSize, begin, end }) => {
    console.log(page);
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      addressName,
      addressContact,
      begin,
      end,
    };
    const res = await customer.getCustomerAddressList({ params });

    setDataList(res.result);
    // 持久化状态
    keepState({
      query: {
        addressName,
        addressContact,
        page,
        pageSize,
        begin,
        end,
      },
    });
    setLoading(false);
  };

  // 删除确认
  const delData = async ({ id }) => {
    const params = {
      loadAddressId: id,
    };
    const res = await customer.deleteLoadAddr({ params });
    if (res.status === 0) {
      message.success('地址删除成功');

      // 删除最后一条
      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }
      setQuery({ ...query, page });
      getDataList({ ...query, page });
    } else {
      message.error(`地址删除失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 新建企业
  const newData = () => {
    setType('add');
    setVisible(true);
  };

  // 编辑数据

  // 详情

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
      addressName: '',
      addressContact: '',
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
    };
    setQuery(query);
    getDataList(query);
  }, []);

  // 提交数据
  const submit = useCallback(async params => {
    const res = await customer.createCustomerLoadAddr({ params });
    if (res.status === 0) {
      message.success('地址新增成功');
      setVisible(false);
      setQuery({ ...query, page: 1 });
      getDataList({ ...query, page: 1 });
    } else {
      message.error(`地址新增失败，原因：${res.detail || res.description}`);
    }
  });

  // 修改数据
  const modifySubmit = useCallback(async params => {
    params.loadAddressId = id;
    const res = await customer.modifyCustomerLoadAddress({ params });
    if (res.status === 0) {
      message.success('地址修改成功');
      setVisible(false);
      getDataList({ ...query });
    } else {
      message.error(`地址修改失败，原因：${res.detail || res.description}`);
    }
  });

  // 切换最大页数
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 企业名称
  const handleChangeaddressName = useCallback(e => {
    const addressName = e.target.value;
    setQuery(() => ({ ...query, addressName }));
  });

  // 企业联系人
  const handleChangeaddressContact = useCallback(e => {
    const addressContact = e.target.value;
    setQuery(() => ({ ...query, addressContact }));
  });

  // 时间输入
  const handleChangeDate = useCallback(value => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });
  console.log(editData);
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={newData}>
            新增地址
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
            <Search.Item label="地址简称">
              <Input
                value={query.addressName}
                placeholder="请输入地址简称"
                allowClear
                onChange={handleChangeaddressName}
              />
            </Search.Item>
            <Search.Item label="联系人">
              <Input
                value={query.addressContact}
                placeholder="请输入联系人"
                allowClear
                onChange={handleChangeaddressContact}
              />
            </Search.Item>
          </Search>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            style={{ marginTop: 16 }}
            rowKey="id"
            scroll={{ x: 'auto' }}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
          />
        </section>
      </Content>

      <Modal
        title={type === 'add' ? '新增地址' : '编辑地址'}
        onCancel={() => {
          setVisible(false);
          setEditData({});
        }}
        visible={visible}
        width={640}
        footer={null}
        destroyOnClose>
        <AddressForm
          formData={type === 'add' ? {} : editData}
          onSubmit={type === 'add' ? submit : modifySubmit}
          onClose={() => {
            setVisible(false);
          }}
        />
      </Modal>
    </Layout>
  );
};

export default address;
