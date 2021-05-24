// 现有配比方案表单
import { Input, Button, Form, Radio, Select, message } from 'antd';
import { useState, useEffect, useCallback, useRef } from 'react';
import RawForm from './rawForm';
import { product } from '@api';
import styles from './styles.less';
import { QuestionCircleFilled, PlusOutlined } from '@ant-design/icons';
const formItemLayout = {
  labelAlign: 'left',
};
const CurrentForm = ({ onSubmit, onClose }) => {
  const [form] = Form.useForm();

  const [rawList, setRawList] = useState([1, 2]);
  const [loading, setLoading] = useState(false);
  const [GoodsType, setGoodsType] = useState([]);
  const [rawGoods, setRawGoods] = useState([]);
  // 初始化
  useEffect(() => {
    initTargetGoods();
    initRawGoods();
  }, []);
  // 提交数据
  const handleSubmit = async values => {
    const { targetGoodId, ...rawForm } = values;

    const totalProportion = Object.values(rawForm).reduce((prev, curr) => prev * 1 + curr.proportion * 1, 0);

    if (totalProportion !== 100) {
      message.warn('原料煤占比应达到100%');
      return;
    }
    const rawMaterial = Object.values(rawForm).map(item => {
      const params = {
        ...item,
        ashContent: item.ashContent ? (item.ashContent * 100).toFixed(0) * 1 : 0,
        bond: item.bond ? (item.bond * 100).toFixed(0) * 1 : 0,
        carbon: item.carbon ? (item.carbon * 100).toFixed(0) * 1 : 0,
        cinder: item.cinder ? (item.cinder * 100).toFixed(0) * 1 : 0,
        cleanCoal: item.cleanCoal ? (item.cleanCoal * 100).toFixed(0) * 1 : 0,
        colloid: item.colloid ? (item.colloid * 100).toFixed(0) * 1 : 0,
        midCoal: item.midCoal ? (item.midCoal * 100).toFixed(0) * 1 : 0,
        proportion: item.proportion ? (item.proportion * 100).toFixed(0) * 1 : 0,
        recovery: item.recovery ? (item.recovery * 100).toFixed(0) * 1 : 0,
        stone: item.stone ? (item.stone * 100).toFixed(0) * 1 : 0,
        sulfur: item.sulfur ? (item.sulfur * 100).toFixed(0) * 1 : 0,
        totalWaterContent: item.totalWaterContent ? (item.totalWaterContent * 100).toFixed(0) * 1 : 0,
        unitPrice: item.unitPrice ? (item.unitPrice * 100).toFixed(0) * 1 : 0,
        volatilization: item.volatilization ? (item.volatilization * 100).toFixed(0) * 1 : 0,
        waterContent: item.waterContent ? (item.waterContent * 100).toFixed(0) * 1 : 0,
        proportion: item.proportion ? (item.proportion * 100).toFixed(0) * 1 : 0,
      };
      return params;
    });

    const targetGoods = GoodsType.find(item => item.id === targetGoodId);

    const params = {
      targetGoods: { ...targetGoods, inventoryId: targetGoods.id },
      rawMaterial,
    };

    onSubmit && onSubmit(params);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // 新建
  const newForm = () => {
    const index = rawList[rawList.length - 1] + 1;
    rawList.push(index);
    setRawList([...rawList]);
  };

  // 初始化目标列表
  const initTargetGoods = async () => {
    const res = await product.getGoodsList();
    if (res.status === 0) {
      setGoodsType(res.result);
    }
  };

  // 初始化原料列表
  const initRawGoods = async () => {
    const res = await product.getDataList({ params: { isPage: false } });
    if (res.status === 0) {
      setRawGoods(res.result.data);
    }
  };

  const handleRemove = id => {
    const _list = rawList.filter(item => item !== id);
    setRawList([..._list]);
  };

  return (
    <div className={styles.main}>
      <Form
        {...formItemLayout}
        className={styles['main-form']}
        autoComplete="off"
        layout="inline"
        form={form}
        scrollToFirstError
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}>
        <div className={styles.row} style={{ marginTop: 8 }}>
          <div className={styles.col}>
            <Form.Item
              label="目标货品"
              name="targetGoodId"
              validateFirst={true}
              rules={[{ required: true, message: '内容不可为空' }]}>
              <Select allowClear placeholder="请选择目标货品">
                {GoodsType.map(v => (
                  <Select.Option key={v.id} value={v.id}>
                    {v.goodsName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className={styles.col}></div>
        </div>

        {/* 原料煤 */}
        {rawList.map((id, index) => (
          <RawForm form={form} rawGoods={rawGoods} key={id} index={index} name={id} onRemove={() => handleRemove(id)} />
        ))}
        <div className={styles['btn-add']} onClick={newForm}>
          <span>
            <PlusOutlined style={{ marginRight: 4 }} />
            新增原料煤种
          </span>
        </div>

        <div className={styles.bottom}>
          <Button size="default" onClick={() => onClose && onClose()}>
            取消
          </Button>
          <Button size="default" type="primary" style={{ marginLeft: 8 }} htmlType="submit">
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CurrentForm;
