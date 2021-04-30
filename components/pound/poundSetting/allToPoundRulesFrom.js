import { Input, Button, Form, Select, Checkbox, message } from 'antd';
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
  wrapperCol: { span: 24 },
};

const Index = ({ formData, onSubmit }) => {
  const [radioValue, setRadioValue] = useState();
  const [selectValue, setSelectValue] = useState();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [reduceCheck, setReduceCheck] = useState(false);
  const [abateMethodCheck, setAbateMethodCheck] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  // 提交数据
  const onFinish = async values => {
    // values.abateMethod = values.abateMethod ? 1 : 0;
    setLoading(true);

    const params = {
      ...values,
      receiveOrSend: 1,
      amount: values.amount ? values.amount * 1000 : undefined,
      abateMethod: values.abateMethod ? 1 : 0,
      abateThreshold: values.abateThreshold * 1000 || 0,
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
        abateMethod: formData.abateMethod ? 1 : 0,
        abateThreshold: formData.abateThreshold ? (formData.abateThreshold / 1000).toFixed(2) : '',
      });
      formData.abateThreshold > 0 ? setReduceCheck(true) : setReduceCheck(false);
      setShowCheck(formData.plusOrReduce);
    } else {
      form.setFieldsValue({
        plusOrReduce: undefined,
        amount: '',
        abateMethod: '',
        abateThreshold: '',
      });
      setReduceCheck(false);
      setShowCheck(true);
    }
  }, [formData]);

  const reduceTules = e => {
    setReduceCheck(e.target.checked);
    if (e.target.checked) {
      //为了将红框消失
      form.setFieldsValue({
        amount: 0,
      });
      form.setFieldsValue({
        amount: '',
      });
    }
    if (!e.target.checked) {
      form.setFieldsValue({
        abateThreshold: '',
        amount: '',
      });
    }
  };

  const abateMethodCheckrules = e => {
    setAbateMethodCheck(e.target.checked);
  };

  const plusOrReduceOnChange = e => {
    setSelectValue(e);
    setShowCheck(e);
    form.setFieldsValue({ abateMethod: false, abateThreshold: '' });
    if (e) {
      setReduceCheck(false);
      setAbateMethodCheck(false);
    }
  };

  useEffect(() => {
    setRadioValue();
    setSelectValue();
  }, [radioValue, selectValue]);

  //清除设置
  const clearSet = async () => {
    const params = {
      receiveOrSend: 1,
    };
    const { status, result, detail, description } = await pound.deleteGlobalPoundWeightDiff({ params });
    if (!status) {
      message.success('清除设置成功');
      form.setFieldsValue({
        plusOrReduce: undefined,
        amount: '',
        abateMethod: 0,
        abateThreshold: '',
      });
      setReduceCheck(false);
      setAbateMethodCheck(false);
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
        initialValues={{}}>
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
            <Select placeholder="请选择取重规则" onChange={plusOrReduceOnChange}>
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
              disabled={reduceCheck ? true : false}
            />
          </Form.Item>
        </div>
        {!showCheck && (
          <Form.Item label="" name="abateMethod" valuePropName="checked" style={{ marginLeft: 69 }}>
            <Checkbox onChange={abateMethodCheckrules} checked={abateMethodCheck}>
              当实收大于原发时,以原发净重进行扣减
            </Checkbox>
          </Form.Item>
        )}

        {!showCheck && (
          <Form.Item label="" {...formRoute} rules={[]} style={{ marginLeft: 69 }}>
            <Checkbox onChange={reduceTules} checked={reduceCheck}>
              当原发净重减实收净重大于等于
              <Form.Item
                name="abateThreshold"
                noStyle
                validateFirst={true}
                rules={[
                  {
                    required: reduceCheck ? true : false,
                    message: '不可为空',
                  },
                  {
                    validator: (rule, value) => {
                      if (reduceCheck) {
                        if (+value > 0) {
                          if (/^((0\.((0[1-9])|([1-9]\d?)))|((\.[\d]{1,2})?)|(1(\.0{1,2})?))$/.test(value)) {
                            return Promise.resolve();
                          } else {
                            return Promise.reject('请输入0~1之间的数字');
                          }
                        } else {
                          return Promise.reject('请输入0~1之间的数字');
                        }
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}>
                <Input placeholder="" style={{ width: 96, margin: '0 4px' }} disabled={reduceCheck ? false : true} />
              </Form.Item>
              吨时,不再执行减扣规则,否则以设置的值进行减扣
            </Checkbox>
          </Form.Item>
        )}
        <div style={{ marginLeft: 69 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
          <Button onClick={clearSet} style={{ marginLeft: 8 }}>
            清除设置
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Index;
