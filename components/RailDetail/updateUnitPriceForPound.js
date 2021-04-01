import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';

// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

const UpdateForm = ({ form, onSubmit, onClose, initValue }) => {
  const { getFieldDecorator, getFieldValue } = form;

  const handleSubmit = e => {
    e.preventDefault();

    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        console.log(err);
        return;
      }

      onSubmit && onSubmit(values);
    });
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit} autoComplete="off" hideRequiredMark={true}>
      <div style={{ color: 'rgba(0, 0, 0, 0.85)', marginBottom: 14 }}>
        <span style={{ display: 'inline-block', textAlign: 'right' }}>当前单价：</span>
        <span>{initValue || '-'} 元/吨</span>
      </div>
      {/* 打印名称 */}
      <Form.Item label="新的单价">
        {getFieldDecorator('unitPrice', {
          validateFirst: true,
          rules: [
            {
              required: true,
              message: '内容不可为空',
            },
            {
              pattern: /^\d+(\.?\d{1,2})?$/,
              message: '单价金额只能是数字且最多两位小数',
            },
          ],
        })(<Input style={{ width: 361 }} placeholder="请输入运费单价" suffix={'元/吨'} />)}
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

export default Form.create({ name: 'update' })(UpdateForm);
