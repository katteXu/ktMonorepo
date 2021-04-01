import { MinusCircleOutlined, QuestionCircleFilled } from '@ant-design/icons';
import {
  Button,
  Input,
  Select,
  Modal,
  Divider,
  Checkbox,
  DatePicker,
  Tooltip,
  Radio,
  Switch,
  Form,
  Row,
  Col,
  message,
} from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { railWay, customer, getCommon } from '@api';
import SelectBtn from './selectBtn_new';
import CreateGoods from './createGoods';
import { useState, useEffect, useCallback } from 'react';
import { AutoInputRoute, DrawerInfo } from '@components';
import AddressForm from '@components/CustomerDetail/address/form';
import CompanyForm from '@components/CustomerDetail/company/form';
import router from 'next/router';
const { Option } = Select;
const { TextArea } = Input;
// 危险品
const DANGER_GOODS = [
  '起爆药',
  '爆破雷管',
  '黑火药',
  '导弹',
  '演习手榴弹',
  '安全导火索',
  '礼花弹',
  '烟火',
  '爆竹',
  '手操信号装置',
  '导火索',
  '燃烧弹药',
  '烟幕弹药',
  'C型烟火',
  'E型或B型引爆器',
  '铵油',
  '铵沥蜡炸药',
  '二氧化碳',
  '氨',
  '氯',
  '液化石油气',
  '液氧',
  '液氮',
  '液氩',
  '黄磷',
  '磷化氢',
  '铝',
  '钾',
  '钠',
  '钙',
  '电石',
  '氧',
  '溴',
  '浓硝酸',
  '氯酸钾',
  '硝酸钾',
  '漂白粉',
  '乙醇',
  '白磷',
  '氢过氧化物',
  'ROOH',
  '二烷基过氧化物',
  'ROOR',
  '二酰基过氧化物',
  'RCOOOOCR',
  '过氧酯',
  'RCOOOR',
  '过氧化碳酸酯',
  'ROCOOOOCOR',
  '及酮过氧化物',
  'R2C(OOH)2',
  'α射线',
  'β射线',
  'γ射线',
  'x射线',
  '中子流',
  '放射',
  '甲酸',
  '冰醋酸',
  '苯甲酰氯',
  '丙烯酸',
  '硝酸',
  '硫酸',
  '高氯酸',
  '溴素',
];

// 货运方式
const TransportType = {
  FTL: '整车运输',
  LTL: '零担运输',
};
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

