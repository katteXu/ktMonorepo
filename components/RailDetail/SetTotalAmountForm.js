import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input } from 'antd';

const setTotalAmountForm = ({ form: { getFieldDecorator, validateFields }, loading, cancel, submit, unitName }) => {
  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, { newTotalAmount }) => {
      if (!err) {
        submit(newTotalAmount);
      }
    });
  };

  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  let defaultUnitName = unitName || '吨';

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item label="货物总量">
        {getFieldDecorator('newTotalAmount', {
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '请输入货物总量',
            },
            {
              pattern: defaultUnitName === '吨' ? /^\d+(\.\d{1,2})?$/ : /^\d+$/,
              message: defaultUnitName === '吨' ? '只能是数字，且最多两位小数' : '只能是整数',
            },
          ],
        })(<Input placeholder="请输入货物总量" addonAfter={defaultUnitName} />)}
      </Form.Item>

      <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'center' }}>
        <Button onClick={cancel}>取消</Button>
        <Button loading={loading} type="primary" htmlType="submit" style={{ marginLeft: 40 }}>
          确认修改
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Form.create()(setTotalAmountForm);
