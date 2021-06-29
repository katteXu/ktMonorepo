import { useState, useCallback, useEffect } from 'react';
import styles from './index.less';
import { Input, Button, Select, Form, Popconfirm, message, Modal } from 'antd';
import { station } from '@api';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import router from 'next/router';
import { getQuery } from '@utils/common';
const truckTypeInfo = ['重型半挂牵引车', '重型自卸货车', '罐式货物运输车', '其他'];
const shaftNumberInfo = [2, 3, 4, 5, 6];
const truckLoadInfo = [49, 46, 43, 42, 36, 35, 31, 27, 25, 18];
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};
const Index = ({ truckDataInfo, onsubmit, onclose }) => {
  const [info, setInfo] = useState({});
  const [form] = Form.useForm();
  const { id } = getQuery();
  useEffect(() => {
    setInfo(truckDataInfo);
  }, [truckDataInfo]);

  const handleSubmit = async values => {
    Modal.confirm({
      title: '请核对以下信息，确保准确无误?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <div style={{ marginBottom: 16, color: '#333333' }}>
            <span style={{ width: 120, display: 'inline-block', color: '#666666' }}>司机姓名</span>
            {values.name}
          </div>
          <div style={{ marginBottom: 16, color: '#333333' }}>
            <span style={{ width: 120, display: 'inline-block', color: '#666666' }}>手机号</span>
            {info.mobile}
          </div>
          <div style={{ marginBottom: 16, color: '#333333' }}>
            <span style={{ width: 120, display: 'inline-block', color: '#666666' }}>驾驶证号</span>
            {values.driverNumber}
          </div>
          <div style={{ marginBottom: 16, color: '#333333' }}>
            <span style={{ width: 120, display: 'inline-block', color: '#666666' }}>从业资格证号</span>
            {values.qualificationNumber}
          </div>
        </div>
      ),
      onOk: async () => {
        const params = {
          truckerInfo: {
            ...values,
            status: false,
            mobile: info.mobile,
          },
          id: id,
        };
        const res = await station.updateInStationTruckOrTrucker({ params });
        if (res.status === 0) {
          onsubmit(values);
        } else {
          message.error(`${res.detail || res.description}`);
        }
      },
      onCancel() {
        console.log('Cancel');
      },
      okText: '确认提交',
      cancelText: '再核实下',
    });
  };

  return (
    <div className={styles.truckInfoError}>
      <Form {...formItemLayout} onFinish={handleSubmit} autoComplete="off" form={form} initialValues={{}}>
        <Form.Item
          label={
            <div style={{ display: 'inline-block' }}>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>手机号
            </div>
          }
          name="mobile"
          validateFirst={true}>
          <span>{info.mobile}</span>
        </Form.Item>
        <div className={styles.title}>驾驶证信息</div>
        <Form.Item
          label="姓名"
          name="name"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Input placeholder="请输入姓名" style={{ width: 264 }} />
        </Form.Item>
        <Form.Item
          label="驾驶证号"
          name="driverNumber"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Input placeholder="请输入驾驶证号" style={{ width: 264 }} />
        </Form.Item>

        <div className={styles.title}>从业资格证信息</div>
        <Form.Item
          label="从业资格证号"
          name="qualificationNumber"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Input placeholder="请输入从业资格证号" style={{ width: 264 }} />
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Button size="default" onClick={onclose}>
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