const oneformItemLayout = {
  wrapperCol: {
    // offset: 4,
    span: 16,
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
const num_rules = [
  {
    type: 'number',
    message: '请输入有效的数字',
    transform: value => parseInt(value),
  },
];

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

// 获取地址列表
const getAddressList = async ({ page = 1, limit = 1000 } = {}) => {
  const res = await customer.getCustomerAddressList({
    params: { page, limit },
  });
  if (res.status === 0) {
    return res.result;
  }
};

// 货品货品单位
const getGoodsUnitName = async () => {
  const res = await railWay.getUnitName();
  return res.result;
};

// 表单组件
const RailWayForm = ({ serverTime, onSubmit, renderMap, clearMap }) => {
  // 服务端时间和本地时间差
  const [diffTime, setDiffTime] = useState(() => {
    return moment(serverTime).diff(moment());
  });

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
  const [newCompany, setNewCompany] = useState(false);

  // 危险品提示
  const goodWarn = value => {
    const isDanger = DANGER_GOODS.includes(value);
    if (isDanger) {
      Modal.warning({
        title: '危险品提示',
        content: (
          <p>
            检测到您想要运输的货物为<span style={{ color: 'red' }}>危险品</span>
            ，应国家规定，网络货运平台不允许承运危险品，对您造成的困扰深感抱歉，请您重新选择要承运的货物
          </p>
        ),
        onOk: () => {
          console.log('重新选择');
        },
      });
    }
  };
  // 货品单位
  const [unitNameList, setUnitNameList] = useState([]);
  const [unitName, setUnitName] = useState('吨');
  // 收货人
  const [otherReceiver, setOther] = useState(false);
  // 托运人
  const [consignor, setConsignor] = useState('');
  // 选择合同
  const [contract, setContract] = useState({});
  // 允许路损 checkbox
  const [allowLoss, setAllowLoss] = useState(false);
  // 余量提醒
  const [isLeavingAmount, setLeavingAmount] = useState(false);
  // 隐藏有效时间
  const [isHiddenDate, setIsHiddenDate] = useState(false);
  //业务类型白名单
  const [whiteList, setWhiteList] = useState(false);

  const [isFleet, setIsFleet] = useState(0);

  const setHiddenDate = async () => {
    const res = await getCommon();
    if (res.status === 0) {
      const hiddenUserName = res.result.find(item => item.key === 'noValidTimeForRoute').url;
      const currentUserName = window.localStorage.username;
      if (hiddenUserName.includes(currentUserName)) {
        setIsHiddenDate(true);
      }
    }
  };
  // 磅室可见
  const [onlyPound, setOnlyPound] = useState(0);
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
      // 设置托运人
      setConsignor(localStorage.companyName);
      // 获取地址列表
      const { data } = await getAddressList();
      setAddressList(data);
      // setFromAddressList({ data, page });
      // setToAddressList({ data, page });

      setHiddenDate();
      isShowBusinessType();
    })();
  }, []);

  const isShowBusinessType = async () => {
    const res = await railWay.userSettings();

    if (res.status === 0) {
      setWhiteList(res.result.is_show_business_type);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 选择地址
  const handleSelect = (type, address) => {
    if (type === 'from') setFromCompany(address);
    if (type === 'to') setToCompany(address);
  };

  // 监听发货id
  useEffect(() => {
    const fromAddress = addressList.find(({ id }) => id === fromAddressId);
    const toAddress = addressList.find(({ id }) => id === toAddressId);
    // 绘制路线
    // if (fromAddressId && toAddressId) {
    //   const { longitude: fromlng, latitude: fromlat } = fromAddress;
    //   const { longitude: tolng, latitude: tolat } = toAddress;
    //   if (fromlng && tolng) {
    //     renderMap([{ lnglat: [fromlng, fromlat] }, { lnglat: [tolng, tolat] }]);
    //   }
    // }

    // 绑定联系人
    if (toAddressId) {
      const { contact2Name, contact2Mobile } = toAddress;
      if (contact2Name || contact2Mobile) {
        setOther(true);
      } else {
        setOther(false);
      }
    } else {
      setOther(false);
    }
  }, [fromAddressId, toAddressId]);

  // 监听其他联系人
  useEffect(() => {
    if (toAddressId) {
      const toAddress = addressList.find(({ id }) => id === toAddressId);
      const { contactName, contact2Name, contactMobile, contact2Mobile } = toAddress;
      form.setFieldsValue({
        receiverName: contactName,
        receiverMobilePhone: contactMobile,
        receiver2Name: otherReceiver ? contact2Name : undefined,
        receiver2MobilePhone: otherReceiver ? contact2Mobile : undefined,
      });
    } else {
      form.setFieldsValue({
        receiverName: undefined,
        receiverMobilePhone: undefined,
        receiver2Name: undefined,
        receiver2MobilePhone: undefined,
      });
    }
  }, [toAddressId, otherReceiver]);

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

  // 提交
  const handleSubmit = values => {
    // const [startLoadTime, lastLoadTime] = values.loadTime || [];
    const [startLoadTime, lastLoadTime] = [moment().add(diffTime), values.loadTime];
    const hiddenInfo = {};
    Object.keys(options).forEach(item => {
      hiddenInfo[item] = values.hiddenInfo && values.hiddenInfo.includes(item) ? 1 : 0;
    });
    const fromAddress = addressList.find(({ id }) => id === fromAddressId);
    const toAddress = addressList.find(({ id }) => id === toAddressId);

    let data = {
      consignor: values.consignor || consignor,
      fromAddressCompanyId: fromCompany.id,
      toAddressCompanyId: toCompany.id,
      fromAddressId,
      toAddressId,
      goodsType: values.goodsType,
      goodsUnitPrice: values.goodsUnitPrice ? values.goodsUnitPrice * 100 : undefined,
      onlyPound: '0',
      lossMark: values.lossMark ? '1' : '0',
      lossAmount: values.lossAmount ? values.lossAmount * 1000 : undefined,
      receiverName: values.receiverName,
      receiverMobilePhone: values.receiverMobilePhone,
      fromName: values.fromName,
      fromMobilePhone: values.fromMobilePhone,
      totalAmount: values.totalAmount ? values.totalAmount * 1000 : undefined,
      transportType: values.transportType,
      unitName: values.unitName,
      unitPrice: values.unitPrice && values.unitPrice * 100,
      startLoadTime: startLoadTime && startLoadTime.format('YYYY-MM-DD HH:mm:ss'),
      lastLoadTime: lastLoadTime && lastLoadTime.format('YYYY-MM-DD HH:mm:ss'),
      fleetCaptionPhone: values.fleetCaptionPhone || undefined,
      otherGoodsOwnerVisible: values.otherGoodsOwnerVisible ? '1' : '0',
      eraseZero: values.eraseZero ? '1' : '0',
      payMethod: values.payMethod,
      remark: values.remark,
      //业务类型
      businessType: values.businessType || '1',
      //隐藏信息
      ...hiddenInfo,
    };

    // 合同id
    contract.id && (data.contractNewId = contract.id);
    // 收货人1
    if (otherReceiver) {
      data.receiver2Name = values.receiver2Name;
      data.receiver2MobilePhone = values.receiver2MobilePhone;
    }

    // 余量提醒
    if (isLeavingAmount === 1) {
      data.isLeavingAmount = values.isLeavingAmount ? 1 : 0;
      data.ruleLeavingAmount = values.ruleLeavingAmount * 1000;
      data.routeContactMobile = values.routeContactMobile;
    }

    // 封装确认参数
    let dataView = {
      fromCompany: { label: '发货企业：', value: fromCompany.companyName },
      fromAddress: {
        label: '发货地址：',
        value: `${fromAddress.province}${fromAddress.city}${fromAddress.district}${fromAddress.detailAddress}`,
      },
      toCompany: { label: '收货企业：', value: toCompany.companyName },
      toAddress: {
        label: '收货地址：',
        value: `${toAddress.province}${toAddress.city}${toAddress.district}${toAddress.detailAddress}`,
      },
      fleetCaptionPhone: {
        label: '车队长手机号：',
        value: `${data.fleetCaptionPhone || '-'}`,
      },
      loadTime: {
        label: '有效时间：',
        value: data.startLoadTime && data.lastLoadTime ? `${data.startLoadTime}-${data.lastLoadTime}` : '-',
      },
      goodsType: { label: '货品名称：', value: values.goodsType || '-' },
      transportType: {
        label: '货运方式：',
        value: TransportType[values.transportType],
      },
      totalAmount: {
        label: '货物总量：',
        value: values.totalAmount ? `${(values.totalAmount * 1).toFixed(2)}${values.unitName}` : '-',
      },
      goodsUnitPrice: {
        label: '货物单价：',
        value: values.goodsUnitPrice ? `${(values.goodsUnitPrice * 1).toFixed(2)}元/${values.unitName}` : '-',
      },
      unitPrice: {
        label: '运费单价：',
        value: values.unitPrice ? `${(values.unitPrice * 1).toFixed(2)}元/${values.unitName}` : '-',
      },
      consignor: { label: '托运人：', value: data.consignor },
      receiver: {
        label: '收货人：',
        value: `${values.receiverName || '-'}  ${values.receiverMobilePhone || '-'}`,
      },
      send: {
        label: '发货人：',
        value: `${values.fromName || '-'} ${values.fromMobilePhone}`,
      },
      otherGoodsOwnerVisible: {
        label: '其他货主可见：',
        value: `${values.otherGoodsOwnerVisible ? '是' : '否'}`,
      },
      eraseZero: {
        label: '运费个位抹零：',
        value: `${values.eraseZero ? '是' : '否'}`,
      },
      payMethod: {
        label: '结算方式：',
        value: `${
          values.payMethod === '1'
            ? '按发货净重结算'
            : values.payMethod === '0'
            ? '按收货净重结算'
            : '按原发与实收较小的结算'
        }`,
      },
    };
    // 其他收货人
    if (otherReceiver) {
      dataView.receiver1 = {
        label: '收货人1：',
        value: `${values.receiver2Name}  ${values.receiver2MobilePhone}`,
      };
    }

    dataView.lossMark = {
      label: '路损计算：',
      value: values.lossMark ? '是' : '否',
    };
    values.lossAmount &&
      (dataView.lossAmount = {
        label: '允许路损：',
        value: `${(values.lossAmount * 1).toFixed(2)}${values.unitName}`,
      });
    // 合同模板
    contract.id && (dataView.contract = { label: '合同模板：', value: contract.name });
    values.remark &&
      (dataView.remark = {
        label: '专线备注：',
        value: values.remark,
      });
    // 余量提醒
    dataView.isLeavingAmount = {
      label: '余量提醒：',
      value: isLeavingAmount === 1 ? '开启' : '关闭',
    };
    if (isLeavingAmount === 1) {
      dataView.ruleLeavingAmount = {
        label: '限制进站余量：',
        value: `${(values.ruleLeavingAmount * 1).toFixed(2)} ${values.unitName}`,
      };
      dataView.routeContactMobile = {
        label: '专线负责人：',
        value: values.routeContactMobile,
      };
    }
    onSubmit(data, dataView);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const settlementMethod = v => {
    v === '1'
      ? form.setFieldsValue({
          payMethod: '0',
        })
      : form.setFieldsValue({
          payMethod: '1',
        });
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
        goodsUnitPrice: item.unitePrice && (item.unitePrice / 100).toFixed(2),
        validateFromAddress: item.fromAddress,
        validateToAddress: item.toAddress,
      });
    } else {
      setContract({});
      setFromCompany({});
      setToCompany({});
      form.setFieldsValue({
        goodsType: '',
        goodsUnitPrice: '',
        validateFromAddress: undefined,
        validateToAddress: undefined,
      });
    }
  };

  const removeContract = () => {
    setContract({});
    setFromCompany({});
    setToCompany({});
    form.setFieldsValue({
      goodsType: '',
      goodsUnitPrice: '',
      validateFromAddress: '',
      validateToAddress: '',
    });
  };

  const onChangeFromCompany = (e, val) => {
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
    <div className={styles.fromInfoRailWay}>
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        form={form}
        initialValues={{
          transportType: 'FTL',
          isLeavingAmount: 0,
          unitName: '吨',
          payMethod: '0',
          businessType: '1',
          fleet: '0',
        }}>
        <Form.Item label="专线类型" name="fleet" style={{ marginLeft: 32 }} rules={rules}>
          <Radio.Group onChange={e => setIsFleet(e.target.value)}>
            <Radio value="0">个人单</Radio>
            <Radio value="1" style={{ marginLeft: 16 }}>
              车队单
            </Radio>
          </Radio.Group>
        </Form.Item>
        {/* 车队长 */}
        {isFleet === '1' && (
          <Form.Item
            label="车队长手机号"
            name="fleetCaptionPhone"
            style={{ marginLeft: 32 }}
            validateFirst={true}
            rules={[
              {
                required: true,
                whitespace: true,
                message: '内容不可为空',
              },
              {
                pattern: /^[1][2,3,4,5,6,7,8,9][0-9]{9}$/,
                message: '请输入有效的联系电话',
              },
            ]}>
            <Input maxLength={11} placeholder="请输入车队长手机号" style={{ width: 200 }} />
          </Form.Item>
        )}
        {/* 业务类型 */}
        {whiteList ? (
          <Form.Item label="业务类型" name="businessType" style={{ marginLeft: 32 }} rules={rules}>
            <Radio.Group onChange={e => settlementMethod(e.target.value)}>
              <Radio value="1">普通业务</Radio>
              <Radio value="2" style={{ marginLeft: 16 }}>
                上站业务
              </Radio>
            </Radio.Group>
          </Form.Item>
        ) : (
          ''
        )}
        {/* 有效时间 */}
        {!isHiddenDate && (
          <Form.Item
            label="结束时间"
            name="loadTime"
            style={{ marginLeft: 32 }}
            rules={[{ required: true, message: '内容不可为空' }]}>
            {/* <DatePicker.RangePicker
              style={{ width: '100%' }}
              disabledDate={date => date < moment().add(-1, 'day')}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss"
            /> */}

            <DatePicker
              style={{ width: 264 }}
              disabledDate={date => date < moment().add(diffTime)}
              showTime={{
                defaultValue: moment('23:59:59', 'HH:mm:ss'),
              }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        )}
        <div className={styles.title}>
          <span className={styles.line}></span>路线填写
        </div>

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
                style={{ width: 264 }}
                mode="contract"
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

        {/* 发货地址 */}
        {/* {fromAddress.id && ( */}
        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item
              label="发货地址"
              name="fromAddressId"
              style={{ marginLeft: 32 }}
              rules={[{ required: true, message: '选项不能为空' }]}>
              <Select
                // loading={fromAddressLoading}
                placeholder="请选择发货地址"
                onChange={value => setFromAddressId(value)}
                showSearch
                allowClear
                optionFilterProp="children"
                // onPopupScroll={async e => {
                //   const { clientHeight, scrollHeight, scrollTop } = e.target;
                //   if (clientHeight + scrollTop === scrollHeight && !fromAddressLoading && !fromAddressEmpty) {
                //     setFromAddressLoading(true);
                //     const addressList = await getAddressList({ page: fromAddressList.page + 1 });
                //     // 当前页已经是最大页
                //     setFromAddressEmpty(addressList.page === addressList.pages);
                //     setFromAddressList(state => {
                //       const { data, page } = state;
                //       return { data: [...data, ...addressList.data], page: addressList.page };
                //     });
                //     setFromAddressLoading(false);
                //   }
                // }}
              >
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

        {/* 发货人 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>发货人
            </div>
          }
          style={{ marginLeft: 32, marginBottom: 0 }}
          wrapperCol={{ span: 19 }}>
          <Form.Item
            style={{ display: 'inline-block', width: 200 }}
            name="fromName"
            rules={[
              {
                required: onlyPound === 0,
                whitespace: true,
                message: '内容不可为空',
              },
              {
                pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
                message: '内容长度不能小于2个汉字',
              },
            ]}>
            <Input placeholder="请输入发货人姓名" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            style={{ display: 'inline-block', width: 200, marginLeft: 8 }}
            name="fromMobilePhone"
            rules={[
              {
                required: onlyPound === 0,
                whitespace: true,
                message: '内容不可为空',
              },
              {
                pattern: /^[0-9]*$/,
                message: '请输入有效的联系电话',
              },
            ]}>
            <Input maxLength={11} placeholder="请输入发货人电话" style={{ width: 200 }} />
          </Form.Item>
        </Form.Item>
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
        {/* 收货地址 */}
        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item
              label="收货地址"
              name="toAddressId"
              style={{ marginLeft: 32 }}
              rules={[{ required: true, message: '选项不能为空' }]}>
              <Select
                // loading={toAddressList.loading}
                placeholder="请选择收货地址"
                showSearch
                allowClear
                optionFilterProp="children"
                onChange={value => setToAddressId(value)}>
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
        {/* 收货人 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>收货人
            </div>
          }
          style={{ marginLeft: 32 }}
          wrapperCol={{ span: 19 }}>
          <Form.Item
            style={{ display: 'inline-block', width: 200 }}
            name="receiverName"
            rules={[
              {
                required: onlyPound === 0,
                whitespace: true,
                message: '内容不可为空',
              },
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
                required: onlyPound === 0,
                whitespace: true,
                message: '内容不可为空',
              },
              {
                pattern: /^[0-9]*$/,
                message: '请输入有效的联系电话',
              },
            ]}>
            <Input maxLength={11} placeholder="请输入收货人电话" style={{ width: 200 }} />
          </Form.Item>
        </Form.Item>
        {/* 收货人1 */}
        {/* {otherReceiver ? (
          <Form.Item
            required={otherReceiver}
            colon={otherReceiver}
            label={otherReceiver ? '收货人1' : ' '}
            wrapperCol={{ span: 16 }}
            style={{ marginBottom: 0 }}>
            <Form.Item style={{ display: 'inline-block', width: '45%' }} name="receiver2Name" rules={name_rules}>
              <Input placeholder="请输入收货人姓名" />
            </Form.Item>
            <Form.Item
              style={{ display: 'inline-block', width: '52%', marginLeft: 10 }}
              name="receiver2MobilePhone"
              rules={phone_rules}>
              <Input maxLength={11} placeholder="请输入收货人电话" />
            </Form.Item>
            <MinusCircleOutlined
              className={styles['remove-button']}
              onClick={() => setOther(false)}
              style={{ right: -25, top: 15 }}
            />
          </Form.Item>
        ) : null} */}
        {/* <Divider dashed /> */}
        <div className={styles.title}>
          <span className={styles.line}></span>货物填写
        </div>
        {/* 货品名称 */}
        <Row style={{ width: 600 }}>
          <Col span={11}>
            <Form.Item name="goodsType" style={{ marginLeft: 32 }} rules={rules} label="货品名称">
              <Select
                style={{ width: 264 }}
                placeholder="请选择货品名称"
                showSearch
                allowClear
                optionFilterProp="children"
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
        {/* 货品方式 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>运输方式
            </div>
          }
          name="transportType"
          style={{ marginLeft: 32 }}>
          <Radio.Group>
            <Radio value="FTL">整车运输</Radio>
            <Radio value="LTL" style={{ marginLeft: 16 }}>
              零担运输
            </Radio>
          </Radio.Group>
        </Form.Item>
        {/* 运费单价 */}
        <Row className={styles.unitPriceRailWay}>
          <Col span={10}>
            <Form.Item
              {...oneformItemLayout}
              label="运费单价"
              name="unitPrice"
              style={{ marginLeft: 32 }}
              validateFirst={true}
              rules={[
                {
                  required: onlyPound === 0,
                  whitespace: true,
                  message: '内容不能为空',
                },
                ...number_rules,
              ]}>
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
        {/* 货物单价 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>货物单价
            </div>
          }
          name="goodsUnitPrice"
          style={{ marginLeft: 32 }}
          validateFirst={true}
          rules={[
            {
              required: allowLoss,
              whitespace: allowLoss,
              message: '内容不可为空',
            },
            ...number_rules,
          ]}>
          <Input
            placeholder="请输入货物单价"
            style={{ width: 264 }}
            addonAfter={<span>元/{unitName}</span>}
            disabled={contract && Object.keys(contract).length > 0 ? true : false}
          />
        </Form.Item>
        {/* 货物总量 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>货物总量
            </div>
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
        {/* <Divider dashed /> */}
        <div className={styles.title}>
          <span className={styles.line}></span>结算设置
        </div>
        {/* 运费个位抹零 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>运费抹零
            </div>
          }
          style={{ marginLeft: 32 }}
          wrapperCol={{ span: 20 }}
          name="eraseZero">
          <Switch size="small" />
        </Form.Item>
        {/* 路损计算 */}
        {form.getFieldValue('payMethod') !== '1' && (
          <div style={{ width: 600, position: 'relative' }}>
            <Form.Item
              label={
                <div>
                  <span className={styles.noStar}>*</span>路损计算
                </div>
              }
              name="lossMark"
              style={{ marginLeft: 32 }}>
              <Switch size="small" defaultChecked={allowLoss} onChange={v => setAllowLoss(v)} />
            </Form.Item>
            <Tooltip title="运费金额=运费单价*运输重量-[(路损-允许路损)乘以运费单价]" placement="right">
              <span
                style={{
                  fontSize: 12,
                  cursor: 'pointer',
                  position: 'absolute',
                  left: 221,
                  top: 8,
                }}>
                计算规则
                <QuestionCircleFilled style={{ fontSize: 14, marginLeft: 5, color: '#D0D4DB' }} />
              </span>
            </Tooltip>
          </div>
        )}
        {/* 允许路损 */}
        {form.getFieldValue('payMethod') !== '1' && allowLoss && (
          <Form.Item
            label="允许路损"
            required
            name="lossAmount"
            style={{ marginLeft: 32 }}
            validateFirst={true}
            rules={[
              { required: true, whitespace: true, message: '内容不能为空' },
              {
                type: 'number',
                message: '请输入有效的数字',
                transform: value => Number(value),
              },
              {
                pattern: /^([1-9][0-9]*(\.\d*)?)|(0\.\d*)$/,
                message: '内容必须大于0',
              },
              {
                pattern: /^(-?\d+)(\.\d{1,2})?$/,
                message: '不可超过2位小数',
              },
            ]}>
            <Input placeholder="请输入路损" addonAfter={<span>{unitName}</span>} style={{ width: 264 }} />
          </Form.Item>
        )}
        {/* 结算方式 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>结算方式
            </div>
          }
          wrapperCol={{ span: 20 }}
          name="payMethod"
          style={{ marginLeft: 32, width: 700 }}>
          <Radio.Group style={{ marginLeft: -20 }}>
            <Radio value="1">按发货净重结算</Radio>
            <Radio value="0" style={{ marginLeft: 16 }}>
              按收货净重结算
            </Radio>
            <Radio value="2" style={{ marginLeft: 16 }}>
              按原发与实收较小的结算
            </Radio>
          </Radio.Group>
        </Form.Item>
        <div className={styles.title}>
          <span className={styles.line}></span>其他设置
        </div>
        {/* 余量提醒 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>
              余量提醒
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
                <QuestionCircleFilled
                  style={{
                    marginRight: 0,
                    marginLeft: 5,
                    cursor: 'pointer',
                    color: '#D0D4DB',
                  }}
                />
              </Tooltip>
            </div>
          }
          wrapperCol={{ span: 20 }}
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
              {/* <Input placeholder="请输入限制进站余量" suffix={`${unitName}`} /> */}
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
        {/* 其他货主可见 */}
        {/* <Form.Item label="其他货主可见" wrapperCol={{ span: 20 }} name="otherGoodsOwnerVisible">
          <Switch size="small" />
        </Form.Item> */}
        {/* 托运人 */}
        {/* <Form.Item label="托运人" name="consignor">
          <Input placeholder={consignor} />
        </Form.Item> */}
        {/* 隐藏数据 */}
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
            className={styles.remark}
            label={
              <div>
                <span className={styles.noStar}>*</span>备注
              </div>
            }
            name="remark"
            style={{ marginLeft: 32, height: 80 }}
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

        <Form.Item {...tailFormItemLayout} style={{ marginTop: 32, marginLeft: 32 }}>
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
