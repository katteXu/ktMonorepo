import { Input, Button, Form } from 'antd';

// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

const UpdateForm = ({ onSubmit, onClose, initValue }) => {
  const handleSubmit = values => {
    onSubmit && onSubmit(values);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      {...formItemLayout}
      hideRequiredMark={true}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}
      autoComplete="off">
      <div style={{ color: 'rgba(0, 0, 0, 0.85)', marginBottom: 14 }}>
        <span style={{ display: 'inline-block', textAlign: 'right' }}>当前单价：</span>
        <span>{initValue || '-'} 元/吨</span>
      </div>
      {/* 打印名称 */}
      <Form.Item
        label="新的单价"
        name="unitPrice"
        validateFirst={true}
        rules={[
          {
            required: true,
            message: '内容不可为空',
          },
          {
            pattern: /^\d+(\.?\d{1,2})?$/,
            message: '单价金额只能是数字且最多两位小数',
          },
        ]}>
        <Input style={{ width: 361 }} placeholder="请输入运费单价" suffix={'元/吨'} />
      </Form.Item>
      <p style={{ fontSize: 14, color: '#848485', marginBottom: 0 }}>单价修改说明：</p>
      <p style={{ fontSize: 14, color: '#848485', marginTop: 8, marginBottom: 30 }}>
        修改后抢单的司机将会以修改后的单价进行抢单结算
        <br />
        <span style={{ color: 'red' }}>已抢单</span>的司机运费单价<span style={{ color: 'red' }}>不会变更</span>
        依旧为抢单时的运费单价
        <br />
        若出现司机抢错单价的情况可以在结算时跟司机协商更换结算单价。
      </p>
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
