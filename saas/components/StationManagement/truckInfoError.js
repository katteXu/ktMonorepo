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
  // labelCol: { span: 7 },
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
            <span style={{ width: 120, display: 'inline-block', color: '#666666' }}>车牌号</span>
            {info.trailerPlateNumber}
          </div>
          <div style={{ marginBottom: 16, color: '#333333' }}>
            <span style={{ width: 120, display: 'inline-block', color: '#666666' }}>行驶证档案编号</span>
            {values.truckLicenseNumber}
          </div>
          <div style={{ marginBottom: 16, color: '#333333' }}>
            <span style={{ width: 120, display: 'inline-block', color: '#666666' }}>道路运输证号</span>
            {values.roadNumber}
          </div>
        </div>
      ),
      onOk: async () => {
        const params = {
          truckInfo: {
            ...values,
            trailerPlateNumber: info.trailerPlateNumber,
            truckLoad: values.truckLoad * 1000,
            status: false,
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

  const handleOk = () => { };
  return (
    <div className={styles.truckInfoError}>
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        autoComplete="off"
        form={form}
        initialValues={{
          truckType: '重型半挂牵引车',
          shaftNumber: '6',
          truckLoad: '49',
        }}>
        <div className={styles.title}>行驶证信息</div>
        <Form.Item
          label={
            <div style={{ display: 'inline-block' }}>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>车牌号
            </div>
          }
          name=""
          validateFirst={true}>
          <span>{info.trailerPlateNumber}</span>
        </Form.Item>
        <Form.Item
          label="车辆类型"
          name="truckType"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Select placeholder="请选择车辆类型" style={{ width: 264 }}>
            {truckTypeInfo.map((item, key) => (
              <Option key={key} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="行驶证档案编号"
          name="truckLicenseNumber"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Input placeholder="请输入行驶证档案编号" style={{ width: 264 }} />
        </Form.Item>
        <Form.Item
          label="车辆轴数"
          name="shaftNumber"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Select placeholder="请选择车辆轴数" style={{ width: 264 }}>
            {shaftNumberInfo &&
              shaftNumberInfo.map((item, key) => (
                <Option key={key} value={item}>
                  {item}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="总质量限值"
          name="truckLoad"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Select placeholder="请选择总质量限值" style={{ width: 264 }}>
            {truckLoadInfo &&
              truckLoadInfo.map((item, key) => (
                <Option key={key} value={item}>
                  {item}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <div className={styles.title}>道路运输许可证信息</div>
        <Form.Item
          label="道路运输许可证"
          name="roadNumber"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Input placeholder="请输入道路运输许可证" style={{ width: 264 }} />
        </Form.Item>
        <Form.Item
          label="业户名称"
          name="businessName"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Input placeholder="请输入业户名称" style={{ width: 264 }} />
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
