import { useState, useEffect } from 'react';
import { QuestionCircleFilled, UploadOutlined } from '@ant-design/icons';
import { Input, Select, Button, DatePicker, Modal, Tooltip, message, Form } from 'antd';
import moment from 'moment';
import { railWay, contract } from '../../api';
import SelectBtn from '../RailDetail/selectBtn_new';
import router from 'next/router';
import { PlusOutlined } from '@ant-design/icons';
import AssociatedContract from '@components/contractManagement/associatedContract';
import { UploadToOSS } from '@components';
import styles from './styles.less';
// 表单格式
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 6 },
  // wrapperCol: { span: 18 },
};

// 获取货物类型
const getGoodsType = async () => {
  const res = await railWay.getGoodsType();
  return res.result;
};

const Index = () => {
  const [form] = Form.useForm();
  // 购买方
  const [saleCompany, setSaleCompany] = useState({});
  const [purchaseCompany, setPurchaseCompany] = useState({});
  // 货品名称
  const [goodList, setGoodsList] = useState([]);
  // 合同总量
  const [totalWeight, setTotalWeight] = useState();
  // 税前单价
  const [unitePrice, setUnitePrice] = useState();

  const [showAssociatedContract, setShowAssociatedContract] = useState(false);
  const [selectedRowKeysItem, setSelectedRowKeysItem] = useState([]);

  // 签订时间
  const [signDate, setSignDate] = useState();

  // 签订时间变更
  const changeSignDate = e => {
    setSignDate(e.format('YYYY-MM-DD HH:mm:ss'));
    // 清空有效时间
    form.setFieldsValue({
      effectiveDateTo: '',
    });
  };

  // 总价自动填充
  useEffect(() => {
    const totalValue = totalWeight * unitePrice || 0;
    form.setFieldsValue({
      totalValue: totalValue.toFixed(2),
    });
  }, [totalWeight, unitePrice]);

  // 表单提交
  const handleSubmit = async values => {
    const isTime = moment().format('YYYY-MM-DD') === moment(values.effectiveDateFrom).format('YYYY-MM-DD');

    const file = values.files.map(item => {
      const { response = {} } = item;
      return { name: response.fileName, url: response.fileUrl };
    });

    const params = {
      title: values.title,
      contractType: values.contractType,
      fromAddressCompanyId: saleCompany.id,
      toAddressCompanyId: purchaseCompany.id,
      goodsNameId: values.goodsNameId.value,
      totalWeight: (values.totalWeight * 1000).toFixed(0),
      unitePrice: Math.ceil(values.unitePrice * 100),
      uniteTaxPrice: Math.ceil(values.uniteTaxPrice * 100),
      deliveryWeight: (values.deliveryWeight * 1000).toFixed(0),
      deliveryType: values.deliveryType,
      totalValue: (values.totalValue * 100).toFixed(0),
      effectiveDateFrom: isTime
        ? moment(values.effectiveDateFrom).format('YYYY-MM-DD HH:mm:ss')
        : moment(values.effectiveDateFrom).format('YYYY-MM-DD 00:00:00'),
      effectiveDateTo: moment(values.effectiveDateTo).format('YYYY-MM-DD 23:59:59'),
      principal: values.principal,
      annex_url: JSON.stringify(file),
      relation_contracts: selectedRowKeysItem.join(','),
    };

    const res = await contract.create_contract({ params });
    if (res.status === 0) {
      message.success('合同创建成功');
      router.back();
    } else {
      Modal.error({
        title: '合同创建失败',
        content: res.detail ? res.detail : res.description,
      });
    }
  };

  // 首次加载
  useEffect(() => {
    (async () => {
      // 货物类型
      setGoodsList(await getGoodsType());
    })();
  }, []);

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        form={form}
        style={{ paddingLeft: 32 }}
        initialValues={{
          deliveryType: 'DAY',
        }}>
        <Form.Item
          label="合同名称"
          name="title"
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            {
              pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{0,20}$/,
              message: '内容长度为1-20个汉字',
            },
          ]}>
          <Input placeholder="请输入合同名称" style={{ width: 264 }} />
        </Form.Item>

        <Form.Item
          label="合同类型"
          name="contractType"
          rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
          <Select placeholder="请选择合同类型" style={{ width: 264 }}>
            <Select.Option value="1">购买合同</Select.Option>
            <Select.Option value="2">销售合同</Select.Option>
          </Select>
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
        {Object.keys(saleCompany).length > 0 ? (
          <Form.Item label="发货企业" required>
            <SelectBtn
              style={{ width: 480 }}
              value={saleCompany.companyName}
              filter={purchaseCompany}
              mode="input"
              type="address"
              title="发货企业"
              onChange={address => {
                setSaleCompany(address);
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item
            label="发货企业"
            required
            name="validateFromAddress"
            rules={[{ required: true, whitespace: true, message: '内容不可为空' }]}>
            <SelectBtn
              style={{ width: 480 }}
              value={saleCompany.companyName}
              filter={purchaseCompany}
              mode="input"
              type="address"
              title="发货企业"
              onChange={address => {
                setSaleCompany(address);
              }}
            />
          </Form.Item>
        )}
        <Form.Item
          label="货品名称"
          name="goodsNameId"
          rules={[
            {
              type: 'object',
              required: true,
              whitespace: true,
              message: '内容不可为空',
            },
          ]}>
          <Select placeholder="请选择货品名称" style={{ width: 264 }} labelInValue>
            {goodList &&
              goodList.map(item => (
                <Select.Option key={item.id} value={item.id}>
                  {item.goodsName}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="货物总量"
          name="totalWeight"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            {
              type: 'number',
              message: '请输入有效的数字',
              transform: value => Number(value),
            },
            {
              pattern: /^\d+(\.?\d{1,2})?$/,
              message: '只能是数字，最多两位小数',
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
          ]}>
          <Input
            placeholder="请输入货物总量"
            style={{ width: 264 }}
            onChange={e => setTotalWeight(e.target.value)}
            addonAfter={'吨'}
          />
        </Form.Item>
        <Form.Item
          label="货物单价(含税)"
          name="unitePrice"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            {
              type: 'number',
              message: '请输入有效的数字',
              transform: value => Number(value),
            },
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
          ]}>
          <Input
            placeholder="请输入货物单价(含税)"
            style={{ width: 264 }}
            // suffix="元/吨"
            addonAfter={'元/吨'}
            onChange={e => setUnitePrice(e.target.value)}
          />
        </Form.Item>
        <div style={{ position: 'relative' }}>
          <Form.Item name="deliveryType" validateFirst={true} style={{ position: 'absolute', right: 402, zIndex: 10 }}>
            <Select style={{ width: 85, position: 'relative', left: 18 }} className={styles.deliveryType}>
              <Select.Option value="DAY">吨/天</Select.Option>
              <Select.Option value="WEEK">吨/周</Select.Option>
              <Select.Option value="MONTH">吨/月</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="提货量"
            name="deliveryWeight"
            validateFirst={true}
            rules={[
              { required: true, whitespace: true, message: '内容不可为空' },
              { type: 'number', message: '请输入有效的数字', transform: value => Number(value) },
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
            ]}>
            <Input placeholder="请输入提货量" style={{ width: 264 }} addonAfter={'元'} />
            {/* <Form.Item name="deliveryType" validateFirst={true} style={{ position: 'absolute', right: 312, top: 0 }}>
            <Select style={{ width: 85, position: 'relative', left: 18, top: -1 }} className={styles.deliveryType}>
              <Select.Option value="DAY">吨/天</Select.Option>
              <Select.Option value="WEEK">吨/周</Select.Option>
              <Select.Option value="MONTH">吨/月</Select.Option>
            </Select>
          </Form.Item> */}
          </Form.Item>
        </div>
        <Form.Item
          label="货物单价"
          name="uniteTaxPrice"
          validateFirst={true}
          rules={[
            { required: true, whitespace: true, message: '内容不可为空' },
            {
              type: 'number',
              message: '请输入有效的数字',
              transform: value => Number(value),
            },
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
          ]}>
          <Input placeholder="请输入货物单价" addonAfter={'元/吨'} style={{ width: 264 }} />
        </Form.Item>

        <Form.Item
          label="生效时间"
          name="effectiveDateFrom"
          rules={[
            {
              type: 'object',
              required: true,
              whitespace: true,
              message: '内容不可为空',
            },
            {
              transform: value => (value ? moment(value).format('YYYY-MM:DD') : ''),
            },
          ]}>
          <DatePicker
            // style={{ width: '100%' }}
            style={{ width: 264 }}
            disabledDate={date => date < moment().add(-1, 'day')}
            placeholder="请选择生效时间"
            format="YYYY-MM-DD"
            onChange={e => changeSignDate(e)}
          />
        </Form.Item>
        <Form.Item
          label="有效期至"
          name="effectiveDateTo"
          rules={[
            {
              type: 'object',
              required: true,
              whitespace: true,
              message: '内容不可为空',
            },
            {
              transform: value => (value ? moment(value).format('YYYY-MM:DD') : ''),
            },
          ]}>
          <DatePicker
            placeholder="请选择有效时间"
            style={{ width: 264 }}
            disabled={!signDate}
            disabledDate={date => date < moment(signDate)}
          />
        </Form.Item>
        <Form.Item
          label="负责人"
          name="principal"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '内容不可为空',
            },
            {
              pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,10}$/,
              message: '内容长度为2-10个汉字',
            },
          ]}
          validateFirst={true}>
          <Input placeholder="请输入负责人" style={{ width: 200 }} maxLength={10} />
        </Form.Item>
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
              合同金额
              <Tooltip title={`根据“货物总量”和“货物单价(含税)”自动计算`}>
                <QuestionCircleFilled style={{ color: '#D0D4DB', marginLeft: 4 }} />
              </Tooltip>
            </div>
          }
          name="totalValue">
          <Input disabled placeholder="0.000" style={{ width: 264 }} suffix={'元'} />
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
          <UploadToOSS accept=".doc,.docx,.pdf,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
            <Button>
              <UploadOutlined />
              点击上传
            </Button>
          </UploadToOSS>
        </Form.Item>
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
              关联合同
            </div>
          }>
          <Button
            style={{ width: 121 }}
            block
            type="link"
            onClick={() => setShowAssociatedContract(true)}
            icon={<PlusOutlined />}>
            添加关联合同
          </Button>
        </Form.Item>
        {showAssociatedContract ? <AssociatedContract onSubmit={item => setSelectedRowKeysItem(item)} /> : ''}

        <div style={{ paddingLeft: 118 }}>
          <Button htmlType="submit" type="primary">
            创 建
          </Button>
        </div>
      </Form>
    </>
  );
};

export default Index;
