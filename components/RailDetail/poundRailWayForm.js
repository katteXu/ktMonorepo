import { MinusCircleOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Button, Input, Select, Switch, Divider, Row, Col, Tooltip, Radio, Form, message } from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { AutoInputRoute, DrawerInfo } from '@components';
import { railWay, customer, getCommon } from '@api';
import SelectBtn from './selectBtn_new';
import CreateGoods from './createGoods';
import { useState, useEffect, forwardRef, useCallback } from 'react';
import AddressForm from '@components/CustomerDetail/address/form';
import CompanyForm from '@components/CustomerDetail/company/form';
import router from 'next/router';
const { Option } = Select;
const { TextArea } = Input;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const tailFormItemLayout = {
  wrapperCol: {
    offset: 5,
    span: 14,
  },
};

// 校验规则
const rules = [{ required: true, whitespace: true, message: '选项不可为空' }];
// 输入框验证
const input_rules = [{ required: true, whitespace: true, message: '内容不可为空' }];
// 姓名验证
const name_rules = [
  {
    required: true,
    whitespace: true,
    message: '内容不可为空',
  },
  {
    pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
    message: '内容长度不能小于2个汉字',
  },
];
// 电话验证
const phone_rules = [
  {
    required: true,
    whitespace: true,
    message: '内容不可为空',
  },
  {
    pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
    message: '请输入有效的联系电话',
  },
];
// 数字验证
const num_rules = [{ type: 'number', message: '请输入有效的数字', transform: value => parseInt(value) }];

// 对象验证
const date_config = [{ type: 'object', required: true, whitespace: true, message: '内容不可为空' }];

// 下拉对象验证
const select_obj_config = [{ type: 'object', required: true, whitespace: true, message: '选项不可为空' }];

// 必须是数字，只能大于0，只能输入两位小数
const number_rules = [
  {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: '只能是数字，且不可超过2位小数',
  },
  {
    validator: (rule, value) => {
      if (+value) {
        if (+value > 0) {
          return Promise.resolve();
        } else {
          return Promise.reject('内容必须大于0');
        }
      } else {
        return Promise.resolve();
      }
    },
  },
];

// 除了吨以外的单位校验
const otherUnitNameCheckRules = [
  {
    pattern: /^\d+$/,
    message: '只能是整数',
  },
];

// 获取货物类型
const getGoodsType = async () => {
  const res = await railWay.getGoodsType();
  if (res.status === 0) {
    const result = res.result.map(({ goodsName }) => goodsName);
    // 去重
    return Array.from(new Set(result));
  } else {
    return [];
  }
};

// 货品货品单位
const getGoodsUnitName = async () => {
  const res = await railWay.getUnitName();
  return res.result;
};

// 获取地址列表
const getAddressList = async ({ page = 1, limit = 1000 } = {}) => {
  const res = await customer.getCustomerAddressList({ params: { page, limit } });
  if (res.status === 0) {
    return res.result;
  }
};

