import { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Search } from '@components';
import { Table, message, Select, Input, Button, Popconfirm } from 'antd';
import { childAccount } from '@api';
import { getState, clearState } from '@utils/common';
const Option = Select.Option;
import { QuestionCircleFilled } from '@ant-design/icons';
import { Permission } from '@store';

const Child = props => {
  const routeView = {
    title: '账号管理',
    pageKey: 'accountManagement/main',
    longKey: 'accountManagement.main',
    breadNav: '账号管理',
    pageTitle: '账号管理',
  };
  const { isSuperUser } = Permission.useContainer();

  // 默认列
  const defaultCol = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '账号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'group_name',
      key: 'group_name',
    },
    {
      title: '角色说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'create_at',
      key: 'create_at',
    },
    {
      title: '操作',
      dataIndex: '操作',
      align: 'right',
      key: 'ctrl',
      render: (text, data, index) => {
        const { id } = data;
        return (
          <Popconfirm
            title="是否删除该账号？"
            placement="topRight"
            icon={<QuestionCircleFilled />}
            onConfirm={() => deleteChild(id)}>
            <Button type="link" size="small" danger style={{ padding: 0, border: 'none', margin: 0 }}>
              删除
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const [columns, setColumns] = useState();

  // 监听变化
  useEffect(() => {
    const _col = isSuperUser ? [...defaultCol] : [...defaultCol.filter(column => column.key !== 'ctrl')];
    setColumns([..._col]);
  }, [isSuperUser]);

  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState({});
  const [infoData, setInfoData] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [canLoad, setCanLoad] = useState(true);
  const [page, setPage] = useState(1);
  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    name: '',
    groupId: undefined,
  });

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery(state);
    getTableData(state);
    // 获取角色列表
    getGroupList();
  }, []);

  // 获取角色列表
  const getGroupList = async page => {
    const params = {
      page,
    };
    const res = await childAccount.getGroupList({ params });
    if (res.status === 0) {
      setInfoData([...infoData, ...res.result.data]);
      setPage(res.result.page + 1);
      if (res.result.page === res.result.pages) {
        setCanLoad(false);
      }
    } else {
      // message.error(res.detail || res.description);
    }
  };

  // 获取子账号列表
  const getTableData = async ({ page, groupId, name, pageSize }) => {
    const { userId } = localStorage;
    setLoading(true);
    let params = {
      permission_group_id: groupId,
      name,
      user_id: userId,
      limit: 1000,
    };
    const res = await childAccount.getChildUsers({ params });
    if (res.status === 0) {
      setDataSource(res.result);
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  };

  //  查询
  const search = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getTableData({ ...query, page: 1 });
  }, [query]);

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      name: '',
      groupId: undefined,
      page: 1,
    };
    setQuery(query);
    getTableData(query);
  }, []);

  // 岗位名称
  const handleChangeGroupId = useCallback(value => {
    const groupId = value;
    setQuery(() => ({ ...query, groupId }));
  });

  // 姓名
  const handleChangeName = useCallback(e => {
    const name = e.target.value;
    setQuery(() => ({ ...query, name }));
  });

  // 删除子账号
  const deleteChild = async id => {
    const params = {
      child_user_id: id + '',
    };
    const res = await childAccount.deleteChildUser({ params });
    if (res.status === 0) {
      message.success('删除成功');
      getTableData(query);
    } else {
      message.error(res.detail || res.description);
    }
  };

  const loadMore = async e => {
    if (!canLoad) {
      return;
    }
    const { scrollHeight, scrollTop, clientHeight } = e.target;
    if (scrollHeight === scrollTop + clientHeight) {
      setSelectLoading(true);
      const res = await getGroupList(page);
      setSelectLoading(false);
    }
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Search onSearch={search} onReset={resetFilter}>
            <Search.Item label="姓名">
              <Input value={query.name} allowClear onChange={handleChangeName} placeholder="请填写姓名" />
            </Search.Item>
            <Search.Item label="角色">
              <Select
                value={query.groupId}
                allowClear
                style={{ width: '100%' }}
                placeholder="请选择角色"
                onChange={handleChangeGroupId}
                onPopupScroll={loadMore}
                loading={selectLoading}
                allowClear>
                {infoData.map((value, index) => (
                  <Option value={value.id} key={value.id}>
                    {value.name}
                  </Option>
                ))}
              </Select>
            </Search.Item>
          </Search>
        </section>
        <section style={{ paddingTop: 0 }}>
          <Table rowKey="id" loading={loading} columns={columns} dataSource={dataSource.data} pagination={false} />
        </section>
      </Content>
    </Layout>
  );
};

export default Child;
