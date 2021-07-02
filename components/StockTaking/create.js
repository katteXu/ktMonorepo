import { useState, useEffect, useRef } from 'react';
import { Table, Form, DatePicker, Button, Input, message, Popconfirm, Checkbox, Drawer, Modal, Row, Col } from 'antd';
import { PlusOutlined, QuestionCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import ChooseRouteModal from './chooseRouteModal';
import moment from 'moment';
import styles from './index.less';
import TableForm from './CreateForm';
import { inventory } from '@api';
import { ChildTitle, AutoInputSelect, WareHouseSelect } from '@components';
import router from 'next/router';
const { TextArea } = Input;
const initData = [
  {
    goodsName: undefined,
    checkNum: '',
    inventoryNum: '',
    formatDiffNum: '',
    id: '',
  },
];
const Supplement = ({
  tableList,
  onClose,
  handleTableListChange,
  handleInventory,
  drawerVisible,
  handleRefreshList,
}) => {
  const [visible, setVisible] = useState(false);
  const [railInfo, setRailInfo] = useState({});
  const [dataInfo, setDataInfo] = useState([]);
  const [wareHouseId, setWareHouseId] = useState(undefined);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 1000,
  });
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [tableForm] = Form.useForm();
  const [disabledSelect, setDisabledSelect] = useState(false);
  //表单布局
  const formItemLayout = {
    labelAlign: 'left',
  };

  const wareHouseRef = useRef(null);
  const { userId } = localStorage;
  const [newGoodsType, setNewGoodsType] = useState(false);

  //确认盘点验证表单
  const handleConfirm = async () => {
    if (!wareHouseId) {
      message.error('请选择仓库');
      return false;
    }
    try {
      const row = await tableForm.validateFields();
      if (checkIsHasAdd(dataInfo)) createStock();
      else message.error('请先保存货品信息');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  //判断是否有真实的货品信息
  const checkIsHasAdd = data => {
    let resultVal = [];
    if (data.length > 0) {
      resultVal = data.filter(item => item.id === '');
    }
    return resultVal.length > 0 ? false : true; //false没有真是货品 true有真实货品
  };

  //判断仓库是否需要禁用
  const handleDisabledSelect = data => {
    setDisabledSelect(data);
  };

  //取消添加盘点
  const handleCancel = async () => {
    if (dataInfo.length > 0 && checkIsHasAdd(dataInfo)) {
      Modal.confirm({
        icon: <ExclamationCircleOutlined />,
        title: '检测到您已填写信息，是否保存当前数据',
        okText: '保存',
        cancelText: '不保存',
        onOk: () => {
          message.success('已保存');
          onClose();
        },
        onCancel: () => {
          clearAll();
          setWareHouseId(undefined);
        },
      });
    } else {
      clearAll();
    }
  };

  // 清除全部
  const clearAll = async () => {
    const res = await inventory.clearWaitInventoryCheckDetail({});
    if (res.status === 0) {
      // message.success('已取消');
      onClose();
    } else {
      message.error(res.detail || res.description);
    }
  };

  //选择仓库
  const onChange = data => {
    setWareHouseId(data);
  };

  //传递给父组件表格的数组值
  const handleDetail = data => {
    setDataInfo(data);
    handleTableListChange(data);
  };

  //初始化表格的值
  const getList = async ({ page, pageSize }) => {
    const params = {
      page: page,
      limit: pageSize,
    };
    const res = await inventory.getWaitInventoryChecklist({ params });
    if (res.status === 0) {
      onChange(res.result.wareHouseId ? res.result.wareHouseId : undefined);
      if (res.result.data.length) setDataInfo(res.result.data);
      else setDataInfo(initData);
      checkIsHasAdd(res.result.data);
      handleDisabledSelect(res.result.data.length > 0 ? true : false);
    } else message.error(res.detail || res.description);
  };

  // 创建盘点调取接口
  const createStock = async () => {
    const order = dataInfo.map(item => {
      return { id: item.id, inventoryNum: item.inventoryNum, diffNum: item.diffNum, checkNum: item.checkNum };
    });
    const value = form2.getFieldValue();
    const params = {
      remark: value.remark,
      order: order,
      wareHouseId: wareHouseId == -1 ? 0 : wareHouseId,
    };
    const res = await inventory.submitInventoryCheck({ params });
    if (res.status === 0) {
      message.success('创建成功');
      value.remark = undefined;
      onClose();
      handleRefreshList();
    } else {
      message.error(res.detail || res.description);
      getList({ ...query });
    }
  };

  const hasWareHouseId = () => {
    if (wareHouseId) return wareHouseId;
    else return false;
  };

  useEffect(() => {
    getList({ ...query });
  }, [drawerVisible]);
  return (
    <>
      <div className={styles['stock_taking']}>
        <div className={styles.header}>
          <Row style={{ marginBottom: 20 }}>
            <Col span={9}>
              <span>
                <span style={{ color: 'rgb(228, 64, 64)' }}>*&nbsp;</span>仓库：
              </span>
              <WareHouseSelect
                onChange={onChange}
                allowClear
                placeholder="请选择仓库"
                style={{ width: 264 }}
                ref={wareHouseRef}
                disabled={disabledSelect}
                value={wareHouseId}
              />
            </Col>
            <Col span={2} style={{ position: 'relative', left: 0 }}>
              <Button type="link" onClick={handleInventory}>
                管理仓库
              </Button>
            </Col>
          </Row>
        </div>
      </div>
      <TableForm
        dataInfo={dataInfo}
        form={tableForm}
        handleDetail={handleDetail}
        onClose={onClose}
        hasWareHouseId={hasWareHouseId}
        handleDisabledSelect={handleDisabledSelect}
      />
      <div style={{ marginTop: 20 }}>
        <Form form={form2}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>备注
              </div>
            }
            name="remark">
            <TextArea rows={4} placeholder="请输入4-100字以内" style={{ width: 480 }} maxLength={100}></TextArea>
          </Form.Item>
        </Form>
      </div>
      <div className={styles.btnBox}>
        <Button onClick={handleCancel} style={{ marginRight: 12 }}>
          取消
        </Button>
        <Button htmlType="submit" onClick={handleConfirm} type="primary">
          确认盘点
        </Button>
      </div>
    </>
  );
};
export default Supplement;
