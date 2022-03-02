import { QuestionCircleFilled } from '@ant-design/icons';
import { Button, Input, Select, Modal, DatePicker, Tooltip, Radio, Switch, Form, Row, Col, message } from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { railWay, customer, getCommon } from '@api';
import CreateGoods from './createGoods';
import { useState, useEffect, useCallback, useRef } from 'react';
import { AutoInputRoute, WareHouseSelect } from '@components';
import AddressForm from '@components/CustomerDetail/address/form';
import CompanyForm from '@components/CustomerDetail/company/form';
import router from 'next/router';
import { User, WhiteList } from '@store';
import WarehouseFrom from './warehouseFrom';
const { Option } = Select;
const { TextArea } = Input;
// 货运方式
const TransportType = {
  FTL: '整车运输',
  LTL: '零担运输',
};
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const tailFormItemLayout = {
  //   wrapperCol: {
  //     offset: 5,
  //     span: 14,
  //   },
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
// 姓名验证
// 电话验证
// 数字验证

// 对象验证
// 下拉对象验证

// 必须是数字，只能大于0，只能输入两位小数
const number_rules = [
  {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: '只能是数字，且不可超过2位小数',
  },
  {
    validator: (rule, value) => {
      if (+value > 0) {
        return Promise.resolve();
      } else {
        return Promise.reject('内容必须大于0');
      }
    },
  },
];

// 除了吨以外的单位校验

// 获取货物类型
const getGoodsType = async () => {
  const res = await railWay.getGoodsType();
  if (res.status === 0) {
    // const result = res.result.map(({ goodsName }) => goodsName);
    // 去重
    // return Array.from(new Set(result));
    return res.result;
  } else {
    return [];
  }
};

// 获取地址列表
const getAddressList = async ({ page = 1, limit = 1000 } = {}) => {
  const res = await customer.getCustomerAddressList({ params: { page, limit } });
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
const RailWayForm = ({ serverTime, onSubmit }) => {
  const { userInfo, loading } = User.useContainer();
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

  const [isWarehouse, setIsWarehouse] = useState(false);
  const [isShowWarehouse, setIsShowWarehouse] = useState(false);
  // 危险品提示
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

  // 信息费收取方式
  const [infoFeeUnitName, setInfoFeeUnitName] = useState(0);

  const [isFleet, setIsFleet] = useState(0);
  const wareHouseRef = useRef(null);
  const setHiddenDate = async () => {
    const res = await getCommon();
    if (res.status === 0) {
      const currentUserName = userInfo.username;
      const hiddenUserName = res.result.find(item => item.key === 'noValidTimeForRoute').url;
      console.log('hiddenUserName: ', hiddenUserName);
      console.log('currentUserName: ', currentUserName);
      if (hiddenUserName.includes(currentUserName)) {
        setIsHiddenDate(true);
      }
      const hiddenWarehouseName = res.result.find(item => item.key === 'HAS_WAREHOUSE').url;

      if (hiddenWarehouseName.includes(currentUserName)) {
        setIsShowWarehouse(true);
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
      // setHiddenDate();
      isShowBusinessType();
    })();
  }, []);

  useEffect(() => {
    if (userInfo?.username) {
      setHiddenDate();
    }
  }, [userInfo]);

  const isShowBusinessType = async () => {
    const res = await railWay.userSettings();

    if (res.status === 0) {
      setWhiteList(res.result.is_show_business_type);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 选择地址

  // 监听发货id
  useEffect(() => {
    const toAddress = addressList.find(({ id }) => id === toAddressId);

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
      goodsUnitPrice: values.goodsUnitPrice ? (values.goodsUnitPrice * 100).toFixed(0) * 1 : undefined,
      onlyPound: '0',
      // 车队单默认即时付
      // payPath: values.fleet === '1' ? '0' : undefined,
      lossMark: values.lossMark ? '1' : '0',
      lossAmount: values.lossAmount ? (values.lossAmount * 1000).toFixed(0) * 1 : undefined,
      receiverName: values.receiverName,
      receiverMobilePhone: values.receiverMobilePhone,
      fromName: values.fromName,
      fromMobilePhone: values.fromMobilePhone,
      totalAmount: values.totalAmount ? (values.totalAmount * 1000).toFixed(0) * 1 : undefined,
      transportType: values.transportType,
      unitName: values.unitName,
      unitPrice: values.unitPrice && (values.unitPrice * 100).toFixed(0) * 1,
      startLoadTime: startLoadTime && startLoadTime.format('YYYY-MM-DD HH:mm:ss'),
      lastLoadTime: lastLoadTime && lastLoadTime.format('YYYY-MM-DD HH:mm:ss'),
      fleetCaptionPhone: values.fleetCaptionPhone || undefined,
      otherGoodsOwnerVisible: values.otherGoodsOwnerVisible ? '1' : '0',
      eraseZero: values.eraseZero ? '1' : '0',
      payMethod: values.payMethod,
      remark: values.remark,
      wareHouseId: values.wareHouseId > 0 ? values.wareHouseId : undefined,
      //业务类型
      businessType: values.businessType || '1',
      // 信息费单价
      unitInfoFee:
        isFleet && values.infoFeeUnitName === 1
          ? values.unitInfoFee && (values.unitInfoFee * 100).toFixed(0) * 1
          : undefined,
      // 服务费
      serviceFee:
        isFleet && values.infoFeeUnitName === 0
          ? values.unitInfoFee && (values.unitInfoFee * 100).toFixed(0) * 1
          : undefined,
      // 信息费单位
      // infoFeeUnitName: isFleet ? values.infoFeeUnitName : undefined,
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
      transportType: { label: '货运方式：', value: TransportType[values.transportType] },
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
      receiver: { label: '收货人：', value: `${values.receiverName || '-'}  ${values.receiverMobilePhone || '-'}` },
      send: { label: '发货人：', value: `${values.fromName || '-'} ${values.fromMobilePhone}` },
      otherGoodsOwnerVisible: { label: '其他货主可见：', value: `${values.otherGoodsOwnerVisible ? '是' : '否'}` },
      eraseZero: { label: '运费个位抹零：', value: `${values.eraseZero ? '是' : '否'}` },
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
      dataView.receiver1 = { label: '收货人1：', value: `${values.receiver2Name}  ${values.receiver2MobilePhone}` };
    }

    dataView.lossMark = { label: '路损计算：', value: values.lossMark ? '是' : '否' };
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
    dataView.isLeavingAmount = { label: '余量提醒：', value: isLeavingAmount === 1 ? '开启' : '关闭' };
    if (isLeavingAmount === 1) {
      dataView.ruleLeavingAmount = {
        label: '限制进站余量：',
        value: `${(values.ruleLeavingAmount * 1).toFixed(2)} ${values.unitName}`,
      };
      dataView.routeContactMobile = { label: '专线负责人：', value: values.routeContactMobile };
    }
    if (data.unitName === '吨' && values.infoFeeUnitName === 1 && data.unitInfoFee * 2 > data.unitPrice) {
      message.warn('信息费单价不可超过运费单价的50%，请重新输入');
      return;
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

  const refresh = async () => {
    setIsWarehouse(false);
    await wareHouseRef.current.refresh();
  };

  Object.keys(options).forEach(item => {
    selectChildren.push(<Option key={item}>{options[item]}</Option>);
  });
  console.log(goodList);

  // 信息费收取方式变化
  const handleInfoFeeUnitNameChange = e => {
    setInfoFeeUnitName(e.target.value);
  };

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
          wareHouseId: -1,
          infoFeeUnitName: 0,
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
            value={contract.title}
            allowClear
            placeholder="请选择合同"
            onChange={(e, val) => {
              onChangeContract(e, val);
            }}
          />
          <Button
            className={styles['btn-new']}
            type="link"
            onClick={() => router.push('/contractManagement/addContract')}>
            新增
          </Button>
        </Form.Item>

        <Form.Item
          label="发货企业"
          name="validateFromAddress"
          style={{ marginLeft: 32 }}
          rules={[{ required: true, whitespace: true, message: '企业不可为空' }]}>
          <AutoInputRoute
            style={{ width: 480 }}
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
          <Button className={styles['btn-new']} type="link" onClick={() => setCompanyModal(true)}>
            新增
          </Button>
        </Form.Item>

        {/* 发货地址 */}
        <div style={{ display: 'flex' }}>
          <Form.Item
            label="发货地址"
            name="fromAddressId"
            style={{ marginLeft: 32 }}
            rules={[{ required: true, message: '选项不能为空' }]}>
            <Select
              style={{ width: 480 }}
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
          <Button className={styles['btn-new']} type="link" onClick={() => setAddressModal(true)}>
            新增
          </Button>
        </div>

        {/* 发货人 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>发货人
            </div>
          }
          style={{ marginLeft: 32, marginBottom: 0, height: 56 }}
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
        <Form.Item
          label="收货企业"
          name="validateToAddress"
          style={{ marginLeft: 32 }}
          rules={[{ required: true, whitespace: true, message: '企业不可为空' }]}>
          <AutoInputRoute
            style={{ width: 480 }}
            mode="company"
            value={toCompany.companyName}
            allowClear
            newCompany={newCompany}
            placeholder="请选择收货企业"
            onChange={(e, val) => onChangeToCompany(e, val)}
            disContent={contract && Object.keys(contract).length > 0 ? true : false}
          />
          <Button className={styles['btn-new']} type="link" onClick={() => setCompanyModal(true)}>
            新增
          </Button>
        </Form.Item>

        {/* 收货地址 */}
        <div style={{ display: 'flex' }}>
          <Form.Item
            label="收货地址"
            name="toAddressId"
            style={{ marginLeft: 32 }}
            rules={[{ required: true, message: '选项不能为空' }]}>
            <Select
              style={{ width: 480 }}
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
          <Button className={styles['btn-new']} type="link" onClick={() => setAddressModal(true)}>
            新增
          </Button>
        </div>

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

        <div className={styles.title}>
          <span className={styles.line}></span>货物填写
        </div>
        {/* 货品名称 */}
        <div style={{ display: 'flex' }}>
          <Form.Item name="goodsType" style={{ marginLeft: 32 }} rules={rules} label="货品名称">
            <Select
              style={{ width: 264 }}
              placeholder="请选择货品名称"
              showSearch
              allowClear
              optionFilterProp="children"
              optionLabelProp="label"
              disabled={contract && Object.keys(contract).length > 0 ? true : false}>
              {goodList.map(item => (
                <Option
                  key={`${item.id}`}
                  value={item.goodsName}
                  label={item.goodsName}
                  title={`${item.goodsName} ${' ' + item.addressCompany}`}>
                  {item.goodsName}
                  {' ' + item.addressCompany}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button className={styles['btn-new']} type="link" onClick={() => setGoodModal(true)}>
            新增
          </Button>
        </div>

        {isShowWarehouse && (
          <Form.Item
            label="预计仓库"
            name="wareHouseId"
            validateFirst={true}
            style={{ marginLeft: 32 }}
            rules={[
              {
                required: true,
                message: '请选择预计仓库',
              },
            ]}>
            <WareHouseSelect allowClear placeholder="请选择仓库" style={{ width: 264 }} ref={wareHouseRef} />

            <Button type="link" onClick={() => setIsWarehouse(true)} className={styles['btn-new']}>
              新增
            </Button>
          </Form.Item>
        )}

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
              rules={[{ required: onlyPound === 0, whitespace: true, message: '内容不能为空' }, ...number_rules]}>
              <Input placeholder="请输入运费单价" addonAfter={<span>元</span>} style={{ width: 264 }} />
            </Form.Item>
          </Col>
          <Col className={styles.unitName_yan} span={3} style={{ position: 'absolute', left: 400 }}>
            <Form.Item name="unitName" style={{ position: 'relative', left: 32 }}>
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
        {/* 车队单时显示信息费收取方式及信息费单价两项 */}
        {isFleet === '1' && (
          <>
            <Form.Item
              label={
                <div>
                  <span className={styles.noStar}>*</span>信息费收取方式
                </div>
              }
              name="infoFeeUnitName"
              style={{ marginLeft: 32 }}>
              <Radio.Group onChange={handleInfoFeeUnitNameChange}>
                <Radio value={0}>按车收</Radio>
                <Radio value={1} style={{ marginLeft: 16 }}>
                  按吨收
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="信息费单价"
              name="unitInfoFee"
              style={{ marginLeft: 32 }}
              validateFirst={true}
              rules={[
                {
                  required: isFleet === '1',
                  whitespace: isFleet === '1',
                  message: '内容不可为空',
                },
                ...number_rules,
              ]}>
              <Input
                placeholder="请输入信息费单价"
                style={{ width: 264 }}
                addonAfter={<span>元/{infoFeeUnitName === 0 ? '车' : '吨'}</span>}
              />
            </Form.Item>
          </>
        )}
        {/* 货物单价 */}
        <Form.Item
          label={
            allowLoss ? (
              '货物单价'
            ) : (
              <div>
                <span className={styles.noStar}>*</span>货物单价
              </div>
            )
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
            // ...number_rules,
            {
              pattern: /^\d+(\.\d{1,2})?$/,
              message: '只能是数字，且不可超过2位小数',
            },
            {
              validator: (rule, value) => {
                if (+value > 0 || !allowLoss) {
                  return Promise.resolve();
                } else {
                  return Promise.reject('内容必须大于0');
                }
              },
            },
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
          label="货物总量"
          name="totalAmount"
          style={{ marginLeft: 32 }}
          validateFirst={true}
          rules={[
            {
              required: true,
              message: '内容不可为空',
            },
            {
              pattern: /^\d+(\.?\d{1,2})?$/,
              message: '货物总量只能是数字，最多两位小数',
            },
          ]}>
          <Input placeholder="请输入货物总量" style={{ width: 264 }} addonAfter={<span>{unitName}</span>} />
        </Form.Item>

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
              { type: 'number', message: '请输入有效的数字', transform: value => Number(value) },
              { pattern: /^([1-9][0-9]*(\.\d*)?)|(0\.\d*)$/, message: '内容必须大于0' },
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
          <Radio.Group>
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
                <QuestionCircleFilled style={{ marginRight: 0, marginLeft: 5, cursor: 'pointer', color: '#D0D4DB' }} />
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

        {/* 隐藏数据 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>隐藏数据
            </div>
          }
          name={'hiddenInfo'}
          style={{ marginLeft: 32 }}>
          <Select mode="tags" allowClear style={{ width: 480 }} placeholder="请选择">
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
              style={{ resize: 'none', position: 'relative', width: 480 }}
            />
          </Form.Item>
        </div>

        <Form.Item
          {...tailFormItemLayout}
          style={{ margin: '24px 0 32px 32px', position: 'relative', left: 128, width: '88px' }}>
          <Button type="primary" htmlType="submit">
            发布专线
          </Button>
        </Form.Item>
      </Form>
      {/* 新增仓库 */}
      <Modal
        title="新增仓库"
        onCancel={() => {
          setIsWarehouse(false);
        }}
        visible={isWarehouse}
        destroyOnClose
        footer={null}>
        <WarehouseFrom onSubmit={refresh} close={() => setIsWarehouse(false)} />
      </Modal>
      {/* 添加货品弹窗 */}
      <Modal
        title="新增货品名称"
        onCancel={() => {
          setGoodModal(false);
        }}
        visible={goodModal}
        destroyOnClose
        footer={null}>
        <CreateGoods onCreated={createFinish} close={() => setGoodModal(false)} />
      </Modal>
      {/* 添加地址弹窗 */}
      <Modal
        title="新增地址"
        onCancel={() => {
          setAddressModal(false);
        }}
        visible={addressModal}
        width={640}
        destroyOnClose
        footer={null}>
        <AddressForm
          formData={{}}
          onSubmit={submitAddress}
          onClose={() => {
            setAddressModal(false);
          }}
        />
      </Modal>
      {/* 添加企业弹窗 */}
      <Modal
        title="新增企业"
        onCancel={() => {
          setCompanyModal(false);
        }}
        visible={companyModal}
        destroyOnClose
        footer={null}
        width={640}>
        <CompanyForm
          onSubmit={submitCompany}
          formData={{}}
          onClose={() => {
            setCompanyModal(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default RailWayForm;
