import { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Select } from 'antd';
import { railWay } from '@api';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

// 数字验证
const num_rules = {
  rules: [
    { required: true, whitespace: true, message: '选项不可为空' },
    { type: 'number', message: '请输入有效的数字', transform: value => Number(value) },
  ],
};

// 下拉验证
const select_rules = {
  rules: [{ required: true, type: 'object', whitespace: true, message: '选项不可为空' }],
};

const createForm = ({ form, onSubmit }) => {
  const { getFieldDecorator } = form;

  const [fleetList, setFleetList] = useState([]);
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

  // 初始化加载
  useEffect(() => {
    (async () => {
      const res = await railWay.getFleetListForForm();
      if (res.status === 0) {
        const fleetList = res.result.filter(item => item.status === 'LEISURE'); //过滤掉已派车队
        setFleetList(fleetList);
      }
    })();
  }, []);
  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>派车数量
          </div>
        }
        // label="派车数量"
      >
        {getFieldDecorator('amount', num_rules)(<Input placeholder="请输入派车数量" />)}
      </Form.Item>
      <Form.Item
        label={
          <div>
            <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>车队
          </div>
        }
        // label="车队"
      >
        {getFieldDecorator(
          'fleetId',
          select_rules
        )(
          <Select placeholder="请选择车队" style={{ width: '100%' }} labelInValue>
            {fleetList.map((item, index) => (
              <Select.Option value={`${item.id}`} key={index}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
      <Button style={{ marginTop: 30 }} block size="large" htmlType="submit" type="primary">
        确认提交
      </Button>
    </Form>
  );
};

export default Form.create({ name: 'createDispatch' })(createForm);
