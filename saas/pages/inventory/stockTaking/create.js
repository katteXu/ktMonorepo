import React, { useState, useCallback, useEffect } from 'react';
import { Layout, Content, AutoInputSelect } from '@components';
import { Input, Table, Button, Form, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Format } from '@utils/common';
import { inventory } from '@api';
import router from 'next/router';
import Link from 'next/link';
import styles from '../styles.less';
import Modal from 'antd/lib/modal/Modal';

const Index = props => {
  const routeView = {
    title: '新增盘点',
    pageKey: 'stockTaking',
    longKey: 'inventory.stockTaking.create',
    breadNav: [
      '库存管理',
      <Link href="/inventory/stockTaking">
        <a>库存盘点</a>
      </Link>,
      '新增盘点',
    ],
    pageTitle: '新增盘点',
    useBack: true,
  };
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 120,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '盘点数量',
      dataIndex: 'checkNum',
      key: 'checkNum',
      width: 120,
      align: 'left',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '账面库存',
      dataIndex: 'inventoryNum',
      key: 'inventoryNum',
      width: 120,
      align: 'left',
      render: value => <span>{Format.weight(value)}</span>,
    },
    {
      title: '盈亏数量',
      dataIndex: 'formatDiffNum',
      key: 'formatDiffNum',
      width: 120,
      align: 'right',
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 120,
      align: 'right',
      render: (value, record, index) => (
        <Button
          size="small"
          type="link"
          key="detail"
          danger
          onClick={() => {
            handleDeleteGoods(record.id);
          }}>
          删除
        </Button>
      ),
    },
  ];
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [newGoodsType, setNewGoodsType] = useState(false);
  const [dataList, setDataList] = useState({});
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 1000,
  });
  // 添加一条
  const handleSubmit = async value => {
    setLoading(true);
    const params = {
      inventoryId: value.goodsName || undefined,
      num: value.diffNum * 1000 || undefined,
    };
    const res = await inventory.addInventoryCheckDetail({ params });
    if (res.status === 0) {
      getList({ ...query });
      message.success('添加成功');
    } else {
      message.error(res.detail || res.description);
    }
    form.setFieldsValue({
      goodsName: undefined,
      diffNum: undefined,
    });
    setLoading(false);
  };

  // 删除一条
  const handleDeleteGoods = async id => {
    const params = {
      did: id,
    };
    const res = await inventory.inventoryCheckDetailDel({ params });
    if (res.status === 0) {
      getList({ ...query });
      message.success('删除成功');
    } else {
      message.error(res.detail || res.description);
    }
  };
  // 获取列表
  const getList = async ({ page, pageSize }) => {
    const params = {
      page: page,
      limit: pageSize,
    };
    const res = await inventory.getWaitInventoryChecklist({ params });
    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(res.detail || res.description);
    }
  };
  // 取消
  const handleCancel = () => {
    if (dataList.data.length > 0) {
      Modal.confirm({
        icon: <ExclamationCircleOutlined />,
        title: '检测到您已填写信息，是否保存当前数据',
        okText: '保存',
        cancelText: '不保存',
        onOk: () => {
          message.success('已保存');
          router.push('/inventory/stockTaking');
        },
        onCancel: () => {
          clearAll();
        },
      });
    } else {
      clearAll();
    }
  };
  // 删除全部
  const clearAll = async () => {
    const res = await inventory.clearWaitInventoryCheckDetail({});
    if (res.status === 0) {
      message.success('已取消');
      router.push('/inventory/stockTaking');
    } else {
      message.error(res.detail || res.description);
    }
  };

  const handleFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };
  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getQualidyByGoods({ ...query, page });
    },
    [dataList]
  );

  // 创建
  const createStock = async () => {
    const order = dataList.data.map(item => {
      return { id: item.id, inventoryNum: item.inventoryNum, diffNum: item.diffNum };
    });
    const value = form2.getFieldValue();
    const params = {
      remark: value.remark,
      order: order,
    };
    const res = await inventory.submitInventoryCheck({ params });
    if (res.status === 0) {
      message.success('创建成功');
      router.push('/inventory/stockTaking');
    } else {
      message.error(res.detail || res.description);
      getList({ ...query });
    }
  };

  const onChangeGoodsType = (e, val) => {
    console.log('12345');
    if (val) {
      const item = val.item;

      form.setFieldsValue({
        goodsType: item.value,
      });
    } else {
      form.setFieldsValue({
        goodsType: undefined,
      });
      setNewGoodsType(true);
      //搜索后需要重新调接口
      setTimeout(() => {
        setNewGoodsType(false);
      }, 1000);
    }
  };

  useEffect(() => {
    getList({ ...query });
  }, []);
  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <section>
          <div className={styles.title}>盘点信息</div>
          <div className={styles.row}>
            <div className={styles.col}>
              <Form form={form2}>
                <Form.Item
                  label={
                    <div>
                      <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>盘点备注
                    </div>
                  }
                  name="remark">
                  <Input placeholder="请输入4-100字以内" style={{ width: 480 }} maxLength={100} />
                </Form.Item>
              </Form>
            </div>
          </div>
          <Form onFinish={handleSubmit} onFinishFailed={handleFinishFailed} form={form}>
            <div className={styles.title} style={{ marginTop: 11 }}>
              盘点货物
            </div>
            <div className={styles.row}>
              <div className={styles.col}>
                <Form.Item label="货品名称" rules={[{ required: true, message: '请选择货品名称' }]} name="goodsName">
                  <AutoInputSelect
                    mode="goodsType"
                    allowClear
                    placeholder="请选择货品名称"
                    onChange={onChangeGoodsType}
                    newGoodsType={newGoodsType}
                    style={{ width: 200 }}
                  />
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  label="盘点数量"
                  validateFirst={true}
                  rules={[
                    { required: true, message: '请输入正确的盘点数量' },
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                          form.setFieldsValue({
                            diffNum: val,
                          });
                          if (+value >= 2000000) {
                            const val = value && '2000000';
                            form.setFieldsValue({
                              diffNum: val,
                            });
                          }
                          return Promise.resolve();
                        } else {
                          if (value === '') {
                            return;
                          }
                          const val = value && value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                          form.setFieldsValue({
                            diffNum: val,
                          });
                          return Promise.reject('请输入大于0的数字');
                        }
                      },
                    },
                  ]}
                  name="diffNum">
                  <Input placeholder="请输入盘点数量" style={{ width: 200 }} type="number" />
                </Form.Item>
              </div>
              <div className={styles.col} style={{ marginLeft: 24 }}>
                <Button htmlType="submit">添加</Button>
              </div>
            </div>
          </Form>
          <Table
            style={{ marginTop: 24 }}
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              showSizeChanger: false,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
          <div className={styles.bottomBtn}>
            <Button type="primary" style={{ marginRight: 8 }} onClick={createStock}>
              创建盘点
            </Button>
            <Button onClick={handleCancel}>取消</Button>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
