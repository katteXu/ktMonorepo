import { useState } from 'react';
import { Input, Button, DatePicker, Row, Col, Form } from 'antd';
import moment from 'moment';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const UpdateForm = ({ onSubmit, onClose, initValue }) => {
  const [form] = Form.useForm();

  const handleSubmit = values => {
    const isTime = moment().format('YYYY-MM-DD') === moment(values.effectiveDateFrom).format('YYYY-MM-DD');
    const params = {
      effectiveDateFrom: isTime
        ? moment().format('YYYY-MM-DD HH:mm:ss')
        : moment(values.effectiveDateFrom).format('YYYY-MM-DD 00:00:00'),
    };

    onSubmit && onSubmit(params);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      {...formItemLayout}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}
      initialValues={{
        effectiveDateFrom: moment(initValue),
      }}
      form={form}
      autoComplete="off">
      <Form.Item
        label="生效时间"
        name="effectiveDateFrom"
        rules={[
          { type: 'object', required: true, whitespace: true, message: '内容不可为空' },
          {
            transform: value => (value ? moment(value).format('YYYY-MM:DD') : ''),
          },
        ]}>
        <DatePicker
          style={{ width: '100%' }}
          disabledDate={date => date < moment().add(-1, 'day')}
          placeholder="请选择生效时间"
          format="YYYY-MM-DD"
        />
      </Form.Item>

      <div style={{ textAlign: 'right' }}>
        <Button onClick={onClose}>取消</Button>
        <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
          确定
        </Button>
      </div>
    </Form>
  );
};

export default UpdateForm;
