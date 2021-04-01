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
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      initialValues={{
        totalWeight: initValue,
      }}
      hideRequiredMark={true}>
      {/* 打印名称 */}
      <Form.Item
        label="货物总量"
        name="totalWeight"
        validateFirst={true}
        rules={[
          {
            required: true,
            message: '选项不可为空',
          },
          {
            pattern: /^\d+(\.?\d{1,2})?$/,
            message: '货物总量只能是数字，最多两位小数',
          },
          {
            validator: (rule, value) => {
              if (+value > 0) {
                return Promise.resolve();
              } else {
                return Promise.reject('内容必须大于0');
              }
            },
          },
        ]}>
        <Input placeholder="请输入货物总量" suffix="吨" style={{ width: 361 }} />
      </Form.Item>

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
