import { Component, useEffect, useState } from 'react';
import { Select, Input, Button, message, Modal, Form } from 'antd';
import { inventory, getListGoods } from '../../../api';
import { QuestionCircleFilled } from '@ant-design/icons';
import styles from './index.less';
const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const Index = ({ close, formData, submit, type }) => {
  const [form] = Form.useForm();
  const [goodsTypes, setGoodsTypes] = useState([]);
  useEffect(() => {
    getGoodsTypes();
  }, []);

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      console.log(formData);
      let a = formData.inventoryIds.replace(/\s+/g, ',');

      form.setFieldsValue({
        mainInventoryId: formData.mainInventoryId,
        inventoryIds: a.split(','),
      });
    }
  }, [formData]);

  const getGoodsTypes = async () => {
    const { status, result, detail, description } = await getListGoods();
    if (!status) {
      setGoodsTypes(result);
    } else {
      message.error(detail || description);
    }
  };

  const handleSubmit = async values => {
    console.log(values.inventoryIds);
    const params = {
      mainInventoryId: type === 'add' ? values.mainInventoryId : formData.mainInventoryId,
      inventoryIds: values.inventoryIds.join(' '),
    };

    const res = await inventory.addEditMatterRelationship({ params });

    if (res.status === 0) {
      message.success(type === 'add' ? '新增成功' : '编辑成功');
      submit();
    } else {
      message.error(res.detail || res.description);
    }
  };

  return (
    <div className={styles.form}>
      <Form {...formItemLayout} onFinish={handleSubmit} autoComplete="off" form={form}>
        {type === 'add' && (
          <Form.Item label="实际货品名称" name="mainInventoryId" rules={[{ required: true, message: '选项不可为空' }]}>
            <Select
              placeholder="请选择实际货品名称"
              style={{ width: 264 }}
              optionFilterProp="children"
              showSearch={true}>
              {goodsTypes &&
                goodsTypes.map(({ goodsName, id }, key) => (
                  <Option value={id} key={key}>
                    {goodsName}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          label="货品名称"
          name="inventoryIds"
          rules={[{ type: 'array', required: true, message: '选项不可为空' }]}>
          <Select
            placeholder="请选择货品名称"
            style={{ width: 264 }}
            mode="multiple"
            optionFilterProp="children"
            showSearch={true}>
            {goodsTypes &&
              goodsTypes.map(({ goodsName, id }, key) => (
                <Option key={key} value={id + ''}>
                  {goodsName}
                </Option>
              ))}
          </Select>
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
