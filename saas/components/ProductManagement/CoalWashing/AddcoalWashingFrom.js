import { Input, Button, Form, message, DatePicker } from 'antd';
import { useState } from 'react';
import { product } from '@api';
import styles from './styles.less';
import moment from 'moment';
import { AutoInputSelect } from '@components';

const { RangePicker } = DatePicker;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
};

const AddcoalWashingFrom = ({ onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [newGoodsType, setNewGoodsType] = useState(false);
  const [inventoryOutId, setInventoryOutId] = useState({});

  const [inventoryInId, setInventoryInId] = useState({});
  // 提交数据
  const onFinish = async values => {
    const params = {
      begin: values.changeTime ? moment(values.changeTime[0]).format('YYYY-MM-DD HH:mm:ss') : undefined,
      end: values.changeTime ? moment(values.changeTime[1]).format('YYYY-MM-DD HH:mm:ss') : undefined,
      inventoryInId: inventoryInId.id,
      inventoryOutId: inventoryOutId.id,
      weightIn: values.weightIn * 1000 || undefined,
      weightOut: values.weightOut * 1000,
    };

    const res = await product.addCoalWashLog({ params });
    if (res.status === 0) {
      message.success('新增入库成功');
      onSubmit();
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setNewGoodsType(true);

    setTimeout(() => {
      setNewGoodsType(false);
    }, 1000);

    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const onChangeGoodsType = (e, val) => {
    if (val) {
      const item = val.item;

      form.setFieldsValue({
        inventoryInId: item.value,
      });
      setInventoryInId({
        goodsType: item.value,
        id: item.key,
      });
    } else {
      form.setFieldsValue({
        inventoryInId: undefined,
      });
      setGoodsType1({});
      setNewGoodsType(true);
      //搜索后需要重新调接口
      setTimeout(() => {
        setNewGoodsType(false);
      }, 1000);
    }
  };

  const onChangeGoodsType1 = (e, val) => {
    if (val) {
      const item = val.item;

      form.setFieldsValue({
        inventoryOutId: item.value,
      });
      setInventoryOutId({
        goodsType: item.value,
        id: item.key,
      });
    } else {
      form.setFieldsValue({
        inventoryOutId: undefined,
      });
      setInventoryOutId({});
      setNewGoodsType(true);
      //搜索后需要重新调接口
      setTimeout(() => {
        setNewGoodsType(false);
      }, 1000);
    }
  };

  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };

  return (
    <div className={styles.root}>
      <Form
        {...formItemLayout}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        form={form}
        initialValues={{}}
        hideRequiredMark={true}>
        <Form.Item
          label="选洗时间"
          name="changeTime"
          rules={[{ type: 'array', required: true, message: '请选择时间' }]}>
          <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>

        <Form.Item
          label="原煤名称"
          name="inventoryInId"
          rules={[
            {
              required: true,
              message: '请选择正确的原煤名称',
            },
          ]}
          validateFirst={true}>
          <AutoInputSelect
            style={{ width: 264 }}
            mode="goodsType"
            allowClear
            style={{ width: 200 }}
            placeholder="请选择原煤名称"
            onChange={onChangeGoodsType}
            newGoodsType={newGoodsType}
          />
        </Form.Item>

        <Form.Item
          label="原煤选洗量"
          name="weightIn"
          validateFirst={true}
          rules={[
            {
              required: true,
              message: '原煤选洗量不可为空',
            },
            {
              validator: (rule, value) => {
                if (+value > 0) {
                  const val = value && value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');

                  form.setFieldsValue({
                    weightIn: val,
                  });
                  return Promise.resolve();
                } else {
                  if (value === '') {
                    return;
                  }
                  const val = value && value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                  form.setFieldsValue({
                    weightIn: val,
                  });
                  return Promise.reject('请输入大于0的数字');
                }
              },
            },
          ]}>
          <Input
            style={{ width: 264 }}
            placeholder="请输入原煤选洗量"
            type="number"
            onKeyDown={handleKeyPress}
            addonAfter={<span style={{ color: '#BFBFBF' }}>吨</span>}
          />
        </Form.Item>
        <Form.Item
          label="精煤名称"
          name="inventoryOutId"
          rules={[
            {
              required: true,
              message: '请选择正确的精煤名称',
            },
          ]}
          validateFirst={true}>
          <AutoInputSelect
            mode="goodsType"
            allowClear
            style={{ width: 264 }}
            placeholder="请选择精煤名称"
            onChange={onChangeGoodsType1}
            newGoodsType={newGoodsType}
          />
        </Form.Item>
        <Form.Item
          label="精煤产出量"
          name="weightOut"
          rules={[
            {
              required: true,
              message: '精煤产出量不可为空',
            },
            {
              validator: (rule, value) => {
                if (!value) {
                  return Promise.resolve();
                } else if (+value > 0) {
                  const val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                  form.setFieldsValue({
                    weightOut: val,
                  });
                  return Promise.resolve();
                } else {
                  if (value === '') {
                    return Promise.resolve();
                  } else {
                    const val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                    form.setFieldsValue({
                      weightOut: val,
                    });
                    return Promise.reject('请输入大于0的数字');
                  }
                }
              },
            },
          ]}>
          <Input
            placeholder="请输入精煤产出量"
            type="number"
            onKeyDown={handleKeyPress}
            style={{ width: 264 }}
            addonAfter={<span style={{ color: '#BFBFBF' }}>吨</span>}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="default" onClick={onClose}>
            取消
          </Button>
          <Button size="default" type="primary" htmlType="submit" loading={loading} style={{ marginLeft: 8 }}>
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddcoalWashingFrom;
