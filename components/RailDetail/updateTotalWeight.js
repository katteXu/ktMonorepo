import { Input, Button, Form } from 'antd';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',

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
    <div>
      <Form
        className="small"
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        hideRequiredMark={true}>
        <Form.Item label="已发货">
          <span style={{ color: '#4a4a5a' }}>{initValue || '-'} 吨</span>
        </Form.Item>
        {/* 打印名称 */}
        <Form.Item
          label="货物总量"
          name="totalAmount"
          validateFirst={true}
          rules={[
            {
              required: true,
              message: '内容不可为空',
            },
            {
              pattern: /^\d+(\.?\d{1,2})?$/,
              message: '货物总量只能是数字，最多两位小数',
            },
          ]}>
          <Input
            placeholder="请输入货物总量"
            addonAfter={<span style={{ color: '#BFBFBF' }}>吨</span>}
            style={{ width: 264 }}
          />
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>取消</Button>
          <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
            确定
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateForm;
