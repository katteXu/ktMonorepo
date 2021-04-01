import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Layout, Search, Content, Ellipsis, AutoInputSelect } from '@components';
import { Button, Table, message, DatePicker, Popconfirm, Modal } from 'antd';
import { keepState, Format } from '@utils/common';
import { product } from '@api';
import AddcoalWashingFrom from '@components/ProductManagement/CoalWashing/AddcoalWashingFrom';
import { QuestionCircleFilled } from '@ant-design/icons';
import deleteBtn from './deleteBtn.less';
const Index = props => {
  const routeView = {
    title: '洗煤列表',
    pageKey: 'coalWashing',
    longKey: 'productManagement.coalWashing',
    breadNav: '智慧工厂.洗煤列表',
    pageTitle: '洗煤列表',
  };

  // 列数据
  const columns = [
    {
      title: '记录编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 120,
    },
    {
      title: '原煤名称',
      dataIndex: 'nameIn',
      key: 'nameIn',
      width: 120,
      render: value => <Ellipsis value={value} width={100} />,
    },

    {
      title: '原煤选洗量(吨)',
      dataIndex: 'weightIn',
      key: 'weightIn',
      align: 'right',
      width: 120,
      render: Format.weight,
    },
    {
      title: '精煤名称',
      dataIndex: 'nameOut',
      key: 'nameOut',
      width: 120,
      render: value => <Ellipsis value={value} width={100} />,
    },
    {
      title: '精煤出产量(吨)',
      dataIndex: 'weightOut',
      key: 'weightOut',
      align: 'right',
      width: 120,
      render: Format.weight,
    },
    {
      title: '回收率',
      dataIndex: 'recoverRate',
      key: 'recoverRate',
      width: 120,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '时间',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 200,
      render: (value, record) => <span>{`${record.beginTime}~${record.endTime}`}</span>,
    },

    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record, index) => (
        <Popconfirm
          title="删除后会同步删除出入库记录，是否确认删除？"
          placement="topRight"
          icon={<QuestionCircleFilled />}
          onConfirm={() => deleteRecord(record.id)}>
          <Button className={deleteBtn.delete} size="small" type="link">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    nameIn: undefined,
    nameOut: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [newGoodsType, setNewGoodsType] = useState(false);
  const [newGoodsType1, setNewGoodsType1] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getRemoteData(query);
  }, []);

  // 日期输入
  const handleChangeDate = useCallback((value, dateStatus) => {
    const _begin = value ? moment(value[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = value ? moment(value[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setQuery(() => ({ ...query, begin: _begin, end: _end, dateStatus }));
  });

  const deleteRecord = async id => {
    let params = {
      id,
    };
    const res = await product.deleteCoalWashLog({ params });
    if (res.status === 0) {
      message.success('记录删除成功');
      // 删除最后一条
      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }
      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
    } else {
      message.error(res.detail || res.description);
    }
  };

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
      begin: undefined,
      end: undefined,
      nameIn: undefined,
      nameOut: undefined,
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

  const getRemoteData = async ({ nameIn, page, pageSize, begin, end, nameOut }) => {
    setLoading(true);
    const { userId } = localStorage;
    const params = {
      nameIn,
      nameOut,
      limit: pageSize,
      page,
      begin,
      end,
    };

    const res = await product.coalWashLogList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      // 持久化状态
      keepState({
        query: {
          nameIn,
          nameOut,
          limit: pageSize,
          page,
          begin,
          end,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  const onChangeNameIn = (e, val) => {
    if (val) {
      const nameIn = val.children;
      setQuery(() => ({ ...query, nameIn }));
    } else {
      setQuery(() => ({ ...query, nameIn: undefined }));
    }

    setNewGoodsType(true);
    //搜索后需要重新调接口
    setTimeout(() => {
      setNewGoodsType(false);
    }, 1000);
  };

  const onChangeNameOut = (e, val) => {
    if (val) {
      const nameOut = val.children;
      setQuery(() => ({ ...query, nameOut }));
    } else {
      setQuery(() => ({ ...query, nameOut: undefined }));
    }

    setNewGoodsType(true);
    //搜索后需要重新调接口
    setTimeout(() => {
      setNewGoodsType(false);
    }, 1000);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => setVisible(true)}>
              新增
            </Button>
          </div>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="时间" br>
              <DatePicker.RangePicker
                style={{ width: 376 }}
                value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={handleChangeDate}
              />
            </Search.Item>
            <Search.Item label="原煤名称">
              <AutoInputSelect
                mode="goodsType"
                allowClear
                placeholder="请选择原煤名称"
                onChange={onChangeNameIn}
                newGoodsType={newGoodsType}
                style={{ width: 200 }}
                value={query.nameIn}
              />
            </Search.Item>
            <Search.Item label="精煤名称">
              <AutoInputSelect
                mode="goodsType"
                allowClear
                placeholder="请选择精煤名称"
                onChange={onChangeNameOut}
                newGoodsType={newGoodsType}
                style={{ width: 200 }}
                value={query.nameOut}
              />
            </Search.Item>
          </Search>
          <Table
            style={{ marginTop: 16 }}
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
      <Modal title="新增洗煤记录" destroyOnClose visible={visible} onCancel={() => setVisible(false)} footer={null}>
        <AddcoalWashingFrom
          onClose={() => setVisible(false)}
          onSubmit={() => {
            setVisible(false);
            handleSearch();
          }}
        />
      </Modal>
    </Layout>
  );
};

export default Index;
