import { useState } from 'react';
import { Input, Button, DatePicker, Row, Col, Form } from 'antd';
import moment from 'moment';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const UpdateForm = ({ onSubmit, onClose, startLoadTime, initValue }) => {
  const [form] = Form.useForm();

  const handleSubmit = values => {
    const params = {
      effectiveDateTo: moment(values.effectiveDateTo).format('YYYY-MM-DD HH:mm:ss'),
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
        effectiveDateTo: moment(initValue),
      }}
      form={form}
      autoComplete="off">
      <Form.Item
        label="有效期至"
        name="effectiveDateTo"
        validateFirst={true}
        rules={[{ required: true, message: '有效期至不可为空' }]}>
        <DatePicker
          style={{ width: '100%' }}
          showToday={false}
          placeholder="有效期至"
          disabledDate={date => date < moment(startLoadTime)}
          showNow={false}
        />
      </Form.Item>

      {/* </Form.Item> */}
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
