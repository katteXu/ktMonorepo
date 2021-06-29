import { Input, Button, Form } from 'antd';
import { useState } from 'react';
import styles from './styles.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};

const onFinishFailed = () => {
  console.log('Failed:', errorInfo);
};

const EditPriceForm = ({ onClose, onSubmit, lableTitle }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    const formData = await form.validateFields();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };

  return (
    <Form {...formItemLayout} onFinishFailed={onFinishFailed} form={form} autoComplete="off">
      <Form.Item
        label={lableTitle}
        name="unitPrice"
        rules={[
          {
            required: true,
            message: '单价不可为空',
          },
          {
            validator: (rule, value) => {
              if (!value) {
                return Promise.resolve();
              } else if (+value > 0) {
                const val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                form.setFieldsValue({
                  unitPrice: val,
                });
                return Promise.resolve();
              } else {
                if (value === '') {
                  return Promise.resolve();
                } else {
                  const val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                  form.setFieldsValue({
                    unitPrice: val,
                  });
                  return Promise.reject('请输入大于0的数字');
                }
              }
            },
          },
        ]}>
        <Input
          placeholder="请输入单价"
          style={{ width: 264 }}
          addonAfter="元/吨"
          onKeyDown={handleKeyPress}
          type="number"
        />
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
