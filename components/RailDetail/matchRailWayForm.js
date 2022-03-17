import { QuestionCircleFilled } from '@ant-design/icons';
import { Button, Input, Select, Switch, Modal, Row, Col, Tooltip, Radio, Form, message } from 'antd';
import styles from './styles.less';
import { AutoInputRoute, WareHouseSelect } from '@components';
import { railWay, customer, getCommon } from '@api';
import CreateGoods from './createGoods';
import { useState, useEffect, useCallback, useRef } from 'react';
import AddressForm from '@components/CustomerDetail/address/form';
import CompanyForm from '@components/CustomerDetail/company/form';
import router from 'next/router';
import WarehouseFrom from './warehouseFrom';
import { User } from '@store';
const { Option } = Select;
const { TextArea } = Input;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
};

const tailFormItemLayout = {
  // wrapperCol: {
  //   offset: 5,
  //   span: 14,
  // },
};

// 校验规则
const rules = [{ required: true, whitespace: true, message: '选项不可为空' }];

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
const RailWayForm = ({ onSubmit }) => {
  const { userInfo, loading } = User.useContainer();
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

  // 选择合同
  const [contract, setContract] = useState({});
  const [isWarehouse, setIsWarehouse] = useState(false);

  const wareHouseRef = useRef(null);
  const [isShowWarehouse, setIsShowWarehouse] = useState(false);

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
      setHiddenDate();
    })();
  }, []);

  const setHiddenDate = async () => {
    const res = await getCommon();
    if (res.status === 0) {
      const currentUserName = userInfo.username;

      const hiddenWarehouseName = res.result.find(item => item.key === 'HAS_WAREHOUSE').url;
      if (hiddenWarehouseName.includes(currentUserName)) {
        setIsShowWarehouse(true);
      }
    }
  };

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
    const hiddenInfo = {};

    Object.keys(options).forEach(item => {
      hiddenInfo[item] = values.hiddenInfo && values.hiddenInfo.includes(item) ? 1 : 0;
    });

    const fromAddress = addressList.find(({ id }) => id === fromAddressId);
    const toAddress = addressList.find(({ id }) => id === toAddressId);
    let data = {
      fromAddressCompanyId: fromCompany.id,
      toAddressCompanyId: toCompany.id,
      fromAddressId,
      toAddressId,
      goodsType: values.goodsType,
      onlyPound: '1',
      routeKind: '1',
      printPoundBill: values.printPoundBill,
      totalAmount: (values.totalAmount && values.totalAmount * 1000) || undefined,
      unitName: values.unitName,
      unitPrice: (values.unitPrice && values.unitPrice * 100) || undefined,
      fromName: values.fromName,
      fromMobilePhone: values.fromMobilePhone,
      receiverName: values.receiverName,
      receiverMobilePhone: values.receiverMobilePhone,
      remark: values.remark,
      wareHouseId: values.wareHouseId > 0 ? values.wareHouseId : undefined,
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

  const refresh = async () => {
    setIsWarehouse(false);
    await wareHouseRef.current.refresh();
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
          wareHouseId: -1,
        }}>
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
            value={contract.title}
            allowClear
            placeholder="请选择合同"
            onChange={(e, val) => {
              onChangeContract(e, val);
            }}
          />
          <Button
            type="link"
            className={styles['btn-new']}
            onClick={() => router.push('/contractManagement/addContract')}>
            新增
          </Button>
        </Form.Item>

        <div className={styles.title}>
          <span className={styles.line}></span>必填信息
        </div>

        {/* 发货企业 */}
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

        {/* 收货企业 */}
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

        {/* 货品名称 */}
        <div style={{ display: 'flex' }}>
          <Form.Item name="goodsType" rules={rules} label="货品名称" style={{ marginLeft: 32 }}>
            <Select
              showSearch
              style={{ width: 264 }}
              allowClear
              optionFilterProp="children"
              placeholder="请选择货品名称"
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
          <Col className={styles.unitName_yan} span={3} style={{ position: 'absolute', left: 390 }}>
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

        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>发货地址
            </div>
          }
          name="fromAddressId"
          style={{ marginLeft: 32 }}>
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
          <Button className={styles['btn-new']} type="link" onClick={() => setAddressModal(true)}>
            新增
          </Button>
        </Form.Item>

        {/* 发货联系人 */}
        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>发货人
            </div>
          }
          wrapperCol={{ span: 19 }}
          style={{ marginLeft: 32, height: 56 }}>
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

        <Form.Item
          label={
            <div>
              <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>收货地址
            </div>
          }
          name="toAddressId"
          style={{ marginLeft: 32 }}>
          <Select
            style={{ width: 480 }}
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
          <Button className={styles['btn-new']} type="link" onClick={() => setAddressModal(true)}>
            新增
          </Button>
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>收货人
            </div>
          }
          wrapperCol={{ span: 19 }}
          style={{ marginLeft: 32, height: 56 }}>
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
          <Select mode="tags" allowClear style={{ width: 480 }} placeholder="请选择">
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
            name="remark"
            style={{ marginLeft: 32 }}
            validateFirst={true}
            rules={[
              {
                min: 4,
                message: '备注最少4个字',
              },
            ]}>
            <TextArea placeholder="请输入4~20以内备注" maxLength={20} rows={3} style={{ resize: 'none', width: 480 }} />
          </Form.Item>
        </div>
        <Form.Item
          {...tailFormItemLayout}
          style={{ margin: '24px 0 32px 32px', position: 'relative', left: 118, width: 88 }}>
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
        destroyOnClose
        visible={goodModal}
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
