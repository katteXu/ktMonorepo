import { useState, useEffect, useRef } from 'react';
import { Descriptions, Button, Input, message } from 'antd';
import { finance } from '@api';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

const DescriptDetail = ({ detail, index, styles, mode }) => {
  const [v, setV] = useState(detail);
  useEffect(() => {
    setV(detail);
  }, [detail]);
  // 对应编辑字段
  const [modify, setModify] = useState();
  const [data, setData] = useState({
    remarkFromAddress: detail.remarkFromAddress || detail.fromAddress,
    remarkFromCompany: detail.remarkFromCompany || detail.fromCompany,
    remarkToAddress: detail.remarkToAddress || detail.toAddress,
    remarkToCompany: detail.remarkToCompany || detail.toCompany,
    remarkGoodsType: detail.remarkGoodsType || detail.goodsType,
  });

  const fromCompanyRef = useRef(null);
  const toCompanyRef = useRef(null);
  const fromAddressRef = useRef(null);
  const toAddressRef = useRef(null);
  const goodsTypeRef = useRef(null);

  const RefObject = {
    fromCompany: fromCompanyRef,
    toCompany: toCompanyRef,
    fromAddress: fromAddressRef,
    toAddress: toAddressRef,
    goodsType: goodsTypeRef,
  };

  // 监听更改按钮
  useEffect(() => {
    if (modify) {
      RefObject[modify].current.focus();
    }
  }, [modify]);

  const handleSumbit = async (key, value) => {
    if (!validateInput(value)) {
      return;
    }
    const params = {
      order: {
        [key]: value,
      },
      invoiceDetailId: detail.id,
    };

    const res = await finance.updateDescriptDetail({ params });
    if (res.status === 0) {
      setModify(undefined);
    }

    setModify(undefined);
  };

  // 输入框改变
  const handleChange = (key, value) => {
    // validateInput(value);
    setData({
      ...data,
      [key]: value,
    });
  };

  const validateInput = value => {
    let error = '';
    let reg = /^[\u2E80-\uFE4F|\uff08|\uff09|\(|\)]+$/;
    if (value) {
      // 有值判断
      if (value.length > 25) {
        error = '请输入不超过25个字';
        // } else if (!reg.test(value)) {
        //   error = '您输入的内容有误，只能输入汉字或括号';
      } else {
        // 校验通过
        error = '';
      }
    } else {
      // 没有写内容
      error = '输入内容不可为空';
    }
    if (error) {
      message.error(error);
      return false;
    }
    return true;
  };

  return (
    <Descriptions
      bordered
      title={index === 1 ? '对账明细：' : undefined}
      size="middle"
      column={2}
      style={{ marginTop: 25 }}
      className={styles.detail}>
      <Descriptions.Item
        label={
          <>
            <span className={styles.number}>{index}</span>托运方
          </>
        }>
        {v.shipper}
      </Descriptions.Item>
      <Descriptions.Item label="承运方">{v.carrier}</Descriptions.Item>
      <Descriptions.Item label="结算时间">{v.balanceDate}</Descriptions.Item>
      <Descriptions.Item label="结算项目">
        {modify === 'goodsType' ? (
          <Input
            maxLength={25}
            onChange={e => handleChange('remarkGoodsType', e.target.value)}
            onBlur={e => handleSumbit('remarkGoodsType', e.target.value)}
            ref={goodsTypeRef}
            className={styles.input}
            value={data.remarkGoodsType}
          />
        ) : (
          <span>{data.remarkGoodsType}</span>
        )}
        {mode === 'edit' && modify !== 'goodsType' && (
          <Button type="link" style={{ float: 'right' }} size="small" onClick={() => setModify('goodsType')}>
            编辑
          </Button>
        )}
      </Descriptions.Item>
      <Descriptions.Item
        label={
          <span>
            供货方
            <span style={{ wordBreak: 'keep-all' }}>(发货企业)</span>
          </span>
        }>
        {modify === 'fromCompany' ? (
          <Input
            maxLength={25}
            onChange={e => handleChange('remarkFromCompany', e.target.value)}
            onBlur={e => handleSumbit('remarkFromCompany', e.target.value)}
            ref={fromCompanyRef}
            className={styles.input}
            value={data.remarkFromCompany}
          />
        ) : (
          <span>{data.remarkFromCompany}</span>
        )}
        {mode === 'edit' && modify !== 'fromCompany' && (
          <Button type="link" style={{ float: 'right' }} size="small" onClick={() => setModify('fromCompany')}>
            编辑
          </Button>
        )}
      </Descriptions.Item>
      <Descriptions.Item
        label={
          <span>
            收货方
            <span style={{ wordBreak: 'keep-all' }}>(收货企业)</span>
          </span>
        }>
        {modify === 'toCompany' ? (
          <Input
            maxLength={25}
            onChange={e => handleChange('remarkToCompany', e.target.value)}
            onBlur={e => handleSumbit('remarkToCompany', e.target.value)}
            ref={toCompanyRef}
            className={styles.input}
            value={data.remarkToCompany}
          />
        ) : (
          <span>{data.remarkToCompany}</span>
        )}
        {mode === 'edit' && modify !== 'toCompany' && (
          <Button type="link" style={{ float: 'right' }} size="small" onClick={() => setModify('toCompany')}>
            编辑
          </Button>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="装货地">
        {modify === 'fromAddress' ? (
          <Input
            maxLength={25}
            onChange={e => handleChange('remarkFromAddress', e.target.value)}
            onBlur={e => handleSumbit('remarkFromAddress', e.target.value)}
            ref={fromAddressRef}
            className={styles.input}
            value={data.remarkFromAddress}
          />
        ) : (
          <span>{data.remarkFromAddress}</span>
        )}
        {mode === 'edit' && modify !== 'fromAddress' && (
          <Button type="link" style={{ float: 'right' }} size="small" onClick={() => setModify('fromAddress')}>
            编辑
          </Button>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="卸货地">
        {modify === 'toAddress' ? (
          <Input
            maxLength={25}
            onChange={e => handleChange('remarkToAddress', e.target.value)}
            onBlur={e => handleSumbit('remarkToAddress', e.target.value)}
            ref={toAddressRef}
            className={styles.input}
            value={data.remarkToAddress}
          />
        ) : (
          <span>{data.remarkToAddress}</span>
        )}
        {mode === 'edit' && modify !== 'toAddress' && (
          <Button type="link" style={{ float: 'right' }} size="small" onClick={() => setModify('toAddress')}>
            编辑
          </Button>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="结算数量">
        {formatWeight(v.weightSum)} {v.unitName || '吨'}
      </Descriptions.Item>
      <Descriptions.Item label="运费金额">{formatPrice(v.priceSum)} 元</Descriptions.Item>
      <Descriptions.Item label="合计大写">{v.taxPriceSumZn}</Descriptions.Item>
      <Descriptions.Item label="含税金额">{formatPrice(v.taxPriceSum)} 元</Descriptions.Item>
    </Descriptions>
  );
};

export default DescriptDetail;
