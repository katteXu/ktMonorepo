import { Input, Button, Form } from 'antd';
import { useEffect, useState } from 'react';

const { TextArea } = Input;

const tyoe = {
  from: {},
};
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 3 },
  wrapperCol: { span: 20 },
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
      initialValues={{ remark: initValue }}
      hideRequiredMark={true}>
      <Form.Item
        label="备注"
        name="remark"
        validateFirst={true}
        rules={[
          {
            required: true,
            message: '请输入备注',
          },
          {
            max: 150,
            message: '备注的长度不能超过150',
          },
        ]}>
        <TextArea placeholder="请输入备注" style={{ resize: 'none', height: 32 }} />
      </Form.Item>

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Button onClick={onClose}>取消</Button>
        <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
          确定
        </Button>
      </div>
    </Form>
  );
};

export default UpdateForm;
