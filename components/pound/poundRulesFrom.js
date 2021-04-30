import { Input, Button, Form, Radio, Select, Drawer, Checkbox } from 'antd';
import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import styles from './styles.less';
import ChooseRouteModal from './chooseRouteModal';
import { ChildTitle } from '@components';
const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

const formRoute = {
  wrapperCol: { span: 24 },
};

const Index = ({ formData, onSubmit, onClose, userId }) => {
  const [radioValue, setRadioValue] = useState();
  const [selectValue, setSelectValue] = useState();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showChooseRouteModal, setShowChooseRouteModal] = useState(false);
  const [routeInfo, setRouteInfo] = useState({
    fromCompany: '',
    toCompany: '',
    goodsType: '',
    routeId: '',
  });
  const [isShowRoute, setIsShowRoute] = useState(false);
  const [reduceCheck, setReduceCheck] = useState(false);
  const [abateMethodCheck, setAbateMethodCheck] = useState(false);

  // 提交数据
  const onFinish = values => {
    values.abateMethod = values.abateMethod ? 1 : 0;
    setLoading(true);
    if (typeof onSubmit === 'function') {
      onSubmit(values, routeInfo.routeId);
    }
    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const handleSureChooseRoute = (id, fromCompany, toCompany, goodsType, unitPrice) => {
    setIsShowRoute(true);
    setShowChooseRouteModal(false);
    form.setFieldsValue({
      routeId: id,
    });
    setRouteInfo({
      fromCompany,
      toCompany,
      goodsType,
      routeId: id,
    });
  };

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      setIsShowRoute(true);

      setRouteInfo({
        fromCompany: formData.fromCompany,
        toCompany: formData.toCompany,
        goodsType: formData.goodsType,
        routeId: formData.routeId,
      });
      console.log(formData.abateThreshold);
      form.setFieldsValue({
        receiveOrSend: formData.receiveOrSend ? 1 : 0,
        plusOrReduce: formData.plusOrReduce ? 1 : 0,
        amount: formData.amount ? (formData.amount / 1000).toFixed(2) : '',
        abateMethod: formData.abateMethod ? 1 : 0,
        abateThreshold: formData.abateThreshold ? (formData.abateThreshold / 1000).toFixed(2) : '',
      });
      formData.abateThreshold > 0 ? setReduceCheck(true) : setReduceCheck(false);
    } else {
      setIsShowRoute(false);
      setRouteInfo({});
      form.setFieldsValue({
        receiveOrSend: '',
        plusOrReduce: undefined,
        amount: '',
        abateMethod: '',
        abateThreshold: '',
      });
      setReduceCheck(false);
    }
  }, [formData]);

  const reduceTules = e => {
    setReduceCheck(e.target.checked);
    if (!e.target.checked) {
      form.setFieldsValue({
        abateThreshold: '',
      });
    }
  };

  const abateMethodCheckrules = e => {
    setAbateMethodCheck(e.target.checked);
  };

  const plusOrReduceOnChange = e => {
    setSelectValue(e);

    form.setFieldsValue({ abateMethod: false, abateThreshold: '' });
    if (e) {
      setReduceCheck(false);
      setAbateMethodCheck(false);
    }
  };

  const receiveOrSendOnChange = e => {
    setRadioValue(e.target.value);
    form.setFieldsValue({ abateMethod: false, abateThreshold: '' });
    if (e) {
      setReduceCheck(false);
      setAbateMethodCheck(false);
    }
  };

  useEffect(() => {
    setRadioValue();
    setSelectValue();
  }, [radioValue, selectValue]);

  return (
    <div>
      <Form
        form={form}
        {...formItemLayout}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        hideRequiredMark={true}
        initialValues={{
          receiveOrSend: formData && formData.receiveOrSend,
          plusOrReduce: formData && formData.plusOrReduce,
          amount: formData && formData.amount,
          abateMethod: formData && formData.abateMethod ? 1 : 0,
        }}>
        <div className={styles['topContent']}>
          <div className={styles['title']}>
            <ChildTitle className="hei14">专线信息</ChildTitle>
            {isShowRoute && (
              <span className={styles['replace']} onClick={() => setShowChooseRouteModal(true)}>
                更换
              </span>
            )}
          </div>
          {isShowRoute ? (
            <div className={styles['routeInfo']}>
              <div className={styles['rowBox']}>
                <div className={styles['row']} style={{ marginRight: 50 }}>
                  <label className={styles['rowLable']}>发货企业:</label>
                  <span>{routeInfo.fromCompany}</span>
                </div>
                <div className={styles['row']}>
                  <label className={styles['rowLable']}>收货企业:</label>
                  <span>{routeInfo.toCompany}</span>
                </div>
              </div>
              <div className={styles['row']}>
                <label className={styles['rowLable']}>货品名称:</label>
                <span>{routeInfo.goodsType}</span>
              </div>
            </div>
          ) : (
            <div className={styles['btn-add']} style={{ textAlign: 'center' }}>
              <Form.Item
                {...formRoute}
                name="routeId"
                rules={[{ required: true, whitespace: true, message: '专线不可为空' }]}>
                <Button style={{ width: 218 }} onClick={() => setShowChooseRouteModal(true)} ghost>
                  <PlusOutlined />
                  请选择专线
                </Button>
              </Form.Item>
            </div>
          )}
        </div>

        <div className={styles['titleSetting']}>
          <ChildTitle className="hei14" style={{ height: 23 }}>
            磅差设置
          </ChildTitle>
        </div>
        <div style={{ paddingLeft: 11 }} className={styles['poundDiff']}>
          <Form.Item label="过磅场景" name="receiveOrSend" rules={[{ required: true, message: '请选择过磅场景' }]}>
            <Radio.Group onChange={receiveOrSendOnChange}>
              <Radio value={0}>发货</Radio>
              <Radio value={1}>收货</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="取重规则"
            name="plusOrReduce"
            rules={[
              {
                required: true,
                message: '取重规则不可为空',
              },
            ]}>
            <Select placeholder="请选择取重规则" onChange={plusOrReduceOnChange} style={{ width: 264 }}>
              <Option value={0}>减扣</Option>
              <Option value={1}>增加</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="重量"
            name="amount"
            style={{ textAlign: 'left' }}
            rules={[
              {
                required: false,
                message: '重量不可为空',
              },
              {
                pattern: /^((0\.((0[1-9])|([1-9]\d?)))|((\.[\d]{1,2})?)|(1(\.0{1,2})?))$/,
                message: '请输入0~1之间的数字',
              },
            ]}>
            <Input
              placeholder="请输入0~1之间的数字"
              addonAfter={<span style={{ color: '#BFBFBF' }}>吨</span>}
              disabled={reduceCheck ? true : false}
              style={{ width: 264 }}
            />
          </Form.Item>
          {form.getFieldsValue(['plusOrReduce']).plusOrReduce === 0 &&
          form.getFieldsValue(['receiveOrSend']).receiveOrSend === 1 ? (
            <Form.Item label="" name="abateMethod" valuePropName="checked">
              <Checkbox onChange={abateMethodCheckrules} checked={abateMethodCheck}>
                当实收大于原发时,以原发净重进行扣减
              </Checkbox>
            </Form.Item>
          ) : (
            ''
          )}

          {form.getFieldsValue(['plusOrReduce']).plusOrReduce === 0 &&
          form.getFieldsValue(['receiveOrSend']).receiveOrSend === 1 ? (
            <Form.Item label="" {...formRoute} rules={[]}>
              <Checkbox onChange={reduceTules} checked={reduceCheck}>
                当原发净重减实收净重大于等于
                <Form.Item
                  name="abateThreshold"
                  noStyle
                  validateFirst={true}
                  rules={[
                    {
                      required: reduceCheck ? true : false,
                      message: '不可为空',
                    },
                    {
                      validator: (rule, value) => {
                        if (reduceCheck) {
                          if (+value > 0) {
                            if (/^((0\.((0[1-9])|([1-9]\d?)))|((\.[\d]{1,2})?)|(1(\.0{1,2})?))$/.test(value)) {
                              return Promise.resolve();
                            } else {
                              return Promise.reject('请输入0~1之间的数字');
                            }
                          } else {
                            return Promise.reject('请输入0~1之间的数字');
                          }
                        } else {
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input placeholder="" style={{ width: 96, margin: '0 8px' }} disabled={reduceCheck ? false : true} />
                </Form.Item>
                吨时,不再执行减扣规则,否则以设置的值进行减扣
              </Checkbox>
            </Form.Item>
          ) : (
            ''
          )}
        </div>
        <div className={styles['btn-bottom']}>
          <Button size="default" onClick={() => onClose()}>
            取消
          </Button>
          <Button size="default" type="primary" htmlType="submit" style={{ marginLeft: 8 }} loading={loading}>
            保存
          </Button>
        </div>
      </Form>
      <Drawer
        title="选择专线"
        width={664}
        onClose={() => setShowChooseRouteModal(false)}
        visible={showChooseRouteModal}>
        <ChooseRouteModal handleSureChooseRoute={handleSureChooseRoute} userId={userId} />
      </Drawer>
    </div>
  );
};

export default Index;
