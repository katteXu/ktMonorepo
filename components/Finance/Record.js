import { Descriptions, message, Spin, Pagination, Button, Modal } from 'antd';
import router from 'next/router';
import RemarkDetail from './RemarkDetail';
import styles from './styles.less';
import { finance } from '@api';
import { QuestionCircleFilled } from '@ant-design/icons';
import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import DescriptDetail from './DescriptDetail';
import deleteBtn from './deleteBtn.less';
import { getQuery } from '@utils/common';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

const Record = ({ id, mode = 'view', onChange, detailUrl, payType, batchId, handleShowPayType, onLoaded }, ref) => {
  const [record, setRecord] = useState({});
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({});
  const [showPayType, setShowPayType] = useState({});
  // 监听对账单刷新
  useEffect(() => {
    if (payType) {
      initData();
    }
  }, [payType]);

  useEffect(() => {
    onLoaded && onLoaded(record);
  }, [record]);

  useEffect(() => {
    handleShowPayType && handleShowPayType(showPayType);
  }, [showPayType]);

  // 监听数据变化
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      onChange && onChange(formData);
    } else {
      onChange && onChange({});
    }
  }, [formData]);

  // 申请列表对账单
  const initData = async () => {
    const { mode, id } = getQuery();
    setLoading(true);
    const params = { id, limit: 10 };
    // 生成对账单
    if (mode === 'edit') {
      await finance.generateRecord({
        params: { payType, id },
      });
    }

    // 生成申请列表
    const res = await finance.buildRecord({ params });
    if (res.status === 0) {
      setRecord(res.result);
      setShowPayType(res.result.invoicePay);
    } else {
      message.error(`${res.detail}`);
    }
    setLoading(false);
  };

  const onChangePage = async page => {
    setLoading(true);
    // 提交数据
    await submit();

    const params = { id, limit: 10, page: page };
    const res = await finance.buildRecord({ params });
    if (res.status === 0) {
      setRecord(res.result);
    } else {
      message.error(`${res.detail}`);
    }
    setLoading(false);
  };

  const onChangeHandle = (id, formData) => {
    if (formData) {
      setFormData(data => {
        return {
          ...data,
          [id]: formData,
        };
      });
    } else {
      setFormData(data => {
        const resultData = {};
        Object.keys(data).forEach(key => {
          if (key != id) {
            resultData[key] = data[key];
          }
        });
        return resultData;
      });
    }
  };

  // 提交数据
  const submit = async () => {
    if (Object.keys(formData).length !== 0) {
      message.warn('检测到对账单备注信息有更新，系统会自动保存');
      const params = {
        data: formData,
      };
      const res = await finance.saveRemark({ params });
      if (res.status === 0) {
        setFormData({});
      } else {
        message.error(`${res.detail || ''}`);
      }
    }
  };

  const deleteData = async id => {
    const invoiceId = getQuery().id;
    const params = {
      id,
      invoiceId,
    };
    const res = await finance.deleteStatementOfAccount({ params });
    if (res.status === 0) {
      message.success('对账明细删除成功');
    } else {
      message.error(`对账明细删除失败，原因：${res.detail || res.description}`);
    }
  };

  const ConfirmDelete = id => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '是否删除此对账明细？',
      onOk: async () => {
        await deleteData(id);
        refreshData();
      },
    });
  };

  // 删除刷新数据页面
  const refreshData = async () => {
    const { mode, id } = getQuery();
    const len = record.data.length;
    const currentPage = record.page;

    setLoading(true);
    const params = { id, limit: 10 };
    // 当前页面数据等于1且 当前不是第一页则设置页为上一页
    if (len === 1 && currentPage > 1) {
      params.page = currentPage - 1;
    } else {
      params.page = currentPage;
    }

    // 生成对账单
    if (mode === 'edit') {
      await finance.generateRecord({
        params: { payType, id },
      });
    }
    // 生成申请列表
    const res = await finance.buildRecord({ params });
    if (res.status === 0) {
      setRecord(res.result);
      setShowPayType(res.result.invoicePay);
    } else {
      message.error(`${res.detail}`);
    }
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({
    // 获取详情数据
    getData: () => {
      return record;
    },
  }));

  return (
    <div className={styles.record}>
      <Spin tip="生成数据..." spinning={loading}>
        <Descriptions className={styles.total} bordered title="汇总数据：" size="middle" column={2}>
          <Descriptions.Item label={<span className={styles['header-label']}>托运方</span>}>
            {record.shipper}
          </Descriptions.Item>
          <Descriptions.Item label={<span className={styles['header-label']}>承运方</span>}>
            {record.carrier}
          </Descriptions.Item>
          <Descriptions.Item label={<span className={styles['header-label']}>结算时间</span>}>
            {record.balanceDate}
          </Descriptions.Item>
          <Descriptions.Item label={<span className={styles['header-label']}>不含税金额</span>}>
            {formatPrice(record.priceSum)} 元
          </Descriptions.Item>
          <Descriptions.Item label={<span className={styles['header-label']}>结算数量</span>}>
            {formatWeight(record.weightSum)} {record.unitName || '吨'}
          </Descriptions.Item>
          <Descriptions.Item label={<span className={styles['header-label']}>含税金额</span>}>
            {formatPrice(record.taxPriceSum)} 元
          </Descriptions.Item>
          <Descriptions.Item label={<span className={styles['header-label']}>合计大写</span>}>
            {record.taxPriceSumZn}
          </Descriptions.Item>
        </Descriptions>
        {record.data &&
          record.data.map((v, i) => {
            const index = (record.page - 1) * 10 + i + 1;
            const title = i === 0 ? '对账明细：' : undefined;
            const style = {
              marginTop: i === 0 ? 25 : 32,
            };
            return (
              <div key={index}>
                <DescriptDetail mode={mode} index={index} detail={v} styles={styles} />
                <RemarkDetail mode={mode} formData={v} onChange={data => onChangeHandle(v.id, data)} />
                <div className={styles['ctrl-block']}>
                  操作：
                  <Button
                    type="link"
                    onClick={() =>
                      router.push(
                        `${detailUrl}?mode=${getQuery().mode}&&ids=${v.ids}${batchId && `&&batchId=${batchId}`}`
                      )
                    }>
                    运单明细
                  </Button>
                  {mode === 'edit' && (
                    <Button type="link" className={deleteBtn.delete} onClick={() => ConfirmDelete(v.id)}>
                      删除
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <Pagination current={record.page} total={record.count} onChange={onChangePage} showSizeChanger={false} />
        </div>
      </Spin>
    </div>
  );
};

export default forwardRef(Record);
