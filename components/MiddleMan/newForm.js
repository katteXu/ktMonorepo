import { LoadingOutlined } from '@ant-design/icons';
import { Input, Button, Radio, message, Select, Row, Col, Form } from 'antd';
import { useState, useEffect } from 'react';
import styles from './styles.less';
import customer from '@api/customer';
import { getSms } from '@api';

// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  wrapperCol: { span: 19 },
};

// 银行卡正则校验
const regBankCard = /^([1-9]{1})(\d{15,21})$/;

const regCN = /^[\u4e00-\u9fa5]+$/;

const NewForm = ({ onSubmit, onClose }) => {
  const [form] = Form.useForm();
  // 加载信息loading
  const [loading, setLoading] = useState(false);

  // 按钮加载loading
  const [btnLoading, setBtnLoading] = useState(false);

  // 获取已绑银行卡loading
  const [cardLoading, setCardLoading] = useState(false);
  // 车队长账号
  const [account, setAccount] = useState();

  // 代收人指定radio
  const [receive, setReceive] = useState(0);
  // 是否可编辑银行卡信息
  const [editReceive, setEditReceive] = useState(true);

  const [middleId, setMiddleId] = useState();

  const [time, setTime] = useState();
  // 计时器对象
  const [timeoutState, setTimeoutState] = useState();
  // 银行卡列表数据
  const [bankList, setBankList] = useState([]);

  // 所属银行卡
  const [fromBank, setFromBank] = useState({});
  useEffect(() => {
    // 获取银行卡信息
    getBankList({ limit: 10 });

    return () => {
      // 移除定时器
      clearTimeout(timeoutState);
    };
  }, []);

  // 监听授权人账号 获取车队长信息
  useEffect(() => {
    form.validateFields(['name']);
  }, [account]);

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

  const onFinish = async values => {
    setBtnLoading(true);
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
      await onSubmit(params);
    }
    setBtnLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
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

  // 根据车队长账号获取车队长
  const getMiddleByUserName = async username => {
    const params = { username };
    const res = await customer.getMiddleManByUserName({ params });
    return res;
  };

  // 根据卡号获取卡信息
  const geBankCardByCardNum = async cardNumber => {
    if (regBankCard.test(cardNumber)) {
      setCardLoading(true);
      // 请求银行卡历史信息
      const params = {
        cardNumber,
      };
      const res = await customer.getUsedCard({ params });

      if (res.status === 0) {
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

  return (
    <div className={styles.form}>
      <Form
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          createRoute: 1,
        }}
        form={form}
        onFinishFailed={onFinishFailed}>
        <Form.Item
          label="账号"
          name="account"
          rules={[
            {
              required: true,
              message: '账号不可为空',
            },
            {
              pattern: /^1[3-9]\d{9}$/,
              message: '请输入有效的联系电话',
            },
          ]}>
          <Input
            placeholder="请输入账号"
            maxLength={11}
            onChange={e => setAccount(e.target.value)}
            style={{ width: 200 }}
          />
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>姓名
            </div>
          }
          name="name"
          rules={[
            {
              validator: async (rule, value, callback) => {
                const username = form.getFieldValue('account');
                if (/^1[3-9]\d{9}$/.test(username)) {
                  setLoading(true);
                  const res = await getMiddleByUserName(username);
                  if (res.status === 0) {
                    form.setFieldsValue({ name: res.result.name });
                    setMiddleId(res.result.id);
                  } else {
                    form.setFieldsValue({ name: '' });
                    // callback(res.detail || res.description);
                    throw new Error(res.detail || res.description);
                  }
                  setLoading(false);
                } else {
                  form.setFieldsValue({ name: '' });
                }
              },
            },
          ]}>
          <Input disabled placeholder="姓名" suffix={loading && <LoadingOutlined />} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>代建专线
            </div>
          }
          // label="代建专线"
          name="createRoute"
          validateFirst={true}
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
          style={{ marginBottom: 0 }}>
          <Radio.Group value={receive} onChange={e => setReceive(e.target.value)}>
            <Radio value={1}>指定</Radio>
            <Radio value={0}>不指定</Radio>
          </Radio.Group>
          {/* )} */}
        </Form.Item>
        <div style={{ color: '#848485', margin: '0px 0px 24px 131px' }}>
          注意：当指定代收人后、该车队长结算的运费将直接打到指定银行卡中
        </div>

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
                rules={[{ required: true, message: '内容不可为空' }]}>
                <Select
                  placeholder="请输入银行名称"
                  allowClear
                  showSearch
                  onSearch={handleSearch}
                  filterOption={false}
                  style={{ width: 264 }}>
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
          <Button size="default" onClick={() => onClose()}>
            取消
          </Button>
          <Button size="default" type="primary" style={{ marginLeft: 8 }} htmlType="submit" loading={btnLoading}>
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewForm;
