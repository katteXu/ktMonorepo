import { useState, useEffect, useRef } from 'react';
import { Input, Button, Form, DatePicker, Radio, Select, message } from 'antd';
import RawForm from './RawForm';
import styles from './styles.less';
import moment from 'moment';
import { product, getCommon } from '@api';
import { QuestionCircleFilled, PlusOutlined } from '@ant-design/icons';
import QualityList from '@components/ProductManagement/CoalBlendingList/QualityList';
import { DrawerInfo, WareHouseSelect } from '@components';
import { User } from '@store';
const Index = props => {
  const { onClose, onSubmit } = props;
  const [form] = Form.useForm();
  const { userInfo, loading: userLoading } = User.useContainer();
  const [loading, setLoading] = useState(false);
  const [rawList, setRawList] = useState([1, 2]);
  const [disabled, setDisabled] = useState(false);
  const [rawGoods, setRawGoods] = useState([]);
  const [GoodsType, setGoodsType] = useState([]);
  const [showQualityList, setShowQualityList] = useState(false);
  const [qualityInfo, setQualityInfo] = useState({});
  const [isShowWarehouse, setIsShowWarehouse] = useState(false);
  const wareHouseRef = useRef(null);
  useEffect(() => {
    initRawGoods();
    initTargetGoods();
    form.setFieldsValue({
      wareHouseId: -1,
    });
  }, []);

  useEffect(() => {
    if (!userLoading) {
      setHiddenDate();
    }
  }, [userLoading]);

  const setHiddenDate = async () => {
    const res = await getCommon();
    if (res.status === 0) {
      const currentUserName = userInfo.username;

      const hiddenWarehouseName = res.result.find(item => item.key === 'HAS_WAREHOUSE').url;
      console.log(currentUserName);
      if (hiddenWarehouseName.includes(currentUserName)) {
        setIsShowWarehouse(true);
      }
    }
  };

  // 提交数据
  const handleSubmit = async values => {
    setLoading(true);
    const { targetGoodId, date, weight, ...rawForm } = values;

    // 目标货品煤
    const targetGoods = GoodsType.find(item => item.id === targetGoodId);

    // 原料煤总重量
    const totalWeight = Object.values(rawForm).reduce((prev, curr) => prev * 1 + curr.weight * 1, 0);

    const rawMaterial = Object.values(rawForm).map(item => {
      const _rawData = rawGoods.find(({ id }) => id === item.inventoryId);
      const params = {
        goodsName: _rawData ? _rawData.goodsName : '',
        weight: (item.weight * 1000).toFixed(0) * 1,
        inventoryId: item.inventoryId,
        proportion: ((item.weight / totalWeight) * 10000).toFixed(0) * 1, // 百分比
      };
      return params;
    });

    const params = {
      recordAt: moment(date).format('YYYY-MM-DD HH:mm:ss'),
      targetGoods: {
        inventoryId: targetGoods.id,
        goodsName: targetGoods.goodsName,
        weight: (weight * 1000).toFixed(0) * 1,
      },
      rawMaterial,
    };
    if (qualityInfo.id) {
      params.reportId = qualityInfo.id;
      params.reportNo = qualityInfo.reportId;
    }
    await onSubmit(params);
    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // 新建原料煤种
  const handleNew = () => {
    const index = rawList[rawList.length - 1] + 1;
    rawList.push(index);
    setRawList([...rawList]);
  };

  // 移除
  const handleRemove = id => {
    const _list = rawList.filter(item => item !== id);
    setRawList([..._list]);
  };

  // 选择关联化验单
  const handleSelect = record => {
    if (validateGoodsType(record)) {
      setQualityInfo(record);
      setShowQualityList(false);
    }
  };

  // 验证货品是否已被删除
  const validateGoodsType = record => {
    // 被删除的货品
    let error_goods_type = '';
    const _record_goods_type = [{ inventoryId: record.inventoryId, goodsName: record.goodsName }];

    // 所有返回数据的货品id
    const _all_goods_type = GoodsType.map(item => item.id);
    // 集成选择记录的货品id
    record.samplingData.forEach(item => {
      _record_goods_type.push({ inventoryId: item.id, goodsName: item.goodsName });
    });

    // 获取被删除货品
    const result = _record_goods_type.every(({ inventoryId, goodsName }) => {
      if (_all_goods_type.includes(inventoryId)) {
        return true;
      } else {
        error_goods_type = goodsName;
        return false;
      }
    });
    if (error_goods_type) {
      message.error(`关联失败，${error_goods_type}货品已被删除`);
    }
    return result;
  };

  useEffect(() => {
    if (qualityInfo.id) {
      const formData = {};
      qualityInfo.samplingData.forEach((item, index) => {
        formData[index + 1] = {
          inventoryId: item.id,
        };
      });

      formData.targetGoodId = qualityInfo.inventoryId;

      setRawList(qualityInfo.samplingData.map((item, index) => index + 1));
      setDisabled(true);
      form.setFieldsValue(formData);
    }
  }, [qualityInfo]);

  // 初始化原料列表
  const initRawGoods = async () => {
    const res = await product.getGoodsList();
    if (res.status === 0) {
      setRawGoods(res.result);
    }
  };

  // 初始化目标列表
  const initTargetGoods = async () => {
    const res = await product.getGoodsList();
    if (res.status === 0) {
      setGoodsType(res.result);
    }
  };

  return (
    <div>
      <Form
        labelAlign="left"
        className={styles['add-form']}
        form={form}
        layout="inline"
        scrollToFirstError
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}>
        <div className={styles.row} style={{ marginTop: 0 }}>
          {qualityInfo.id ? (
            <>
              <span style={{ width: 143, display: 'inline-block', color: '#333333' }}>　化验单：</span>
              {qualityInfo.reportId}
            </>
          ) : (
            <Button type="primary" onClick={() => setShowQualityList(true)}>
              关联化验单
            </Button>
          )}
        </div>
        <div className={styles.row}>
          <Form.Item
            label="配煤时间"
            name="date"
            validateFirst={true}
            rules={[{ required: true, message: '内容不可为空' }]}>
            <DatePicker
              style={{ width: 280 }}
              showTime={{
                defaultValue: moment('23:59:59', 'HH:mm:ss'),
              }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </div>
        {isShowWarehouse && (
          <div className={styles.row}>
            <Form.Item
              label="目标货品仓库"
              name="wareHouseId"
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: '请选择目标货品仓库',
                },
              ]}>
              <WareHouseSelect allowClear placeholder="请选择目标货品仓库" style={{ width: 280 }} ref={wareHouseRef} />
            </Form.Item>
          </div>
        )}
        <div className={styles.row}>
          <Form.Item
            label="目标货品煤名称"
            name="targetGoodId"
            validateFirst={true}
            rules={[{ required: true, message: '请输入目标货品煤名称' }]}>
            <Select
              allowClear
              placeholder="请选择目标货品煤名称"
              style={{ width: 280 }}
              disabled={disabled}
              optionFilterProp="children"
              showSearch>
              {GoodsType.map(v => (
                <Select.Option key={v.id} value={v.id}>
                  {v.goodsName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div className={styles.row}>
          <Form.Item
            label="目标货品产出量"
            name="weight"
            validateFirst={true}
            rules={[
              { required: true, message: '请输入目标货品产出量' },
              {
                pattern: /^\d+(\.?\d{1,2})?$/,
                message: '内容只能是数字，最多两位小数',
              },
            ]}>
            <Input style={{ width: 280 }} addonAfter="吨" placeholder="请输入目标货品产出量" />
          </Form.Item>
        </div>
        {rawList.map(id => (
          <RawForm
            disabled={disabled}
            form={form}
            index={id}
            key={id}
            rawGoods={rawGoods}
            onRemove={() => handleRemove(id)}
            isShowWarehouse={isShowWarehouse}
          />
        ))}
        {!disabled && (
          <div className={styles['btn-add']} onClick={handleNew}>
            <span>
              <PlusOutlined style={{ marginRight: 4 }} />
              新增原料煤种
            </span>
          </div>
        )}
        <div className={styles.bottom}>
          <Button size="default" onClick={() => onClose && onClose()}>
            取消
          </Button>
          <Button size="default" type="primary" style={{ marginLeft: 8 }} htmlType="submit" loading={loading}>
            提交
          </Button>
        </div>
      </Form>

      <DrawerInfo title="化验单列表" onClose={() => setShowQualityList(false)} showDrawer={showQualityList} width="760">
        {showQualityList && <QualityList onClose={() => setShowQualityList(false)} onSelect={handleSelect} />}
      </DrawerInfo>
    </div>
  );
};

export default Index;