// 表单组件
const RailWayForm = ({ onSubmit, renderMap, clearMap }) => {
  const [form] = Form.useForm();
  // 企业
  const [fromCompany, setFromCompany] = useState({});
  const [toCompany, setToCompany] = useState({});

  // 地址
  const [addressList, setAddressList] = useState([]);
  const [fromAddressId, setFromAddressId] = useState();
  const [toAddressId, setToAddressId] = useState();

  // 货品名称
  const [goodList, setGoodsList] = useState([]);
  const [goodModal, setGoodModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [companyModal, setCompanyModal] = useState(false);
  // 货品单位
  const [unitNameList, setUnitNameList] = useState([]);
  const [unitName, setUnitName] = useState('吨');
  const [newCompany, setNewCompany] = useState(false);

  // 余量提醒
  const [isLeavingAmount, setLeavingAmount] = useState(false);
  // 收货人
  // const [otherReceiver, setOther] = useState(false);
  // 托运人
  // const [consignor, setConsignor] = useState('');
  // 选择合同
  const [contract, setContract] = useState({});
  // 允许路损 checkbox
  // const [allowLoss, setAllowLoss] = useState(false);

  // 货品添加成功
  const createFinish = async () => {
    // 绑定货物类型
    setGoodsList(await getGoodsType());
  };

  // 初始化
  useEffect(() => {
    (async () => {
      // 绑定货物类型
      setGoodsList(await getGoodsType());
      // 绑定货品单位
      setUnitNameList(await getGoodsUnitName());

      // 获取地址列表
      const { data } = await getAddressList();
      setAddressList(data);
    })();
  }, []);

  // 选择企业
  const handleSelect = (type, company) => {
    if (type === 'from') setFromCompany(company);
    if (type === 'to') setToCompany(company);
  };

  // 监听发货企业
  // useEffect(() => {
  //   if (fromAddress.id) {
  //     // 获取发货企业下的 地址信息
  //     (async () => {
  //       const params = {
  //         addressCompanyName: fromAddress.companyName,
  //       };
  //       setFromAddressListLoading(true);
  //       const res = await customer.getCustomerAddressList({ params });
  //       if (res.status === 0) {
  //         setFromAddressList(res.result.data);
  //         setFromAddressListLoading(false);
  //       }
  //     })();
  //   } else {
  //     setFromAddressList([]);
  //     setFromAddressId(undefined);
  //   }
  // }, [fromAddress]);

  // 监听收货企业
  // useEffect(() => {
  //   if (toAddress.id) {
  //     // 获取发货企业下的 地址信息
  //     (async () => {
  //       const params = {
  //         addressCompanyName: toAddress.companyName,
  //       };
  //       setToAddressListLoading(true);
  //       const res = await customer.getCustomerAddressList({ params });
  //       if (res.status === 0) {
  //         setToAddressList(res.result.data);
  //         setToAddressListLoading(false);
  //       }
  //     })();
  //   } else {
  //     setToAddressList([]);
  //     setToAddressId(undefined);
  //   }
  // }, [toAddress]);

  // 监听发货id
  // useEffect(() => {
  //   // const fromAddress = fromAddressList.find(({ id }) => id === fromAddressId);
  //   // const toAddress = toAddressList.find(({ id }) => id === toAddressId);
  //   // // 绘制路线
  //   // if (fromAddressId && toAddressId && onlyPound === 0) {
  //   const { longitude: fromlng, latitude: fromlat } = fromAddress;
  //   const { longitude: tolng, latitude: tolat } = toAddress;
  //   if (fromlng && tolng) {
  //     renderMap([{ lnglat: [fromlng, fromlat] }, { lnglat: [tolng, tolat] }]);
  //   }
  //   // }

  //   // 绑定联系人
  //   // if (toAddressId && onlyPound === 0) {
  //   //   const { contact2Name, contact2Mobile } = toAddress;
  //   //   if (contact2Name || contact2Mobile) {
  //   //     setOther(true);
  //   //   } else {
  //   //     setOther(false);
  //   //   }
  //   // } else {
  //   //   setOther(false);
  //   // }
  // }, [fromAddress, toAddress]);

  // 监听其他联系人
  // useEffect(() => {
  //   if (toAddressId) {
  //     const toAddress = toAddressList.find(({ id }) => id === toAddressId);
  //     const { contactName, contact2Name, contactMobile, contact2Mobile } = toAddress;
  //     form.setFieldsValue({
  //       receiverName: contactName,
  //       receiverMobilePhone: contactMobile,
  //       receiver2Name: otherReceiver ? contact2Name : undefined,
  //       receiver2MobilePhone: otherReceiver ? contact2Mobile : undefined,
  //     });
  //   } else {
  //     form.setFieldsValue({
  //       receiverName: undefined,
  //       receiverMobilePhone: undefined,
  //       receiver2Name: undefined,
  //       receiver2MobilePhone: undefined,
  //     });
  //   }
  // }, [toAddressId, otherReceiver]);

  // 监听磅室可见
  // useEffect(() => {
  //   const _fromAddress = fromAddressList.find(({ id }) => id === fromAddressId);
  //   const _toAddress = toAddressList.find(({ id }) => id === toAddressId);
  //   // 磅室可见取fromAddressId,toAddressId
  //   if (onlyPound === 1) {
  //     setFromAddressId(fromAddressId || fromAddress.id);
  //     setToAddressId(toAddressId || toAddress.id);
  //   }
  // }, [onlyPound, fromAddress, toAddress]);

  // 监听发货联系人
  useEffect(() => {
    if (fromAddressId) {
      const fromAddress = addressList.find(({ id }) => id === fromAddressId);
      const { contactName, contactMobile } = fromAddress;
      form.setFieldsValue({
        fromName: contactName,
        fromMobilePhone: contactMobile,
      });
    } else {
      form.setFieldsValue({
        fromName: undefined,
        fromMobilePhone: undefined,
      });
    }
  }, [fromAddressId]);

  // 监听收货联系人
  useEffect(() => {
    if (toAddressId) {
      const toAddress = addressList.find(({ id }) => id === toAddressId);
      const { contactName, contactMobile } = toAddress;
      form.setFieldsValue({
        receiverName: contactName,
        receiverMobilePhone: contactMobile,
      });
    } else {
      form.setFieldsValue({
        receiverName: undefined,
        receiverMobilePhone: undefined,
      });
    }
  }, [toAddressId]);

  // 提交
  const handleSubmit = values => {
    // const [startLoadTime, lastLoadTime] = values.loadTime || [];
    const hiddenInfo = {};

    Object.keys(options).forEach(item => {
      hiddenInfo[item] = values.hiddenInfo && values.hiddenInfo.includes(item) ? 1 : 0;
    });

    console.log(values.hiddenInfo);
    const fromAddress = addressList.find(({ id }) => id === fromAddressId);
    const toAddress = addressList.find(({ id }) => id === toAddressId);
    let data = {
      fromAddressCompanyId: fromCompany.id,
      toAddressCompanyId: toCompany.id,
      fromAddressId,
      toAddressId,
      goodsType: values.goodsType,
      onlyPound: '1',
      printPoundBill: values.printPoundBill,
      totalAmount: (values.totalAmount && values.totalAmount * 1000) || undefined,
      unitName: values.unitName,
      unitPrice: (values.unitPrice && values.unitPrice * 100) || undefined,
      fromName: values.fromName,
      fromMobilePhone: values.fromMobilePhone,
      receiverName: values.receiverName,
      receiverMobilePhone: values.receiverMobilePhone,
      remark: values.remark,
      //隐藏信息
      ...hiddenInfo,
    };
    // 余量提醒
    if (isLeavingAmount === 1) {
      data.isLeavingAmount = values.isLeavingAmount;
      data.ruleLeavingAmount = values.ruleLeavingAmount * 1000;
      data.routeContactMobile = values.routeContactMobile;
    }
    // 合同id
    contract.id && (data.contractNewId = contract.id);

    // 封装确认参数
    let dataView = {
      fromCompany: { label: '发货企业：', value: fromCompany.companyName },
      toCompany: { label: '收货企业：', value: toCompany.companyName },
      goodsType: { label: '货品名称：', value: values.goodsType || '-' },
      printPoundBill: { label: '打印榜单：', value: values.printPoundBill ? '打印' : '不打印' },
      totalAmount: {
        label: '货物总量：',
        value: values.totalAmount ? `${(values.totalAmount * 1).toFixed(2)}${values.unitName}` : '-',
      },
      unitPrice: {
        label: '运费单价：',
        value: values.unitPrice ? `${(values.unitPrice * 1).toFixed(2)}元/${values.unitName}` : '-',
      },
    };
    if (fromAddress) {
      dataView.fromAddress = {
        label: '发货地址：',
        value: `${fromAddress.province}${fromAddress.city}${fromAddress.district}${fromAddress.detailAddress}`,
      };
    }

    if (toAddress) {
      dataView.toAddress = {
        label: '收货地址：',
        value: `${toAddress.province}${toAddress.city}${toAddress.district}${toAddress.detailAddress}`,
      };
    }

    if (values.fromName) {
      dataView.fromName = {
        label: '发货联系人：',
        value: values.fromName,
      };

      dataView.fromMobilePhone = {
        label: '联系人电话：',
        value: values.fromMobilePhone,
      };
    }

    if (values.receiverName) {
      dataView.receiverName = {
        label: '收货联系人：',
        value: values.receiverName,
      };

      dataView.receiverMobilePhone = {
        label: '联系人电话：',
        value: values.receiverMobilePhone,
      };
    }

    if (values.remark) {
      dataView.remark = {
        label: '专线备注：',
        value: values.remark,
      };
    }

    // 余量提醒
    dataView.isLeavingAmount = { label: '余量提醒：', value: isLeavingAmount === 1 ? '开启' : '关闭' };
    if (isLeavingAmount === 1) {
      dataView.ruleLeavingAmount = {
        label: '限制进站余量：',
        value: `${(values.ruleLeavingAmount * 1).toFixed(2)} ${values.unitName}`,
      };
      dataView.routeContactMobile = { label: '专线负责人：', value: values.routeContactMobile };
    }
    console.log(data);
    onSubmit(data, dataView);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const onChangeContract = (e, val) => {
    if (e) {
      const item = val.item;
      setContract(item);
      setFromCompany({
        id: item.fromAddressId,
        companyName: item.fromAddress,
      });
      setToCompany({
        id: item.toAddressId,
        companyName: item.toAddress,
      });
      form.setFieldsValue({
        goodsType: item.goodsName,

        validateFromAddress: item.fromAddress,
        validateToAddress: item.toAddress,
      });
    } else {
      setContract({});
      setFromCompany({});
      setToCompany({});
      form.setFieldsValue({
        goodsType: undefined,
        validateFromAddress: undefined,
        validateToAddress: undefined,
      });
    }
  };

  const onChangeFromCompany = (e, val) => {
    console.log(val);
    if (e) {
      const item = val.item;
      setFromCompany({ companyName: val.children, id: item.key });
      form.setFieldsValue({
        validateFromAddress: val.children,
      });
    } else {
      setFromCompany({});
      form.setFieldsValue({
        validateFromAddress: undefined,
      });
      setNewCompany(true);
      //搜索后需要重新调接口
      setTimeout(() => {
        setNewCompany(false);
      }, 1000);
    }
  };

  const onChangeToCompany = (e, val) => {
    if (e) {
      const item = val.item;
      form.setFieldsValue({
        validateToAddress: val.children,
      });
      setToCompany({ companyName: val.children, id: item.key });
    } else {
      setToCompany({});
      form.setFieldsValue({
        validateToAddress: undefined,
      });
      setNewCompany(true);
      setTimeout(() => {
        setNewCompany(false);
      }, 1000);
    }
  };

  // 新增地址提交
  const submitAddress = useCallback(async params => {
    const res = await customer.createCustomerLoadAddr({ params });
    if (res.status === 0) {
      message.success('地址新增成功');
      setAddressModal(false);
      const { data } = await getAddressList();
      setAddressList(data);
    } else {
      message.error(`地址新增失败，原因：${res.detail || res.description}`);
    }
  });

  const submitCompany = useCallback(async params => {
    const res = await customer.createCustomer({ params });
    if (res.status === 0) {
      message.success('企业新增成功');
      setCompanyModal(false);
      setNewCompany(true);
      setTimeout(() => {
        setNewCompany(false);
      }, 1000);
    } else {
      message.error(`企业新增失败，原因：${res.detail || res.description}`);
    }
  });
  // 隐藏数据的处理

  const selectChildren = [];
  const options = {
    publishingCompanyHidden: '发布企业',
    receiveShippingComanyHidden: '收发货企业',
    unitPriceHidden: '运费单价',
    goodsPriceHidden: '货物单价',
    goodsNameHidden: '货品名称',
    fleetContractInformationHidden: '车队长联系方式',
    visibleAfterOrderVisible: '司机抢单后可见隐藏信息',
  };

  Object.keys(options).forEach(item => {
    selectChildren.push(<Option key={item}>{options[item]}</Option>);
  });

  return (
    <div className={styles.fromInfo}>
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        form={form}
        initialValues={{
          printPoundBill: true,
          isLeavingAmount: 0,
          unitName: '吨',
        }}>
        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item
              label={
                <div>
                  <span className={styles.noStar}>*</span>选择合同
                </div>
              }
              name="contract"
              style={{ marginLeft: 32 }}>
              <AutoInputRoute
                mode="contract"
                style={{ width: 264 }}
                value={fromCompany.companyName}
                allowClear
                placeholder="请选择合同"
                onChange={(e, val) => {
                  onChangeContract(e, val);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={4} style={{ position: 'relative', left: 156 }}>
            <Button type="link" onClick={() => router.push('/contractManagement/addContract')}>
              新增
            </Button>
          </Col>
        </Row>
        <div className={styles.title}>
          <span className={styles.line}></span>必填信息
        </div>

        {/* 发货企业 */}
        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item
              label="发货企业"
              name="validateFromAddress"
              style={{ marginLeft: 32 }}
              rules={[{ required: true, whitespace: true, message: '企业不可为空' }]}>
              <AutoInputRoute
                mode="company"
                value={fromCompany.companyName}
                allowClear
                placeholder="请选择发货企业"
                newCompany={newCompany}
                onChange={(e, val) => {
                  onChangeFromCompany(e, val), console.log(val);
                }}
                disContent={contract && Object.keys(contract).length > 0 ? true : false}
              />
            </Form.Item>
          </Col>

          <Col span={4} style={{ position: 'relative', left: 367 }}>
            <Button type="link" onClick={() => setCompanyModal(true)}>
              新增
            </Button>
          </Col>
        </Row>

        {/* 收货企业 */}
        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item
              label="收货企业"
              name="validateToAddress"
              style={{ marginLeft: 32 }}
              rules={[{ required: true, whitespace: true, message: '企业不可为空' }]}>
              <AutoInputRoute
                mode="company"
                value={toCompany.companyName}
                allowClear
                newCompany={newCompany}
                placeholder="请选择收货企业"
                onChange={(e, val) => onChangeToCompany(e, val)}
                disContent={contract && Object.keys(contract).length > 0 ? true : false}
              />
            </Form.Item>
          </Col>

          <Col span={4} style={{ position: 'relative', left: 367 }}>
            <Button type="link" onClick={() => setCompanyModal(true)}>
              新增
            </Button>
          </Col>
        </Row>

        {/* 货品名称 */}

        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item name="goodsType" rules={rules} label="货品名称" style={{ marginLeft: 32 }}>
              <Select
                showSearch
                style={{ width: 264 }}
                allowClear
                optionFilterProp="children"
                placeholder="请选择货品名称"
                disabled={contract && Object.keys(contract).length > 0 ? true : false}>
                {goodList.map(item => (
                  <Option key={`${item}`} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4} style={{ position: 'relative', left: 156 }}>
            <Button type="link" onClick={() => setGoodModal(true)}>
              新增
            </Button>
          </Col>
        </Row>

        {/* 是否打印磅单 */}
        <Form.Item label="打印磅单" required name="printPoundBill" style={{ marginLeft: 32 }}>
          <Radio.Group>
            <Radio value={true}>打印</Radio>
            <Radio value={false} style={{ marginLeft: 16 }}>
              不打印
            </Radio>
          </Radio.Group>
        </Form.Item>

        <div className={styles.title}>
          <span className={styles.line}></span>选填信息
        </div>

        {/* 货物总量 */}
        <Form.Item
          label={
            isLeavingAmount ? (
              '货物总量'
            ) : (
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>货物总量
              </div>
            )
          }
          name="totalAmount"
          style={{ marginLeft: 32 }}
          validateFirst={true}
          rules={[
            {
              required: isLeavingAmount,
              message: '内容不可为空',
            },
            {
              pattern: /^\d+(\.?\d{1,2})?$/,
              message: '货物总量只能是数字，最多两位小数',
            },
          ]}>
          <Input placeholder="请输入货物总量" style={{ width: 264 }} addonAfter={<span>{unitName}</span>} />
        </Form.Item>

        {/* 运费单价 */}
        <Row className={styles.unitPrice} style={{}}>
          <Col span={10}>
            <Form.Item
              label={
                <div>
                  <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>运费单价
                </div>
              }
              name="unitPrice"
              style={{ marginLeft: 32 }}
              validateFirst={true}
              rules={number_rules}>
              <Input placeholder="请输入运费单价" addonAfter={<span>元</span>} style={{ width: 264 }} />
            </Form.Item>
          </Col>
          <Col className={styles.unitName_yan} span={3} style={{ position: 'absolute', left: 397 }}>
            <Form.Item name="unitName" style={{ position: 'relative', left: 32, top: -1 }}>
              <Select
                style={{ width: 96 }}
                onChange={value => {
                  setUnitName(value);
                }}>
                {unitNameList.map(item => (
                  <Option key={item.id} value={item.name}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 发货地址 */}
        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item
              label={
                <div>
                  <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>发货地址
                </div>
              }
              // label="发货地址"
              name="fromAddressId"
              style={{ marginLeft: 32 }}>
              <Select
                placeholder="请选择发货地址"
                onChange={value => setFromAddressId(value)}
                showSearch
                allowClear
                optionFilterProp="children">
                {addressList
                  .filter(item => item.id !== toAddressId)
                  .map(({ province, city, district, detailAddress, id, loadAddressName }) => (
                    <Select.Option key={id} value={id}>
                      {loadAddressName} {province}
                      {city}
                      {district} {detailAddress}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4} style={{ position: 'relative', left: 367 }}>
            <Button type="link" onClick={() => setAddressModal(true)}>
              新增
            </Button>
          </Col>
        </Row>

        {/* 发货联系人 */}
        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>发货人
            </div>
          }
          wrapperCol={{ span: 19 }}
          style={{ marginLeft: 32 }}>
          <Form.Item
            style={{ display: 'inline-block', width: 200 }}
            name="fromName"
            rules={[
              {
                pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
                message: '内容长度不能小于2个汉字',
              },
            ]}>
            <Input placeholder="请输入发货人姓名" />
          </Form.Item>
          <Form.Item
            style={{ display: 'inline-block', width: 200, marginLeft: 8 }}
            name="fromMobilePhone"
            rules={[
              {
                pattern: /^[0-9]*$/,
                message: '请输入有效的联系电话',
              },
            ]}>
            <Input maxLength={11} placeholder="请输入发货人电话" />
          </Form.Item>
        </Form.Item>

        {/* 收货地址 */}
        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item
              label={
                <div>
                  <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>收货地址
                </div>
              }
              //  label="收货地址"
              name="toAddressId"
              style={{ marginLeft: 32 }}>
              <Select
                placeholder="请选择收货地址"
                onChange={value => setToAddressId(value)}
                showSearch
                allowClear
                optionFilterProp="children">
                {addressList
                  .filter(item => item.id !== fromAddressId)
                  .map(({ province, city, district, detailAddress, id, loadAddressName }) => (
                    <Select.Option key={id} value={id}>
                      {loadAddressName} {province}
                      {city}
                      {district} {detailAddress}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4} style={{ position: 'relative', left: 367 }}>
            <Button type="link" onClick={() => setAddressModal(true)}>
              新增
            </Button>
          </Col>
        </Row>

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>收货人
            </div>
          }
          wrapperCol={{ span: 19 }}
          style={{ marginLeft: 32 }}>
          <Form.Item
            style={{ display: 'inline-block', width: 200 }}
            name="receiverName"
            rules={[
              {
                pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
                message: '内容长度不能小于2个汉字',
              },
            ]}>
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item
            style={{ display: 'inline-block', width: 200, marginLeft: 8 }}
            name="receiverMobilePhone"
            rules={[
              {
                pattern: /^[0-9]*$/,
                message: '请输入有效的联系电话',
              },
            ]}>
            <Input maxLength={11} placeholder="请输入收货人电话" />
          </Form.Item>
        </Form.Item>

        {/* 余量提醒 */}
        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>余量提醒
              <Tooltip
                overlayStyle={{ maxWidth: 'max-content', padding: '0 10px' }}
                title={
                  <div>
                    <div>1. 使用开票专线时, 余量会在发货磅单产生时更新.</div>
                    <div>发货磅单产生方式: 使用电子磅单功能或司机手动上传.</div>
                    <div>2. 使用磅室专线时, 余量会在车辆发货出站时更新.</div>
                    <div>客服: 400-690-8700</div>
                  </div>
                }
                placement="right">
                <QuestionCircleFilled style={{ marginRight: 0, marginLeft: 5, cursor: 'pointer', color: '#D0D4DB' }} />
              </Tooltip>
            </div>
          }
          name="isLeavingAmount"
          style={{ marginLeft: 32 }}>
          <Switch size="small" onChange={v => setLeavingAmount(v ? 1 : 0)} />
        </Form.Item>

        {isLeavingAmount === 1 && (
          <>
            <Form.Item
              label="限制进站余量"
              name="ruleLeavingAmount"
              style={{ marginLeft: 32 }}
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: '内容不可为空',
                },
                {
                  pattern: /^\d+(\.?\d{1,2})?$/,
                  message: '限制余量只能是数字，最多两位小数',
                },
              ]}>
              <Input placeholder="请输入限制进站余量" addonAfter={<span>{unitName}</span>} style={{ width: 264 }} />
            </Form.Item>
            <Form.Item
              label="专线负责人"
              name="routeContactMobile"
              style={{ marginLeft: 32 }}
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: '内容不可为空',
                },
                {
                  pattern: /^[1][2,3,4,5,6,7,8,9][0-9]{9}$/,
                  message: '手机号格式不正确',
                },
              ]}>
              <Input placeholder="请输入专线负责人手机号" maxLength={11} style={{ width: 200 }} />
            </Form.Item>
          </>
        )}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>隐藏数据
            </div>
          }
          name={'hiddenInfo'}
          style={{ marginLeft: 32 }}>
          <Select mode="tags" allowClear style={{ width: '100%' }} placeholder="请选择">
            {selectChildren}
          </Select>
        </Form.Item>

        {/* 专线备注 */}
        <div className={styles.remark}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>备注
              </div>
            }
            // label="专线备注"
            name="remark"
            style={{ marginLeft: 32 }}
            validateFirst={true}
            rules={[
              {
                min: 4,
                message: '备注最少4个字',
              },
            ]}>
            <TextArea
              placeholder="请输入4~20以内备注"
              maxLength={20}
              rows={3}
              style={{ resize: 'none', position: 'relative', top: 20 }}
            />
          </Form.Item>
        </div>
        <Form.Item {...tailFormItemLayout} style={{ marginTop: 60, marginLeft: 32 }}>
          <Button type="primary" htmlType="submit">
            发布专线
          </Button>
        </Form.Item>
      </Form>

      {/* 添加货品弹窗 */}
      <DrawerInfo
        title="新增"
        onClose={() => {
          setGoodModal(false);
        }}
        showDrawer={goodModal}
        width={630}>
        <CreateGoods onCreated={createFinish} close={() => setGoodModal(false)} />
      </DrawerInfo>
      {/* 添加地址弹窗 */}
      <DrawerInfo
        title="新增"
        onClose={() => {
          setAddressModal(false);
        }}
        showDrawer={addressModal}
        width={630}>
        <AddressForm
          formData={{}}
          onSubmit={submitAddress}
          onClose={() => {
            setAddressModal(false);
          }}
        />
      </DrawerInfo>
      {/* 添加企业弹窗 */}
      <DrawerInfo
        title="新增"
        onClose={() => {
          setCompanyModal(false);
        }}
        showDrawer={companyModal}
        width={630}>
        <CompanyForm
          onSubmit={submitCompany}
          formData={{}}
          onClose={() => {
            setCompanyModal(false);
          }}
        />
      </DrawerInfo>
    </div>
  );
};

export default RailWayForm;
