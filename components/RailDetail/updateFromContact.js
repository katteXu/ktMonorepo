import { Input, Button, Form } from 'antd';
import { useEffect, useState } from 'react';

const tyoe = {
  from: {},
};
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const UpdateForm = ({ onSubmit, onClose, initValue, fromType }) => {
  const handleSubmit = values => {
    onSubmit && onSubmit(values);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      {...formItemLayout}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      initialValues={initValue}
      hideRequiredMark={true}>
      <Form.Item
        label={'联系人'}
        name="name"
        validateFirst={true}
        rules={[
          {
            required: true,
            message: '请输入联系人的姓名',
          },
          {
            pattern: /^[\u4e00-\u9fa5]+$/,
            message: '姓名只能是汉字',
          },
          {
            min: 2,
            message: '姓名至少 2 个字符',
          },
          {
            max: 10,
            message: '联系人姓名的长度不能超过10',
          },
        ]}>
        <Input placeholder="请输入联系人姓名" />
      </Form.Item>
      {/* 打印名称 */}
      <Form.Item
        label={'联系人电话'}
        name="mobile"
        validateFirst={true}
        rules={[
          {
            required: true,
            message: '请输入联系人的电话',
          },
          {
            pattern: /^\d+$|^\d+[.]?\d+$/,
            message: '电话只能输入数字',
          },
        ]}>
        <Input placeholder="请输入联系人电话" />
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
