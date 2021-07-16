import { useEffect, useState } from 'react';
import { Select, Input, Button, message, Modal, Form, Radio } from 'antd';
import { railWay, getGoodsType, getCommon } from '../../api';
import { QuestionCircleFilled } from '@ant-design/icons';
import { AutoInputSelect } from '@components';
import { User } from '@store';
import styles from './styles.less';
const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const config = [{ required: true, whitespace: true, message: '选项不可为空' }];

const CreateGoods = ({ close, onCreated }) => {
  const { userInfo, loading: userLoading } = User.useContainer();
  const [form] = Form.useForm();
  const [goodsTypes, setGoodsTypes] = useState([]);
  const [isShowWarehouse, setIsShowWarehouse] = useState(false);
  const [radioRawMaterial, setRadioRawMaterial] = useState();
  const [fromCompany, setFromCompany] = useState({});
  const [newCompany, setNewCompany] = useState(false);
  useEffect(() => {
    getGoodsTypes();
  }, []);

  useEffect(() => {
    if (!userLoading) {
      setHiddenDate();
    }
  }, [userLoading]);

  const setHiddenDate = async () => {
    const res = await getCommon();
    if (res.status === 0) {
      const currentUserName = userInfo.username;

      const hiddenWarehouseName = res.result.find(item => item.key === 'isShowSupplier').url;
      console.log(currentUserName);
      if (hiddenWarehouseName.includes(currentUserName)) {
        setIsShowWarehouse(true);
      }
    }
  };

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

  const onChangeFromCompany = (e, val) => {
    if (e) {
      const item = val.item;
      setFromCompany({
        id: item.key,
        companyName: item.value,
      });

      form.setFieldsValue({
        companyName: item.value,
      });
    } else {
      setFromCompany({
        companyName: undefined,
      });

      form.setFieldsValue({
        companyName: undefined,
      });
      setNewCompany(true);
      //搜索后需要重新调接口
      setTimeout(() => {
        setNewCompany(false);
      }, 1000);
    }
  };

  return (
    <div className={styles.createGoodsFrom}>
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
        {isShowWarehouse && (
          <Form.Item label="配煤原料" name="rawMaterial" rules={[{ required: true, message: '请选择配煤原料' }]}>
            <Radio.Group style={{ width: 264 }} onChange={e => setRadioRawMaterial(e.target.value)}>
              <Radio value={1}>是</Radio>
              <Radio value={0} style={{ marginLeft: 24 }}>
                否
              </Radio>
            </Radio.Group>
          </Form.Item>
        )}

        {isShowWarehouse && radioRawMaterial === 1 && (
          <Form.Item label="供应商" name="companyName" rules={[{ required: true, message: '请选择配煤原料' }]}>
            <AutoInputSelect
              mode="company"
              allowClear
              placeholder="请选择供应商"
              value={fromCompany.companyName}
              onChange={(e, val) => {
                onChangeFromCompany(e, val);
              }}
              newCompany={newCompany}
              style={{ width: 264 }}
            />
          </Form.Item>
        )}
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
