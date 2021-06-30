import { LoadingOutlined } from '@ant-design/icons';
import { Input, Button, Radio, message, Row, Col, Select, Form } from 'antd';
import { useState, useEffect } from 'react';
import customer from '@api/customer';
import { getSms } from '@api';
import styles from './styles.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

// 银行卡正则校验
const regBankCard = /^([1-9]{1})(\d{15,21})$/;

const regCN = /^[\u4e00-\u9fa5]+$/;

const NewForm = ({ onSubmit, onClose, middleId, visible }) => {
  const [form] = Form.useForm();
  const [time, setTime] = useState();
  // 计时器对象
  const [timeoutState, setTimeoutState] = useState();

  const [loading, setLoading] = useState(false);

  const [cardLoading, setCardLoading] = useState(false);

  // 代收人指定radio
  const [receive, setReceive] = useState(0);

  // 是否可编辑银行卡信息
  const [editReceive, setEditReceive] = useState(true);

  const [bankList, setBankList] = useState([]);

  const [formData, setFormData] = useState({});

  const [dataInfo, setDataInfo] = useState({});

  // 所属银行卡
  const [fromBank, setFromBank] = useState({});

  const onFinish = async values => {
    setLoading(true);
    const params = {
      id: middleId,
      createRoute: values.createRoute,
    };

    // 指定代收人
    if (receive === 1) {
      params.receiveAccount = {
        cardNumber: values.cardNumber,
        bankId: fromBank.bankId || values.bankId,
        userName: values.userName,
        idCard: values.idCard,
        mobile: values.mobile,
      };
      params.sms = values.sms;
    } else {
      params.receiveAccount = {};
    }

    if (typeof onSubmit === 'function') {
      // form.resetFields();
      setEditReceive(false);
      await onSubmit(params);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 获取银行卡信息
    getBankList({ limit: 10 });

    // 获取车队长信息
    getMiddleManById();
    return () => {
      // 移除定时器
      clearTimeout(timeoutState);
    };
  }, []);

  useEffect(() => {
    form.resetFields();
    // 获取银行卡信息
    getBankList({ limit: 10 });

    // 获取车队长信息
    getMiddleManById();
  }, [middleId]);

  useEffect(() => {
    if (visible) {
      getMiddleManById();
    }
  }, [visible]);

  // 倒计时
  useEffect(() => {
    if (time > 0) {
      const _timeout = setTimeout(() => {
        setTime(time - 1);
      }, 1000);
      setTimeoutState(_timeout);
    }
  }, [time]);

  // 指定代收账号
  useEffect(() => {
    setEditReceive(!!receive);
  }, [receive]);

  // 获取银行卡信息
  const getBankList = async params => {
    const res = await customer.getBankList({ params });

    if (res.status === 0) {
      setBankList(res.result.data);
    }
  };

  // 初始化编辑数据
  const initForm = data => {
    console.log(data);
    // 绑定车队长信息
    setFormData(() => {
      return {
        username: data.fleetCaptain.username,
        name: data.fleetCaptain.name,
      };
    });

    // 绑定表单信息
    form.setFieldsValue({
      createRoute: data.createRoute ? 1 : 0,
    });

    // 代收人信息
    if (Object.keys(data.receiveAccount).length === 0) {
      setReceive(0);
    } else {
      setReceive(1);
      const { receiveAccount } = data;
      form.setFieldsValue({
        cardNumber: receiveAccount.cardNumber,
        userName: receiveAccount.userName,
        idCard: receiveAccount.idCard,
        mobile: receiveAccount.mobile,
      });
      if (receiveAccount.mobile) {
        setEditReceive(false);
        setFromBank({ ...receiveAccount.bank, bankId: receiveAccount.bankId });
      } else {
        setEditReceive(true);
        setFromBank({});
      }
    }
  };

  // 获取车队长信息
  const getMiddleManById = async () => {
    const params = {
      id: middleId,
    };
    const res = await customer.getMiddleManById({ params });
    if (res.status === 0) {
      // 初始化表单数据
      setDataInfo(res.result);
      initForm(res.result);
    } else {
      message.error(res.detail || res.description);
    }
  };

  // 获取验证码
  const getPhoneSms = async () => {
    const values = await form.validateFields(['mobile']);
    if (values) {
      const params = {
        mobile: values.mobile,
      };
      const res = await getSms(params);
      if (res.status === 0) {
        message.success('验证码发送成功，请留意手机短信');
        setTime(60);
      } else {
        message.error(`${res.description} ${res.detail || ''}`);
      }
    }
  };

  // 根据卡号获取卡信息
  const geBankCardByCardNum = async cardNumber => {
    if (regBankCard.test(cardNumber)) {
      setCardLoading(true);
      const params = {
        cardNumber,
      };
      const res = await customer.getUsedCard({ params });
      if (res.status == 0) {
        // setReceiveInfo(res.result);
        const { bankId, userName, idCard, mobile, bank } = res.result;
        form.setFieldsValue({
          bankId,
          userName,
          idCard,
          mobile,
        });

        // 不可编辑
        if (userName) {
          setEditReceive(false);
          setFromBank({ ...bank, bankId });
        } else {
          setEditReceive(true);
          setFromBank({});
        }
      }
      setCardLoading(false);
    }
  };

  const handleSearch = async value => {
    if (regCN.test(value)) {
      const params = {
        bankName: value,
      };
      getBankList(params);
      return;
    }

    if (value === '') {
      getBankList();
    }
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.form}>
      <Form
        {...formItemLayout}
        onFinish={onFinish}
        form={form}
        initialValues={{}}
        // form={form}
        onFinishFailed={onFinishFailed}>
        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>账号
            </div>
          }>
          <span style={{ color: '#333333' }}>{formData.username || '-'}</span>
        </Form.Item>
        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>姓名
            </div>
          }>
          <span style={{ color: '#333333' }}>{formData.name || '-'}</span>
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>代建专线
            </div>
          }
          // label="代建专线"
          name="createRoute"
          rules={[]}>
          <Radio.Group>
            <Radio value={1}>能</Radio>
            <Radio value={0}>不能</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>指定代收账号
            </div>
          }
          // label="指定代收账号"
          rules={[]}>
          <Radio.Group value={receive} onChange={e => setReceive(e.target.value)}>
            <Radio value={1}>指定</Radio>
            <Radio value={0}>不指定</Radio>
          </Radio.Group>
        </Form.Item>

        {receive === 1 ? (
          <>
            <Form.Item
              label="代收银行卡"
              name="cardNumber"
              validateFirst={true}
              rules={[
                { required: true, message: '内容不可为空' },
                { pattern: regBankCard, message: '银行卡号应为16-22位数字' },
              ]}>
              <Input
                placeholder="请输入代收银行卡号"
                maxLength={22}
                style={{ width: 264 }}
                onChange={e => geBankCardByCardNum(e.target.value)}
                suffix={<LoadingOutlined style={{ display: `${cardLoading ? 'unset' : 'none'}` }} />}
              />
            </Form.Item>

            {editReceive ? (
              <Form.Item
                label="所属银行"
                name="bankId"
                validateFirst={true}
                required
                rules={[{ required: true, message: '内容不可为空' }]}>
                <Select
                  placeholder="请输选择所属银行名称"
                  allowClear
                  showSearch
                  style={{ width: 264 }}
                  onSearch={handleSearch}
                  filterOption={false}>
                  {bankList.map(value => {
                    return (
                      <Select.Option key={value.id + ''} value={value.id}>
                        {value.bankName}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item label="所属银行" required>
                <Input value={fromBank.bankName} disabled={true} style={{ width: 264 }} />
              </Form.Item>
            )}

            <Form.Item
              label="持卡人姓名"
              name="userName"
              validateFirst={true}
              rules={[{ required: true, message: '内容不可为空' }]}>
              <Input disabled={!editReceive} placeholder="请输入持卡人姓名" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              label="持卡人身份证号"
              name="idCard"
              validateFirst={true}
              rules={[
                { required: true, message: '内容不可为空' },
                { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入有效的身份证号' },
              ]}>
              <Input disabled={!editReceive} placeholder="请输入持卡人身份证号" style={{ width: 264 }} />
            </Form.Item>
            <Form.Item
              label="持卡人手机号"
              name="mobile"
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: '持卡人手机不可为空',
                },
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: '请输入有效的手机号码',
                },
              ]}>
              <Input disabled={!editReceive} maxLength={11} placeholder="请输入持卡人手机号" style={{ width: 200 }} />
            </Form.Item>

            {editReceive ? (
              <div className={styles.sms}>
                <Form.Item
                  label="短信验证码"
                  name="sms"
                  validateFirst={true}
                  rules={[
                    { required: true, message: '验证码不可为空' },
                    { pattern: /^\d{6}$/, message: '验证码必须为6位数字' },
                  ]}>
                  <Row>
                    <Col span={11}>
                      <Input placeholder="请输入验证码" maxLength={6} style={{ width: 200 }} />
                    </Col>
                    <Col span={10}>
                      <Button
                        type="primary"
                        ghost
                        disabled={time > 0}
                        style={{ width: 88, padding: 0, marginLeft: -6 }}
                        onClick={() => getPhoneSms()}>
                        {time === undefined ? '获取验证码' : time > 0 ? `${time}秒后重发` : '重新发送'}
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </div>
            ) : undefined}
          </>
        ) : undefined}

        <div style={{ textAlign: 'right' }}>
          <Button
            size="default"
            onClick={() => {
              form.resetFields();
              onClose();
            }}>
            取消
          </Button>
          <Button size="default" type="primary" style={{ marginLeft: 8 }} htmlType="submit" loading={loading}>
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewForm;
