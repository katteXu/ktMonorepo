import { useState, useEffect, forwardRef } from 'react';
import { Button, Modal, List, Input, message } from 'antd';
import { getList, customer } from '@api';
import CompanyForm from '@components/CustomerDetail/company/form';
import styles from './styles.less';
import router from 'next/router';
import { QuestionCircleFilled, SearchOutlined, PlusOutlined } from '@ant-design/icons';

const URL = {
  address: 'v1/user/customerAddressList',
  contract: 'v_sass/user/contract_list_exclude_used',
};

const TEXT = {
  address: '企业',
  contract: '合同',
};
const SelectBtn = ({ onChange, type, mode, value, onInit, title, filter, style }, ref) => {
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
  const [total, setTotal] = useState();
  // 添加函数
  const handleAdd = () => {
    if (type === 'address') {
      setCreateVisible(true);
      setVisible(false);
    } else if (type === 'contract') {
      Modal.confirm({
        title: '添加合同',
        icon: <QuestionCircleFilled />,
        content: (
          <>
            <div>确认去添加合同？</div>
          </>
        ),
        onOk: () => router.push('/contractManagement/addContract'),
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
          setList(res.result.data);
          setTotal(res.result.count);
        } else if (type === 'contract') {
          setList(res.result.data);
          setTotal(res.result.count);
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
      setList(res.result.data);
      setTotal(res.result.count);
    }
    setLoading(false);
  };

  // 添加企业
  const addAddress = async params => {
    const res = await customer.createCustomer({ params });
    if (res.status === 0) {
      message.success('添加成功');
      setVisible(true);
      setCreateVisible(false);
      reload();
    } else {
      Modal.error({
        title: res.description,
        content: res.detail,
      });
    }
  };

  // 加载数据
  const loadData = async companyName => {
    setLoading(true);
    const res = await getList({
      url: URL[type],
      params: { companyName },
    });
    if (res.status === 0 && type === 'address') {
      setList(res.result.data);
      setTotal(res.result.count);
    }
    setLoading(false);
    setPage(1);
  };
  // 地址item
  const addressItem = (item, key) => {
    return (
      <List.Item key={key} className={styles['list-item']} onClick={() => setItem(item)}>
        <List.Item.Meta
          title={`企业：${item.companyName || '-'}`}
          // description={`地址：${item.province + item.city + item.district + item.detailAddress}`}
        />
      </List.Item>
    );
  };

  // 分页
  const onChangePage = page => setPage(page);

  // 监听分页
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getList({ url: URL[type], params: { page } });
      if (res.status === 0) {
        // if (type === 'address') {
        setList(res.result.data);
        setTotal(res.result.count);
        // }
      }
      setLoading(false);
    })();
  }, [page]);
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
        <List.Item.Meta title={`合同：${item.title}`} />
      </List.Item>
    );
  };

  const ListItem = {
    address: addressItem,
    contract: contractItem,
  };

  // 分页对象
  const pagination = {
    size: 'small',
    page: page,
    showSizeChanger: false,
    showTotal: false,
  };

  // 地址后端分页添加总数
  if (type === 'address') {
    pagination.total = total;
    pagination.onChange = onChangePage;
  }
  if (type === 'contract') {
    pagination.total = total;
    pagination.onChange = onChangePage;
  }
  return (
    <>
      {mode === 'input' ? (
        <Input style={{ ...style }} readOnly value={value} placeholder="点击选择企业" onClick={openModal} />
      ) : (
        <Button style={{ width: '100%', ...style }} onClick={openModal}>
          选择{TEXT[type]}
        </Button>
      )}
      {/* 列表弹窗 */}
      <Modal
        visible={visible}
        onCancel={closeModal}
        style={{ top: 20, padding: 0 }}
        title={`选择${title}` || `选择${TEXT[type]}`}
        footer={null}>
        <Button style={{ marginBottom: 24 }} block type="primary" onClick={handleAdd} ghost icon={<PlusOutlined />}>
          添加{TEXT[type]}
        </Button>
        {type === 'address' && (
          <div style={{ marginBottom: 10, display: 'flex' }}>
            <div style={{ width: 272 }}>
              <Input
                allowClear
                prefix={<SearchOutlined style={{ color: '#BFBFBF' }} />}
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                onPressEnter={query}
                placeholder="输入企业名称"
              />
            </div>
            <div style={{ textAlign: 'right', marginLeft: 22 }}>
              <Button type="primary" onClick={query}>
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={reset}>
                重置
              </Button>
            </div>
          </div>
        )}
        <div className={styles['rootList']}>
          <List
            loading={loading}
            size="small"
            bordered
            dataSource={filter && filter.id ? list.filter(item => item.id !== filter.id) : list}
            itemLayout="horizontal"
            pagination={pagination}
            renderItem={ListItem[type]}
          />
        </div>
      </Modal>
      {/* 表单弹窗 */}
      <Modal
        visible={createVisible}
        destroyOnClose
        width={640}
        footer={null}
        title="添加企业"
        maskClosable={false}
        onCancel={() => {
          setVisible(true), setCreateVisible(false);
        }}>
        <CompanyForm
          onSubmit={addAddress}
          formData={{}}
          onClose={() => {
            setCreateVisible(false), setVisible(true);
          }}
        />
      </Modal>
    </>
  );
};

export default forwardRef(SelectBtn);
