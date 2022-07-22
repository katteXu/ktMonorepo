import { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';
import styles from './styles.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
// 数字验证
const num_rules = {
  rules: [
    {
      type: 'number',
      required: true,
      whitespace: true,
      message: '选项不可为空',
    },
    {
      type: 'number',
      message: '请输入有效的数字',
      transform: value => Number(value),
    },
  ],
};

const updateForm = ({ form, onSubmit, number }) => {
  const { getFieldDecorator } = form;

  const [amount, setAmount] = useState(number);

  const changeAmount = n => {
    setAmount(amount + n);
  };

  const handleSubmit = e => {
    e.preventDefault();

    form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
        return;
      }
      onSubmit(values);
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      amount,
    });
  }, [amount]);
  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item label="派车数量">
        {getFieldDecorator('amount', { ...num_rules, initialValue: number })(
          <Input
            style={{ width: 200 }}
            addonBefore={
              <span className={styles['sub-btn']} onClick={() => changeAmount(-1)}>
                -
              </span>
            }
            addonAfter={
              <span className={styles['add-btn']} onClick={() => changeAmount(1)}>
                +
              </span>
            }
          />
        )}
      </Form.Item>
      <Form.Item wrapperCol={{ span: 24 }}>
        <Button style={{ marginTop: 30, float: 'right' }} htmlType="submit" type="primary">
          确定提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Form.create({ name: 'updateDispatch' })(updateForm);
