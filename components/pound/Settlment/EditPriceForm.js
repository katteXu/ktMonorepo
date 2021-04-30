import { Input, Button, Form } from 'antd';
import { useState } from 'react';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const onFinishFailed = () => {
  console.log('Failed:', errorInfo);
};

const EditPriceForm = ({ onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    const formData = await form.validateFields();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <Form {...formItemLayout} onFinishFailed={onFinishFailed} form={form} autoComplete="off">
      <Form.Item
        label="单价"
        name="unitPrice"
        rules={[
          {
            required: true,
            message: '运费单价不可为空',
          },
          {
            pattern: /^\d+(\.?\d{1,2})?$/,
            message: '运费单价只能是数字且最多两位小数',
          },
        ]}>
        <Input placeholder="请输入单价" style={{ width: 264 }} addonAfter="元/吨"></Input>
      </Form.Item>

      <div style={{ textAlign: 'right' }}>
        <Button onClick={onClose}>取消</Button>
        <Button loading={loading} style={{ marginLeft: 8 }} size="default" type="primary" onClick={handleSubmit}>
          确认
        </Button>
      </div>
    </Form>
  );
};

export default EditPriceForm;
