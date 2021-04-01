import { Input, Button, Form, Row, Col, Select, message, DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import { inventory } from '@api';
import styles from './inventoryWater.less';
import moment from 'moment';
import { AutoInputSelect } from '@components';
const { Option } = Select;
const { TextArea } = Input;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 7 },
  wrapperCol: { span: 18 },
};

const formItemLayout1 = {
  labelAlign: 'left',
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};
const tailFormItemLayout = {
  wrapperCol: { offset: 22 },
};

const Index = ({ onClose, formData, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [fromCompany, setFromCompany] = useState({});
  const [newGoodsType, setNewGoodsType] = useState(false);
  const [newCompany, setNewCompany] = useState(false);
  const [goodsType, setGoodsType] = useState({});
  // 提交数据
  const onFinish = async values => {
    setLoading(true);

    const params = {
      changeTime: values.changeTime ? moment(values.changeTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
      addressCompanyId: fromCompany.id,
      type: values.type,

      unitPrice: values.unitPrice * 100 || undefined,
      remark: values.remark,
      num: values.num * 1000,
      inventoryId: goodsType.id,
    };

    const res = await inventory.addInventoryOut({ params });
    if (res.status === 0) {
      message.success('新增出库成功');
      onSubmit();
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setNewGoodsType(true);
    setNewCompany(true);

    setTimeout(() => {
      setNewGoodsType(false);
      setNewCompany(false);
    }, 1000);

    setLoading(false);
  };

  useEffect(() => {
    form.setFieldsValue({
      goodsType: formData && formData.goodsType,
    });
    setGoodsType({
      goodsType: formData && formData.goodsType,
      id: formData && formData.id,
    });
  }, [formData]);

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
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

  const onChangeGoodsType = (e, val) => {
    if (val) {
      const item = val.item;

      form.setFieldsValue({
        goodsType: item.value,
      });
      setGoodsType({
        goodsType: item.value,
        id: item.key,
      });
    } else {
      form.setFieldsValue({
        goodsType: undefined,
      });
      setGoodsType({});
      setNewGoodsType(true);
      //搜索后需要重新调接口
      setTimeout(() => {
        setNewGoodsType(false);
      }, 1000);
    }
  };

  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };

  return (
    <div className={styles.root}>
      <Form {...formItemLayout} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} initialValues={{}}>
        <Row gutter={36}>
          <Col span={12}>
            <Form.Item
              label="出库类型"
              name="type"
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: '请选择出库类型',
                },
              ]}>
              <Select placeholder="请选择出库类型">
                <Option value="MANUAL">手动出库</Option>
                <Option value="MANUAL_PRO">生产出库</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="货品名称"
              name="goodsType"
              rules={[
                {
                  required: true,
                  message: '请选择正确的货品名称',
                },
              ]}
              validateFirst={true}>
              <AutoInputSelect
                mode="goodsType"
                allowClear
                placeholder="请选择货品名称"
                onChange={onChangeGoodsType}
                newGoodsType={newGoodsType}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={36}>
          <Col span={12}>
            <Form.Item
              label="出库数量"
              name="num"
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: '出库数量不可为空',
                },
                {
                  validator: (rule, value) => {
                    if (+value > 0) {
                      const val = value && value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                      form.setFieldsValue({
                        num: val,
                      });
                      return Promise.resolve();
                    } else {
                      if (value === '') {
                        return;
                      }
                      const val = value && value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                      form.setFieldsValue({
                        num: val,
                      });
                      return Promise.reject('请输入大于0的数字');
                    }
                  },
                },
              ]}>
              <Input placeholder="请输入出库数量" type="number" onKeyDown={handleKeyPress} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginRight: 4,
                      visibility: 'hidden',
                    }}>
                    *
                  </span>
                  货物单价
                </div>
              }
              name="unitPrice"
              rules={[
                {
                  validator: (rule, value) => {
                    if (!value) {
                      return Promise.resolve();
                    } else if (+value > 0) {
                      const val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                      form.setFieldsValue({
                        unitPrice: val,
                      });
                      return Promise.resolve();
                    } else {
                      if (value === '') {
                        return Promise.resolve();
                      } else {
                        const val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                        form.setFieldsValue({
                          unitPrice: val,
                        });
                        return Promise.reject('请输入大于0的数字');
                      }
                    }
                  },
                },
              ]}>
              <Input
                placeholder="请输入货物单价"
                type="number"
                onKeyDown={handleKeyPress}
                addonAfter={<span style={{ color: '#BFBFBF' }}>元/吨</span>}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={36}>
          <Col span={12}>
            <Form.Item
              label={
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginRight: 4,
                      visibility: 'hidden',
                    }}>
                    *
                  </span>
                  供货单位
                </div>
              }
              name="companyName"
              rules={[
                {
                  required: false,
                },
              ]}>
              <AutoInputSelect
                mode="company"
                allowClear
                placeholder="请选择供货单位"
                value={fromCompany.companyName}
                onChange={(e, val) => {
                  onChangeFromCompany(e, val);
                }}
                newCompany={newCompany}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginRight: 4,
                      visibility: 'hidden',
                    }}>
                    *
                  </span>
                  出库时间
                </div>
              }
              name="changeTime"
              rules={[
                {
                  type: 'object',
                  required: false,
                  whitespace: true,
                  message: '内容不可为空',
                },
                {
                  transform: value => (value ? moment(value).format('YYYY-MM:DD HH:mm:ss') : ''),
                },
              ]}>
              <DatePicker
                placeholder="请选择时间"
                showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} className={styles.remark}>
            <Form.Item
              {...formItemLayout1}
              label={
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginRight: 4,
                      visibility: 'hidden',
                    }}>
                    *
                  </span>
                  备注
                </div>
              }
              name="remark"
              rules={[
                {
                  required: false,
                },
              ]}>
              <TextArea
                rows={3}
                placeholder="请输入300字以内"
                className={styles.textAreaText}
                maxLength={300}></TextArea>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 54 }}>
          <Button size="default" onClick={onClose}>
            取消
          </Button>
          <Button size="default" type="primary" htmlType="submit" loading={loading} style={{ marginLeft: 8 }}>
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Index;
