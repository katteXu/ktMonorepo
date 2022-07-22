import { Input, Button, Form, Select, message } from 'antd';
import { useState, useEffect } from 'react';
import styles from '../styles.less';
import { pound } from '@api';
const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const formRoute = {
  wrapperCol: { span: 19 },
};

const Index = ({ formData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 提交数据
  const onFinish = async values => {
    setLoading(true);
    const params = {
      ...values,
      receiveOrSend: 0,
      amount: values.amount ? values.amount * 1000 : undefined,
    };

    const { status, result, detail, description } = await pound.setGlobalPoundWeightDiff({ params });
    if (!status) {
      message.success('设置成功');
    } else {
      message.error(detail || description);
    }
    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      form.setFieldsValue({
        plusOrReduce: formData.plusOrReduce ? 1 : 0,
        amount: formData.amount ? (formData.amount / 1000).toFixed(2) : '',
      });
    } else {
      form.setFieldsValue({
        plusOrReduce: undefined,
        amount: '',
      });
    }
  }, [formData]);

  //清除设置
  const clearSet = async () => {
    const params = {
      receiveOrSend: 0,
    };
    const { status, result, detail, description } = await pound.deleteGlobalPoundWeightDiff({ params });
    if (!status) {
      message.success('清除设置成功');
      form.setFieldsValue({
        plusOrReduce: undefined,
        amount: '',
      });
    } else {
      message.error(detail || description);
    }
  };

  return (
    <div className={styles.formDataStyle}>
      <Form
        form={form}
        {...formItemLayout}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        hideRequiredMark={true}
        initialValues={{
          plusOrReduce: formData && formData.plusOrReduce,
          amount: formData && formData.amount,
        }}>
        <div style={{ width: 335 }}>
          <Form.Item
            label="取重规则"
            name="plusOrReduce"
            rules={[
              {
                required: true,
                message: '取重规则不可为空',
              },
            ]}>
            <Select placeholder="请选择取重规则">
              <Option value={0}>减扣</Option>
              <Option value={1}>增加</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="重量"
            name="amount"
            style={{ textAlign: 'left' }}
            rules={[
              {
                required: false,
                message: '重量不可为空',
              },
              {
                pattern: /^((0\.((0[1-9])|([1-9]\d?)))|((\.[\d]{1,2})?)|(1(\.0{1,2})?))$/,
                // pattern: /^(0(\.\d{1,2})?|1(\.0{1,2})?)$/,
                message: '请输入0~1之间的数字',
              },
            ]}>
            <Input
              placeholder="请输入0~1之间的数字"
              addonAfter={
                <span
                  style={{
                    background: ' #F6F7F9',
                    color: '#BFBFBF',
                  }}>
                  吨
                </span>
              }
            />
          </Form.Item>
        </div>
        <div style={{ marginLeft: 69 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={clearSet}>
            清除设置
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Index;
