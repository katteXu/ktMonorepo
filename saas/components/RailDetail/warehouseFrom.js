import { Component, useEffect, useState } from 'react';
import { Select, Input, Button, message, Modal, Form } from 'antd';
import { railWay, inventory } from '../../api';
import { QuestionCircleFilled } from '@ant-design/icons';
// import styles from './createGoods.less';
const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const config = [{ required: true, whitespace: true, message: '选项不可为空' }];

const Index = ({ close, onSubmit, currentData }) => {
  const [form] = Form.useForm();
  const [goodsTypes, setGoodsTypes] = useState([]);
  useEffect(() => {}, []);

  const handleSubmit = async values => {
    const params = {
      ...values,
      wareHouseId: currentData ? currentData.id : null,
    };

    const res = currentData ? await inventory.editWareHouse({ params }) : await inventory.addWareHouse({ params });

    if (res.status === 0) {
      message.success(currentData ? '编辑仓库成功' : '新增仓库成功');
      onSubmit();
    } else {
      message.error(res.detail || res.description);
    }
  };

  return (
    <div>
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        autoComplete="off"
        form={form}
        initialValues={{
          wareHouseName: currentData ? currentData.name : '',
        }}>
        <Form.Item
          label="仓库名称"
          name="wareHouseName"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            // { pattern: /^[ 0-9a-zA-Z\u4e00-\u9fa5 ]+$/, message: '内容只能是数字、字母或汉字' },
          ]}>
          <Input placeholder="请输入仓库名称" style={{ width: 264 }} maxLength={25} />
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

export default Index;
