import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, message, DatePicker, Popconfirm } from 'antd';
import { Layout, Content, Search, DrawerInfo } from '@components';
import { QuestionCircleFilled } from '@ant-design/icons';
import AddForm from '@components/ProductManagement/CoalBlendingList/AddForm';
import { product } from '@api';
import moment from 'moment';
import { Format } from '@utils/common';
import styles from './styles.less';
import { useRouter } from 'next/router';
const multipleRender = data => {
  let value = '-';
  let style = {};
  if (data.length === 1) {
    value = <div>{data[0]}</div>;
  } else {
    value = data.map(item => <div className={styles.row}>{item}</div>);
    style = { padding: 0 };
  }
  const render = {
    children: value,
    props: { style },
  };
  return render;
};

const Index = () => {
  const router = useRouter();
  const routeView = {
    title: '配煤列表',
    pageKey: 'coalBlendingList',
    longKey: 'productManagement.coalBlendingList',
    breadNav: '智慧工厂.配煤列表',
    pageTitle: '配煤列表',
  };

  const columns = [
    {
      title: '记录编号',
      dataIndex: 'recordNo',
      key: 'recordNo',
      width: 120,
    },
    {
      title: '目标煤种',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 120,
    },
    {
      title: '产出量(吨)',
      dataIndex: 'weight',
      key: 'weight',
      align: 'right',
      width: 120,
      render: Format.weight,
    },
    {
      title: '原料煤种',
      dataIndex: 'rawMaterial',
      key: 'raw_goodsName',
      width: 120,
      render: value => {
        return multipleRender(value.map(item => item.goodsName || '--'));
      },
    },
    {
      title: '投产量(吨)',
      dataIndex: 'rawMaterial',
      key: 'raw_weight',
      align: 'right',
      width: 120,
      render: (value, record) => {
        return multipleRender(value.map(item => item.weight / 1000));
      },
    },
    {
      title: '原料煤种占比',
      dataIndex: 'rawMaterial',
      key: 'raw_proportion',
      width: 120,
      align: 'right',
      render: (value, record) => {
        return multipleRender(value.map(item => item.proportion / 100 + ' %'));
      },
    },
    // {
    //   title: '配煤时间',
    //   dataIndex: 'recordAt',
    //   key: 'recordAt',
    //   width: 120,
    // },
    // {
    //   title: '关联化验单',
    //   dataIndex: 'reportId',
    //   key: 'reportId',
    //   width: 120,
    //   render: (value, record) =>
    //     record.reportNo ? (
    //       <Button
    //         size="small"
    //         type="link"
    //         onClick={() => router.push(`/productManagement/qualityManagement/detail?id=${value}`)}>
    //         {record.reportNo}
    //       </Button>
    //     ) : (
    //       '--'
    //     ),
    // },
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
          <Button danger size="small" type="link">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    sourceName: undefined,
    targetName: undefined,
  });
  const [loading, setLoading] = useState(false);

  const [dataList, setDataList] = useState({});
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    getRemoteData(query);
  }, []);

  // 日期输入
  const handleChangeDate = useCallback(value => {
    const begin = value ? moment(value[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const end = value ? moment(value[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setQuery(() => ({ ...query, begin, end }));
  });

  // 原料煤名称
  const handleChangeSource = useCallback(e => {
    const sourceName = e.target.value;
    setQuery({ ...query, sourceName });
  });

  // 成品煤名称
  const handleChangeTarget = useCallback(e => {
    const targetName = e.target.value;
    setQuery({ ...query, targetName });
  });

  //  查询
  const handleSearch = useCallback(() => {
    console.log(query);
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
      sourceName: undefined,
      targetName: undefined,
    };
    setQuery(query);
    getRemoteData(query);
  }, []);

  const deleteRecord = async id => {
    let params = {
      id,
    };
    const res = await product.deleteCoalBlendingRecord({ params });
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

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
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

  // 添加提交
  const handleSubmit = async data => {
    const res = await product.addCoalBlendingRecord({ params: data });
    if (res.status === 0) {
      message.success('新增成功');
      setShowAdd(false);
      handleSearch();
    } else {
      message.error(res.detail || res.description);
    }
  };

  const getRemoteData = async ({ page, pageSize, sourceName, targetName, begin, end }) => {
    const params = {
      limit: pageSize,
      page,
      rawGoodsName: sourceName,
      targetGoodsName: targetName,
      begin,
      end,
    };
    setLoading(true);
    const res = await product.getCoalBlendingDataList({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => setShowAdd(true)}>
              新增
            </Button>
          </div>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="配煤时间" br>
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
            <Search.Item label="原料煤名称">
              <Input allowClear placeholder="请输入原料煤名称" onChange={handleChangeSource} value={query.sourceName} />
            </Search.Item>
            <Search.Item label="成品煤名称">
              <Input allowClear placeholder="请输入成品煤名称" onChange={handleChangeTarget} value={query.targetName} />
            </Search.Item>
          </Search>

          <Table
            bordered
            style={{ marginTop: 16 }}
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
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>

      {/* 方案录入 */}
      <DrawerInfo title="新增配煤记录" onClose={() => setShowAdd(false)} showDrawer={showAdd} width="760">
        {showAdd && <AddForm onClose={() => setShowAdd(false)} onSubmit={handleSubmit} />}
      </DrawerInfo>
    </Layout>
  );
};

export default Index;
