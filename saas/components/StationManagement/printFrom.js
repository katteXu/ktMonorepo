import { Component, useEffect, useState } from 'react';
import { Select, Input, Button, message, Modal, Form, Checkbox } from 'antd';
import { station } from '../../api';

const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const truckType = {
  FRONT: '正翻',
  SIDE: '侧翻',
  BACK: '平板',
};

const Index = ({ close, onSubmit }) => {
  const [form] = Form.useForm();
  const [allType, setAllType] = useState([]);
  useEffect(() => {
    getHandling();
  }, []);

  const getHandling = async () => {
    const res = await station.getHandlingCharges();
    if (res.status === 0) {
      setAllType(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const handleSubmit = async values => {
    onSubmit(values);
  };

  const onSelect = (e, key) => {
    allType.map((item, index) => {
      if (index == e) {
        form.setFieldsValue({
          price: (item.price / 100).toFixed(0),
          load_truck_type: truckType[item.type],
        });
      }
    });
  };

  return (
    <div>
      <Form {...formItemLayout} onFinish={handleSubmit} autoComplete="off" form={form}>
        <Form.Item
          label="装车类型"
          name="load_truck_type"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Select
            placeholder="请选择装车类型"
            style={{ width: 264 }}
            // onChange={e => loadTruckType(e, price)}
            onSelect={onSelect}>
            {allType &&
              allType.map((item, index) => {
                return (
                  <Option key={index} value={`${index}`} label={truckType[item.type]} labelInValue>
                    {`${truckType[item.type]}${(item.price / 100).toFixed(0)}`}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item
          label="装车费用"
          name="price"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            { pattern: /^\d+$/, message: '内容只能是整数' },
          ]}>
          <Input placeholder="请输入装车费用" style={{ width: 264 }} type="number" />
        </Form.Item>
        <Form.Item label="是否打印" name="print" valuePropName="checked">
          <Checkbox>是否打印</Checkbox>
        </Form.Item>
        <div style={{ textAlign: 'right' }}>
          <Button size="default" onClick={close}>
            取消
          </Button>
          <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Index;
