import { useState, useEffect } from 'react';
import { QuestionCircleFilled, UploadOutlined } from '@ant-design/icons';
import { Input, Select, Button, Modal, Tooltip, message, Form, Radio, Switch, Row, Col } from 'antd';
import { railWay, contract as contractApi, order, customer } from '../../api';
import router from 'next/router';
import { UploadToOSS, AutoInputRoute } from '@components';
import ContractSearcher from './ContractSearcher';
import SelectBtn from '../RailDetail/selectBtn_new';
import { Format } from '@utils/common';
import styles from './styles.less';

const { Option } = Select;

// 表单格式
const formItemLayout = {
  labelAlign: 'left',
};

const oneformItemLayout = {
  wrapperCol: {
    span: 16,
  },
};

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

const Index = ({ onSubmit, modalVisible = false, changeModal, data = {}, orderId = '' }) => {
  const [form] = Form.useForm();

  // 合同id
  const [contractId, setContractId] = useState();

  // 承运企业
  const [transportCompany, setTransportCompany] = useState({});
  // const [newCompany, setNewCompany] = useState(false);

  // 专线类型
  const [isFleet, setIsFleet] = useState('0');

  // 信息费收取方式
  const [infoFeeUnitName, setInfoFeeUnitName] = useState(0);

  // 允许路损 checkbox
  const [allowLoss, setAllowLoss] = useState(false);

  // 结算方式
  const [payMethod, setPayMethod] = useState('1');

  // 货品单位
  const [unitNameList, setUnitNameList] = useState([]);
  const [unitName, setUnitName] = useState('吨');

  // 承运企业列表
  const [transportCompanyList, setTransportCompanyList] = useState([]);

  // 收货地址
  const [toAddress, setToAddress] = useState({});
  // 发货地址
  const [fromAddress, setFromAddress] = useState({});
  //发货企业
  const [saleCompany, setSaleCompany] = useState({});
  //收货企业
  const [purchaseCompany, setPurchaseCompany] = useState({});

  // 是否有审核驳回的订单
  const [isModalVisible, setIsModalVisible] = useState(false);
  // 审批驳回的订单id
  const [needSubmitId, setNeedSubmitId] = useState(null);

  useEffect(() => {
    (async () => {
      // 绑定货品单位
      setUnitNameList(await getGoodsUnitName());
      // 获取承运企业列表
      setTransportCompanyList(await getTransportCompanyList());
    })();
  }, []);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setTransportCompany({ id: data?.carrierId, companyName: data?.carrierCompany });
      setSaleCompany({ id: data?.fromUserId });
      setPayMethod(data?.route?.payMethod.toString());
      setAllowLoss(data?.route?.lossMark);
      setUnitName(data?.unitName);
      setIsFleet(data?.route?.fleetCaptionPhone ? '1' : '0');
      setContractId(data?.contract?.id);

      const file = JSON.parse(data?.annexUrl).map(item => {
        return {
          name: item.name,
          response: { fileName: item.name, fileUrl: item.url },
        };
      });

      form.setFieldsValue({
        contractNo: data?.contract?.contractNo,
        title: data?.contract?.title,
        // fromAddress: data?.contract?.fromCompany,
        // fromAddressName: data?.contract?.fromAddressName,
        // toAddress: data?.contract?.toCompany,
        // toAddressName: data?.contract?.toAddressName,
        goodsName: data?.contract?.goodsName,
        totalWeight: Format.weight(data?.contract?.totalWeight),
        remainWeight: Format.weight(data?.contract?.remainWeight),

        validateTransportCompany: data?.carrierCompany,
        unitPrice: Format.price(data?.unitPrice),
        unitName: data?.unitName,
        totalAmount: Format.weight(data?.totalAmount),
        files: file,

        fleet: data?.route?.fleetCaptionPhone ? '1' : '0',
        fleetCaptionPhone: data?.route?.fleetCaptionPhone,
        fleetCaptionName: data?.route?.fleetCaptionName,
        payInto: data?.route?.payInto?.toString() || '1',
        infoFeeUnitName: data?.route?.unitInfoFee !== 0 ? 1 : 0,
        unitInfoFee: Format.price(data?.route?.unitInfoFee),
        serviceFee: Format.price(data?.route?.serviceFee),
        payMethod: data?.route?.payMethod?.toString(),
        lossMark: data?.route?.lossMark,
        lossAmount: Format.weight(data?.route?.lossAmount),
        eraseZero: data?.route?.eraseZero,
        validDate: data?.route?.validDate?.toString(),
      });
    }
  }, [data]);

  // 获取承运企业列表
  const getTransportCompanyList = async () => {
    const res = await customer.getOwnerByCompany();
    if (res.status === 0) {
      return res.result;
    }
  };

  // 货品货品单位
  const getGoodsUnitName = async () => {
    const res = await railWay.getUnitName();
    if (res.status === 0) {
      return res.result;
    }
  };

  const beforeUpload = file => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('上传文件单个大小限制10M内!');
    }
    return isLt10M;
  };

  // 表单提交
  const handleSubmit = async values => {
    let fileflag = false;
    const file = values.files.map(item => {
      const { response = {} } = item;
      if (!response.fileName || !response.fileUrl) {
        fileflag = true;
      }
      return { name: response.fileName, url: response.fileUrl };
    });

    const params = {
      contractId: contractId || undefined,

      carrierId: transportCompany.id,
      totalAmount: values.totalAmount ? (values.totalAmount * 1000).toFixed(0) * 1 : undefined,
      unitPrice: values.unitPrice && (values.unitPrice * 100).toFixed(0) * 1,
      unitName: unitName || undefined,
      annexUrl: JSON.stringify(file),

      fleetCaptionPhone: isFleet ? values.fleetCaptionPhone : undefined,
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
      payInto: isFleet === '1' ? values.payInto : '1',
      payMethod: values.payMethod,
      lossMark: values.lossMark ? '1' : '0',
      lossAmount: values.lossAmount ? (values.lossAmount * 1000).toFixed(0) * 1 : undefined,
      eraseZero: values.eraseZero,
      validDate: values.validDate * 1,
      fromUserId: saleCompany.id,
      fromAddressId: fromAddress.id,
      toAddressCompanyId: purchaseCompany.id,
      toAddressId: toAddress.id,
    };

    if (params.unitName === '吨' && values.infoFeeUnitName === 1 && params.unitInfoFee * 2 > params.unitPrice) {
      message.warn('信息费单价不可超过运费单价的50%，请重新输入');
      return;
    }

    if (fileflag) {
      message.error('上传附件有错误或正在上传中!');
      return;
    }

    onSubmit(params);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // const onChangeTransportCompany = (e, val) => {
  //   if (e) {
  //     const item = val.item;
  //     setTransportCompany({ companyName: val.children, id: item.key });
  //     form.setFieldsValue({
  //       validateTransportCompany: val.children,
  //     });
  //   } else {
  //     setTransportCompany({});
  //     form.setFieldsValue({
  //       validateTransportCompany: undefined,
  //     });
  //     setNewCompany(true);
  //     //搜索后需要重新调接口
  //     setTimeout(() => {
  //       setNewCompany(false);
  //     }, 1000);
  //   }
  // };

  // 信息费收取方式变化
  const handleInfoFeeUnitNameChange = e => {
    setInfoFeeUnitName(e.target.value);
  };

  // 选择合同
  const handleContractChange = async (_, option) => {
    const {
      id,
      contractNo,
      title,
      sellUserName,
      buyUserName,
      // fromAddress,
      // fromAddressName,
      // toAddress,
      // toAddressName,
      goodsName,
      totalWeight,
      remainWeight,
    } = option?.item;
    setContractId(id);
    form.setFieldsValue({
      contractNo,
      title,
      sellUserName,
      buyUserName,
      // fromAddress,
      // fromAddressName,
      // toAddress,
      // toAddressName,
      goodsName,
      totalWeight: Format.weight(totalWeight),
      remainWeight: Format.weight(remainWeight),
    });
    if (orderId) return;
    const { status, result = [] } = (await order.checkContractOrder({ contractId: id })) || {};
    if (status === 0 && result.length) {
      setNeedSubmitId(result[0].id);
      setIsModalVisible(true);
    }
  };

  const handleCaptainPhone = async e => {
    const reg = /^[1][2,3,4,5,6,7,8,9][0-9]{9}$/;
    form.setFieldsValue({ fleetCaptionName: '' });
    if (reg.test(e.target.value)) {
      //获取车队长名称
      const res = await order.getFleetCaptainByMobile({ mobile: e.target.value });

      if (res.status === 0) {
        form.setFieldsValue({ fleetCaptionName: res.result.name });
      } else {
        message.error(res.detail || res.description);
      }
    }
  };

  const handleOk = () => router.replace(`/orderManagement/recommit?id=${needSubmitId}`);

  const handleCancel = () => {
    setIsModalVisible(false);
    changeModal && changeModal(false);
  };

  useEffect(() => {
    setIsModalVisible(modalVisible);
  }, [modalVisible]);

  return (
    <div className={styles.content}>
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        form={form}
        initialValues={{
          fleet: '0',
          infoFeeUnitName: 0,
          payInto: '1',
          payMethod: '1',
          validDate: '365',
          unitName: '吨',
        }}>
        <div className={styles.title}>
          <span className={styles.line}></span>关联合同信息
        </div>

        <Form.Item
          label="合同编号"
          name="contractNo"
          rules={[{ required: true, whitespace: true, message: '合同不可为空' }]}>
          <ContractSearcher
            placeholder="请输入合同编号"
            style={{ width: 264 }}
            keyWord="contractNo"
            getRemoteData={contractApi.contract_list}
            onChange={handleContractChange}
          />
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>合同名称
            </div>
          }
          name="title">
          <Input placeholder="选择合同后自动填充" disabled style={{ width: 264 }} />
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>出卖人
            </div>
          }
          name="sellUserName"
          // name="fromAddress"
        >
          <Input placeholder="选择合同后自动填充" disabled style={{ width: 264 }} />
        </Form.Item>

        {/* <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>发货地址
            </div>
          }
          name="fromAddressName">
          <Input placeholder="选择合同后自动填充" disabled style={{ width: 264 }} />
        </Form.Item> */}

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>买受人
            </div>
          }
          // name="toAddress"
          name="buyUserName">
          <Input placeholder="选择合同后自动填充" disabled style={{ width: 264 }} />
        </Form.Item>

        {/* <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>收货地址
            </div>
          }
          name="toAddressName">
          <Input placeholder="选择合同后自动填充" disabled style={{ width: 264 }} />
        </Form.Item> */}

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>货品名称
            </div>
          }
          name="goodsName">
          <Input placeholder="选择合同后自动填充" disabled style={{ width: 264 }} />
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>货物总量
            </div>
          }
          name="totalWeight">
          <Input placeholder="选择合同后自动填充" disabled style={{ width: 264 }} />
        </Form.Item>

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>货物余量
            </div>
          }
          name="remainWeight">
          <Input placeholder="选择合同后自动填充" disabled style={{ width: 264 }} />
        </Form.Item>

        <div className={styles.title}>
          <span className={styles.line}></span>订单信息
        </div>

        <Form.Item
          label="承运企业"
          name="validateTransportCompany"
          style={{ marginLeft: 32 }}
          rules={[{ required: true, whitespace: true, message: '企业不可为空' }]}>
          {/* <AutoInputRoute
            style={{ width: 480 }}
            mode="company"
            type="transport"
            value={transportCompany.companyName}
            allowClear
            placeholder="请选择承运企业"
            newCompany={newCompany}
            onChange={(e, val) => {
              onChangeTransportCompany(e, val), console.log(val);
            }}
            disContent={contract && Object.keys(contract).length > 0 ? true : false}
          />
          <Button type="link" style={{ display: 'none' }}>
            新增
          </Button> */}
          <Select
            style={{ width: 480 }}
            allowClear
            placeholder="请选择承运企业"
            showSearch
            onChange={(_, option) => {
              setTransportCompany(option?.item);
            }}>
            {transportCompanyList.map(item => (
              <Option key={item.id} value={item.companyName} item={item}>
                {item.companyName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="发货企业"
          name="fromUserId"
          style={{ marginLeft: 32 }}
          rules={[{ required: true, whitespace: true, message: '企业不可为空' }]}>
          {/* <AutoInputRoute
            style={{ width: 480 }}
            mode="company"
            type="transport"
            value={transportCompany.companyName}
            allowClear
            placeholder="请选择承运企业"
            newCompany={newCompany}
            onChange={(e, val) => {
              onChangeTransportCompany(e, val), console.log(val);
            }}
            disContent={contract && Object.keys(contract).length > 0 ? true : false}
          />
          <Button type="link" style={{ display: 'none' }}>
            新增
          </Button> */}
          <Select
            style={{ width: 480 }}
            allowClear
            placeholder="请选择发货企业"
            showSearch
            onChange={(_, option) => {
              setSaleCompany(option?.item);
            }}>
            {transportCompanyList.map(item => (
              <Option key={item.id} value={item.companyName} item={item}>
                {item.companyName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="发货地址"
          required
          name="validateFromAddressName"
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <SelectBtn
            style={{ width: 480 }}
            value={fromAddress.loadAddressName}
            filter={toAddress}
            mode="input"
            type="contractAddress"
            title="发货地址"
            onChange={address => {
              setFromAddress(address);
              form.setFieldsValue({
                validateFromAddressName: address.loadAddressName,
              });
            }}
          />
        </Form.Item>

        {Object.keys(purchaseCompany).length > 0 ? (
          <Form.Item label="收货企业" required>
            <SelectBtn
              style={{ width: 480 }}
              value={purchaseCompany.companyName}
              filter={saleCompany}
              mode="input"
              type="address"
              title="收货企业"
              onChange={address => {
                setPurchaseCompany(address);
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item
            label="收货企业"
            name="validateToAddress"
            rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}
            required>
            <SelectBtn
              value={purchaseCompany.companyName}
              filter={saleCompany}
              mode="input"
              type="address"
              title="收货企业"
              onChange={address => {
                setPurchaseCompany(address);
              }}
              style={{ width: 480 }}
            />
          </Form.Item>
        )}

        <Form.Item
          label="收货地址"
          name="validateToAddressName"
          validateFirst={true}
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <SelectBtn
            style={{ width: 480 }}
            value={toAddress.loadAddressName}
            filter={fromAddress}
            mode="input"
            type="contractAddress"
            title="收货地址"
            onChange={address => {
              setToAddress(address);
              form.setFieldsValue({
                validateToAddressName: address.loadAddressName,
              });
            }}
          />
        </Form.Item>

        {/* 运费单价 */}
        <Row>
          <Col>
            <Form.Item
              {...oneformItemLayout}
              label="运费单价"
              name="unitPrice"
              validateFirst={true}
              rules={[{ required: true, message: '内容不能为空' }, ...number_rules]}>
              <Input placeholder="请输入运费单价" addonAfter={<span>元</span>} style={{ width: 264 }} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="unitName" style={{ marginLeft: '8px' }}>
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

        <Form.Item
          label="订单总量"
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
              message: '订单总量只能是数字，最多两位小数',
            },
          ]}>
          <Input placeholder="请输入订单总量" style={{ width: 264 }} addonAfter={<span>{unitName}</span>} />
        </Form.Item>

        <Form.Item
          label="上传附件"
          name="files"
          rules={[
            {
              required: true,
              message: '附件不可为空',
            },
          ]}>
          <UploadToOSS
            beforeUpload={beforeUpload}
            maxCount={9}
            accept=".jpg,.png,.doc,.docx,.pdf,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
            <Button>
              <UploadOutlined />
              点击上传
            </Button>
          </UploadToOSS>
        </Form.Item>

        <div
          style={{ width: '620px', paddingLeft: '40px', marginBottom: '24px', color: '#808080FF', fontSize: '14px' }}>
          <div>支持word、pdf、png、jpg格式，最多支持上传9个文件，文件大小需小于10mb</div>
          <div>附件内容中需清晰展示承运关键信息，如信息不全可能会影响到煤炭运输。</div>
        </div>

        <div className={styles.title}>
          <span className={styles.line}></span>专线信息
        </div>

        <Form.Item
          label="专线类型"
          name="fleet"
          style={{ marginLeft: 32 }}
          rules={[{ required: true, whitespace: true, message: '选项不可为空' }]}>
          <Radio.Group onChange={e => setIsFleet(e.target.value)}>
            <Radio value="0">个人单</Radio>
            <Radio value="1" style={{ marginLeft: 16 }}>
              车队单
            </Radio>
          </Radio.Group>
        </Form.Item>

        {isFleet === '1' && (
          <>
            <Form.Item
              label="车队长手机号"
              name="fleetCaptionPhone"
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
              <Input
                maxLength={11}
                placeholder="请输入车队长手机号"
                style={{ width: 200 }}
                onChange={handleCaptainPhone}
              />
            </Form.Item>
            <Form.Item
              label={
                <div>
                  <span className={styles.noStar}>*</span>车队长姓名
                </div>
              }
              name="fleetCaptionName">
              <Input maxLength={11} disabled placeholder="车队长姓名自动填充" style={{ width: 200 }} />
            </Form.Item>
          </>
        )}

        {/* 支付对象 */}
        {isFleet === '1' && (
          <Form.Item
            label="运费支付给"
            name="payInto"
            rules={[{ required: true, whitespace: true, message: '选项不可为空' }]}>
            <Radio.Group>
              <Radio value="1">车队长</Radio>
              <Radio value="2" style={{ marginLeft: 16 }}>
                司机
              </Radio>
            </Radio.Group>
          </Form.Item>
        )}

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
              label={
                <div>
                  <span className={styles.noStar}>*</span>信息费单价
                </div>
              }
              name="unitInfoFee"
              style={{ marginLeft: 32 }}
              validateFirst={true}
              rules={[
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: '只能是数字，且不可超过2位小数',
                },
              ]}>
              <Input
                placeholder="请输入信息费单价"
                style={{ width: 264 }}
                addonAfter={<span>元/{infoFeeUnitName === 0 ? '车' : '吨'}</span>}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>结算方式
            </div>
          }
          wrapperCol={{ span: 20 }}
          name="payMethod"
          style={{ marginLeft: 32, width: 700 }}>
          <Radio.Group onChange={e => setPayMethod(e.target.value)}>
            <Radio value="1">按发货净重结算</Radio>
            <Radio value="0" style={{ marginLeft: 16 }}>
              按收货净重结算
            </Radio>
            <Radio value="2" style={{ marginLeft: 16 }}>
              按发货与收货较小的结算
            </Radio>
          </Radio.Group>
        </Form.Item>

        {/* 路损计算 */}
        {payMethod !== '1' && (
          <div style={{ width: 600, position: 'relative' }}>
            <Form.Item
              label={
                <div>
                  <span className={styles.noStar}>*</span>路损计算
                </div>
              }
              name="lossMark"
              valuePropName="checked">
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
        {payMethod !== '1' && allowLoss && (
          <Form.Item
            label="允许路损"
            required
            name="lossAmount"
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

        {/* 运费个位抹零 */}
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>运费抹零
            </div>
          }
          wrapperCol={{ span: 20 }}
          name="eraseZero"
          valuePropName="checked">
          <Switch size="small" />
        </Form.Item>

        <Form.Item
          label="有效日期"
          name="validDate"
          style={{ marginLeft: 32 }}
          rules={[{ required: true, whitespace: true, message: '选项不可为空' }]}>
          <Radio.Group>
            <Radio value="7">一周</Radio>
            <Radio value="30" style={{ marginLeft: 16 }}>
              一月
            </Radio>
            <Radio value="365" style={{ marginLeft: 16 }}>
              一年
            </Radio>
          </Radio.Group>
        </Form.Item>

        <div style={{ paddingLeft: 32 }}>
          <Button htmlType="submit" type="primary">
            提交审核
          </Button>
        </div>
      </Form>

      <Modal
        title="提示"
        visible={isModalVisible}
        okText="重新提交"
        cancelText="关闭"
        onOk={handleOk}
        onCancel={handleCancel}>
        <p>
          您有该合同下审批驳回的订单，请点击<span style={{ color: '#477aef' }}>重新提交</span>
        </p>
      </Modal>
    </div>
  );
};

export default Index;
