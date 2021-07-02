import { useState, useEffect, useCallback } from 'react';
import { Input, Button, Table, Modal, message, DatePicker, Tooltip, Popconfirm } from 'antd';
import { Content, Search } from '@components';
import Layout from '@components/Layout';
import moment from 'moment';
import NewFrom from '@components/MiddleMan/newForm';
import SettingFrom from '@components/MiddleMan/settingForm';
import { getState, clearState } from '@utils/common';
import customer from '@api/customer';
import { QuestionCircleFilled } from '@ant-design/icons';

const MiddleMan = props => {
  const routeView = {
    title: '车队长管理',
    pageKey: 'middleMan',
    longKey: 'customerManagement.company',
    breadNav: '客户管理.车队长管理',
    pageTitle: '车队长管理',
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: ['middleman', 'name'],
      key: 'middleman.name',
      width: '15%',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '账号',
      dataIndex: ['middleman', 'username'],
      key: 'middleman.username',
      width: '15%',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '能否代建专线',
      dataIndex: 'createRoute',
      key: 'createRoute',
      width: '15%',
      render: value => {
        return value ? '能' : '不能';
      },
    },
    {
      title: '代收人',
      dataIndex: ['receiveInfo', 'userName'],
      key: 'receiveInfo.userName',
      width: '15%',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '代收人银行卡号',
      dataIndex: ['receiveInfo', 'cardNumber'],
      key: 'receiveInfo.cardNumber',
      width: '20%',

      render: (value, data) => {
        // const v = value ? `**** ${value.substr(-4, 4)}` : '-';
        const receiveInfo = data.receiveInfo;
        const text = (
          <div>
            <div>
              <span>所属银行:</span>
              <span>{receiveInfo.bank}</span>
            </div>
            <div>
              <span>持卡人姓名:</span>
              <span>{receiveInfo.userName}</span>
            </div>
            <div>
              <span>持卡人身份证号:</span>
              <span>{receiveInfo.cardNumber}</span>
            </div>
            <div>
              <span>持卡人手机号:</span>
              <span>{receiveInfo.mobile}</span>
            </div>
          </div>
        );
        return (
          <div>
            {value ? (
              <Tooltip placement="top" title={text} overlayStyle={{ maxWidth: 'max-content', padding: '10px' }}>
                <span>{value}</span>
              </Tooltip>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      fixed: 'right',
      align: 'right',
      width: 120,
      render: (value, record, index) => {
        const { id } = record;
        return (
          <Button.Group>
            <Button
              size="small"
              type="link"
              onClick={() => {
                setShowSetting(true), setId(id);
                setType('edit');
              }}>
              编辑
            </Button>

            <Popconfirm
              title={
                <div>
                  <span>是否删除该车队长？</span>
                  <br />
                  <span>删除后不影响已创建的专线</span>
                </div>
              }
              placement="topRight"
              icon={<QuestionCircleFilled />}
              onConfirm={() => delRow(record)}>
              <Button size="small" type="link" danger style={{ marginLeft: 8 }}>
                删除
              </Button>
            </Popconfirm>
          </Button.Group>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [id, setId] = useState('');
  const [showSetting, setShowSetting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [type, setType] = useState('');
  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    middleman: undefined,
    receive: undefined,
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

  // 设置数据
  const getDataList = async ({ middleman, receive, page, pageSize, begin, end }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      begin: begin || undefined,
      end: end || undefined,
      middleman: middleman || undefined,
      receiveMan: receive || undefined,
    };
    const res = await customer.getMiddleManList({ params });
    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 删除行
  const delRow = async ({ id }) => {
    const params = {
      id,
    };
    const res = await customer.removeMiddleMan({ params });
    if (res.status === 0) {
      message.success('车队长删除成功');
      // 删除最后一条
      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }

      setQuery({ ...query, page });
      getDataList({ ...query, page });
    } else {
      message.error(`车队长删除失败，原因：${res.detail || res.description}`);
    }
  };

  // 提交数据
  const create = useCallback(async params => {
    const res = await customer.createMiddleMan({ params });
    if (res.status === 0) {
      message.success('车队长新增成功');
      setShowNew(false);
      setQuery({ ...query, page: 1 });
      getDataList({ ...query, page: 1 });
      setErrorText('');
    } else {
      message.error(`车队长新增失败，原因：${res.detail || res.description}`);
    }
  });

  // 修改提交
  const update = useCallback(async params => {
    const res = await customer.updateMiddleMan({ params });
    if (res.status === 0) {
      message.success('车队长编辑成功');
      setShowSetting(false);
      getDataList({ ...query });
      setErrorText('');
    } else {
      message.error(`车队长编辑失败，原因：${res.detail || res.description}`);
    }
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

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      begin: undefined,
      end: undefined,
      middleman: undefined,
      receive: undefined,
      page: 1,
      pageSize: 10,
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

  // 时间输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 车队长
  const handleChangeMiddleman = useCallback(e => {
    const middleman = e.target.value;
    setQuery(() => ({ ...query, middleman }));
  });
  // 运费代收人
  const handleChangeReceive = useCallback(e => {
    const receive = e.target.value;
    setQuery(() => ({ ...query, receive }));
  });

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Button
            style={{ marginBottom: 16 }}
            type="primary"
            onClick={() => {
              setShowNew(true), setType('add');
            }}>
            新增车队长
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

            <Search.Item label="姓名">
              <Input allowClear value={query.middleman} placeholder="请输入姓名" onChange={handleChangeMiddleman} />
            </Search.Item>
            <Search.Item label="代收人姓名">
              <Input allowClear value={query.receive} placeholder="请输入代收人姓名" onChange={handleChangeReceive} />
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
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
          />
        </section>
      </Content>

      <Modal
        title={type === 'add' ? '新增车队长' : '编辑车队长'}
        onCancel={() => {
          type === 'add' ? setShowNew(false) : setShowSetting(false);
        }}
        visible={type === 'add' ? showNew : showSetting}
        width={640}
        footer={null}
        destroyOnClose>
        {type === 'add' ? (
          <NewFrom
            formData={{}}
            onSubmit={create}
            onClose={() => {
              setShowNew(false);
              setErrorText('');
            }}
          />
        ) : (
          <SettingFrom
            middleId={id}
            onSubmit={update}
            onClose={() => {
              setShowSetting(false), setErrorText('');
            }}
            visible={showSetting}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default MiddleMan;
