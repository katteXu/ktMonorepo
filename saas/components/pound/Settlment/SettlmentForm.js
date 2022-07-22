import { useState } from 'react';
import { Input, DatePicker, Button, Form } from 'antd';
import moment from 'moment';
import styles from './styles.less';

const { TextArea } = Input;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 7 },

  wrapperCol: { span: 16 },
};

const onFinishFailed = () => {
  console.log('Failed:', errorInfo);
};

const SettlmentForm = ({ formData = {}, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [checkLoading, setCheckLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // 仅结算
  const handleCheck = async () => {
    const formData = await form.validateFields();
    setCheckLoading(true);
    await onSubmit(formData);
    setCheckLoading(false);
  };

  // 结算并打款
  const handleCheckAndSubmit = async () => {
    const formData = await form.validateFields();
    setSubmitLoading(true);
    await onSubmit(formData, true);
    setSubmitLoading(false);
  };
  return (
    <Form
      className={styles.form}
      {...formItemLayout}
      onFinishFailed={onFinishFailed}
      form={form}
      initialValues={formData}>
      <Form.Item
        label="结算日期"
        name="payTime"
        rules={[
          {
            required: true,
            message: '结算日期不可为空',
          },
        ]}>
        <DatePicker
          showTime={{
            defaultValue: moment('00:00:00', 'HH:mm:ss'),
          }}
          style={{ width: 264 }}
        />
      </Form.Item>
      <Form.Item
        label="结算银行卡号"
        name="cardNumber"
        rules={[
          {
            required: true,
            message: '结算银行卡不可为空',
          },
        ]}>
        <Input placeholder="请输入结算银行卡号" style={{ width: 264 }} maxLength={20}></Input>
      </Form.Item>
      <Form.Item label="结算姓名" name="payName">
        <Input placeholder="请输入结算姓名" style={{ width: 200 }} maxLength={20}></Input>
      </Form.Item>
      <Form.Item
        label="结算手机号"
        name="payMobilNumber"
        rules={[
          {
            pattern: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
            message: '手机号格式不正确!',
          },
        ]}>
        <Input placeholder="请输入结算手机号" style={{ width: 200 }} maxLength={11}></Input>
      </Form.Item>
      <Form.Item label="备注" name="remark" rules={[]}>
        <TextArea placeholder="请输入备注" style={{ width: 264 }} />
      </Form.Item>

      <div style={{ textAlign: 'right' }}>
        <Button size="default" type="primary" ghost loading={checkLoading} onClick={handleCheck}>
          仅结算
        </Button>
        <Button
          size="default"
          type="primary"
          loading={submitLoading}
          style={{ marginLeft: 8 }}
          onClick={handleCheckAndSubmit}>
          结算并打款
        </Button>
      </div>
    </Form>
  );
};

export default SettlmentForm;
