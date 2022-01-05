import { useState, useEffect, forwardRef } from 'react';
import { Button, Modal, List, Input, Row, Col } from 'antd';
import { getList } from '../../api';
import CompanyForm from './companyForm';
import styles from './styles.less';
import router from 'next/router';
import { QuestionCircleFilled } from '@ant-design/icons';
const URL = {
  address: 'v1/user/list_addresses',
  contract: 'v1/contractOverload/contractList',
};

const TEXT = {
  address: '企业',
  contract: '合同',
};
const SelectBtn = ({ onChange, type, mode, value, onInit, title, filter }, ref) => {
  // 数据列表
  const [list, setList] = useState([]);
  // 弹窗状态
  const [visible, setVisible] = useState(false);
  // 加载...
  const [loading, setLoading] = useState(true);
  // 选项
  const [item, setItem] = useState(false);

  // 弹窗状态
  const [createVisible, setCreateVisible] = useState(false);

  // 企业名称
  const [companyName, setCompanyName] = useState('');

  // 过滤数据
  const [filterList, setFilterList] = useState([]);

  // 页面
  const [page, setPage] = useState(1);
  // 添加函数
  const handleAdd = () => {
    if (type === 'address') {
      setCreateVisible(true);
    } else if (type === 'contract') {
      Modal.confirm({
        title: '添加合同',
        icon: <QuestionCircleFilled />,
        content: (
          <>
            <div>确认去添加合同？</div>
          </>
        ),
        onOk: () => router.push('/contractManagement/purchase/create'),
      });
    }
  };

  // 首次加载
  useEffect(() => {
    if (typeof onInit === 'function') {
      onInit({
        open: openModal,
      });
    }
  }, []);

  // 监听选中的地址
  useEffect(() => {
    if (filter && filter.id) {
      const dataList = list.filter(item => item.id !== filter.id);
      setFilterList(dataList);
    }
  }, [filter]);

  // 获取列表数据
  useEffect(() => {
    (async () => {
      const res = await getList({ url: URL[type] });
      if (res.status === 0) {
        if (type === 'address') {
          setList(res.result);
        } else if (type === 'contract') {
          setList(res.result.data);
        } else {
          console.log(`${type} 不存在`);
        }
      }
      setLoading(false);
    })();
  }, [type]);

  // 监听选中事件 选中才执行change事件
  useEffect(() => {
    if (item) {
      onChange(item);
      setVisible(false);
    }
  }, [item]);

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
  };

  // 打开弹窗
  const openModal = () => {
    setVisible(true);
  };

  // 重新加载
  const reload = async () => {
    setLoading(true);
    const res = await getList({
      url: URL[type],
    });
    if (res.status === 0 && type === 'address') {
      setList(res.result);
    }
    setLoading(false);
  };

  // 加载数据
  const loadData = async companyName => {
    setLoading(true);
    const res = await getList({
      url: URL[type],
      params: { companyName },
    });
    if (res.status === 0 && type === 'address') {
      setList(res.result);
    }
    setLoading(false);
    setPage(1);
  };
  // 地址item
  const addressItem = (item, key) => {
    return (
      <List.Item key={key} className={styles['list-item']} onClick={() => setItem(item)}>
        <List.Item.Meta
          title={`企业：${item.companyName}`}
          description={`地址：${item.province + item.city + item.district + item.detailAddress}`}
        />
      </List.Item>
    );
  };

  // 分页
  const onChangePage = setPage;

  // 搜索
  const query = () => {
    loadData(companyName);
  };

  // 重置
  const reset = () => {
    setCompanyName('');
    loadData('');
  };

  // 合同item
  const contractItem = (item, key) => {
    return (
      <List.Item key={key} className={styles['list-item']} onClick={() => setItem(item)}>
        <List.Item.Meta title={`合同：${item.name}`} />
      </List.Item>
    );
  };

  const ListItem = {
    address: addressItem,
    contract: contractItem,
  };

  return (
    <>
      {mode === 'input' ? (
        <Input readOnly value={value} placeholder="点击选择企业" onClick={openModal} />
      ) : (
        <Button style={{ width: '100%' }} onClick={openModal}>
          选择{TEXT[type]}
        </Button>
      )}
      {/* 列表弹窗 */}
      <Modal
        visible={visible}
        onCancel={closeModal}
        width={620}
        style={{ top: 20, padding: 0 }}
        title={title || `选择${TEXT[type]}`}
        footer={null}>
        {type === 'address' && (
          <Row gutter={12} style={{ marginBottom: 10 }}>
            <Col span={16}>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Button type="primary" onClick={query}>
                搜索
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={reset}>
                重置
              </Button>
            </Col>
          </Row>
        )}
        <List
          loading={loading}
          size="small"
          bordered
          dataSource={filter && filter.id ? list.filter(item => item.id !== filter.id) : list}
          itemLayout="horizontal"
          pagination={{
            size: 'small',
            pageSize: 8,
            current: page,
            onChange: onChangePage,
          }}
          renderItem={ListItem[type]}
        />
        <Button style={{ marginTop: 15 }} block size="large" type="primary" onClick={handleAdd}>
          添加{TEXT[type]}
        </Button>
      </Modal>
      {/* 表单弹窗 */}
      <Modal
        visible={createVisible}
        destroyOnClose
        width={640}
        footer={null}
        title="添加企业"
        maskClosable={false}
        onCancel={() => setCreateVisible(false)}>
        <CompanyForm onSubmit={reload} onClose={() => setCreateVisible(false)} />
      </Modal>
    </>
  );
};

export default forwardRef(SelectBtn);
