import { useEffect, useState } from 'react';
import { Select, Input, Button, message, Modal, Form } from 'antd';
import { railWay, getGoodsType } from '../../api';
import { QuestionCircleFilled } from '@ant-design/icons';
const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const config = [{ required: true, whitespace: true, message: '选项不可为空' }];

const CreateGoods = ({ close, onCreated }) => {
  const [form] = Form.useForm();
  const [goodsTypes, setGoodsTypes] = useState([]);
  useEffect(() => {
    getGoodsTypes();
  }, []);

  const getGoodsTypes = async () => {
    const { status, result, detail, description } = await getGoodsType();
    if (!status) {
      setGoodsTypes(result);
    } else {
      message.error(detail || description);
    }
  };

  const handleSubmit = async values => {
    const params = {
      ...values,
    };

    const res = await railWay.createGoods({ params });

    if (res.status === 0) {
      // message.success('货品添加成功');
      Modal.confirm({
        title: '货品添加成功',
        content: '是否继续添加？',
        icon: <QuestionCircleFilled />,
        onOk: () => {
          form.resetFields();
        },
        onCancel: () => {
          if (typeof close === 'function') {
            form.resetFields();
            close();
          }
        },
      });
      if (typeof onCreated === 'function') {
        onCreated();
      }
    } else {
      message.error(detail || description);
    }
  };

  return (
    <div>
      <Form {...formItemLayout} onFinish={handleSubmit} autoComplete="off" form={form}>
        <Form.Item label="货物类型" name="goodsType" rules={config}>
          <Select placeholder="请选择货物类型" style={{ width: 264 }}>
            {goodsTypes &&
              goodsTypes.map(({ key, name }) => (
                <Option key={key} value={key}>
                  {name}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="货品名称"
          name="goodsName"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            { pattern: /^[ 0-9a-zA-Z\u4e00-\u9fa5 ]+$/, message: '内容只能是数字、字母或汉字' },
          ]}>
          <Input placeholder="请输入货品名称" style={{ width: 264 }} />
        </Form.Item>
        <Form.Item
          name="goodsCode"
          label={
            <div style={{ display: 'inline-block' }}>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>货品编码
            </div>
          }>
          <Input placeholder="请输入货品编码" style={{ width: 200 }} />
        </Form.Item>
        <div style={{ textAlign: 'right' }}>
          <Button size="default" onClick={close}>
            取消
          </Button>
          <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateGoods;
