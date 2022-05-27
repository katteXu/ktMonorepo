import { useState, useEffect } from 'react';
import styles from './styles.less';
import { message, Spin } from 'antd';
import { order, getPrivateUrl, downLoadFileNoSuffix } from '@api';

import { Format, getQuery } from '@utils/common';
import { ChildTitle } from '@components';

const payMethodStatus = {
  1: '按发货净重结算',
  0: '按收货净重结算',
  2: '按发货与收货较小的结算',
};

const Index = props => {
  const [dataInfo, setDataInfo] = useState({});
  const [annexUrl, setAnnexUrl] = useState([]);
  const [loading, setLoading] = useState(false);
  const [infoFeeUnitName, setInfoFeeUnitName] = useState(0);

  useEffect(() => {
    getDetail();
  }, []);

  const getDetail = async () => {
    setLoading(true);
    const { id } = getQuery();

    const res = await order.transportOrderDetail({ id });

    if (res.status === 0) {
      setDataInfo(res.result);
      setInfoFeeUnitName(res.result.route?.unitInfoFee !== 0 ? 1 : 0);
      let annexUrl = JSON.parse(res.result.annexUrl);

      if (annexUrl?.name) {
        setAnnexUrl([annexUrl]);
      } else {
        setAnnexUrl(annexUrl);
      }

      setLoading(false);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const downloadFile = async ({ url, name }) => {
    const params = {
      url: [url],
    };
    const res = await getPrivateUrl({ params });

    await downLoadFileNoSuffix(res.result[url], name);
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.topContent}>
        <div>
          <hearder className={styles.title}>
            <ChildTitle className="hei14" style={{ marginBottom: 8 }}>
              关联合同信息
            </ChildTitle>
          </hearder>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>合同编号：</span>
              {dataInfo?.contract?.contractNo || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>合同名称：</span>
              {dataInfo?.contract?.title || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>货品名称：</span>
              {dataInfo?.contract?.goodsName || '-'}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>出卖人：</span>
              {dataInfo?.contract?.fromCompany || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>出卖人地址：</span>
              {dataInfo.contract?.fromAddressName || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>货物总量：</span>
              {Format.weight(dataInfo.contract?.totalWeight) || '-'}吨
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>买受人：</span>
              {dataInfo?.contract?.toCompany || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>买受人地址：</span>
              {dataInfo.contract?.toAddressName || '-'}
            </div>
            <div className={styles.item}></div>
          </div>
        </div>
      </div>
      <div className={styles.topContent}>
        <div>
          <hearder className={styles.title}>
            <ChildTitle className="hei14" style={{ marginBottom: 8 }}>
              订单信息
            </ChildTitle>
          </hearder>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>承运企业：</span>
              {dataInfo?.carrierCompany || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>订单总量：</span>
              {Format.weight(dataInfo?.totalAmount) || '-'}
              {dataInfo?.unitName}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>运输单价：</span>
              {Format.price(dataInfo?.unitPrice) || '-'} 元/{dataInfo?.unitName}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>附件：</span>
              {annexUrl
                ? annexUrl.map((item, key) => {
                    return (
                      <a
                        className={styles.file}
                        key={key}
                        // href={item.url}
                        href="javascript:;"
                        // onClick={() => onClickdownLoadFile(item.url, item.name)}
                        onClick={() => downloadFile({ ...item })}>
                        {item.name || '-'}
                      </a>
                    );
                  })
                : '-'}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.topContent}>
        <div>
          <hearder className={styles.title}>
            <ChildTitle className="hei14" style={{ marginBottom: 8 }}>
              专线信息
            </ChildTitle>
          </hearder>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>专线类型：</span>
              {dataInfo?.route?.fleetCaptionPhone ? '车队单' : '个人单'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>车队长姓名：</span>
              {dataInfo?.route?.fleetCaptionName || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>车队长手机号：</span>
              {dataInfo?.route?.fleetCaptionPhone || '-'}
            </div>
          </div>
          <div className={styles.row}>
            {dataInfo?.route?.fleetCaptionPhone && (
              <div className={styles.item}>
                <span className={styles.label}>信息费收取：</span>按{infoFeeUnitName === 0 ? '车' : '吨'}收
              </div>
            )}
            {dataInfo?.route?.fleetCaptionPhone && (
              <div className={styles.item}>
                <span className={styles.label}>信息费单价：</span>
                {dataInfo?.route
                  ? `${Format.price(dataInfo?.route?.serviceFee || dataInfo?.route?.unitInfoFee)} 元/${
                      infoFeeUnitName === 0 ? '车' : '吨'
                    }`
                  : '-'}
              </div>
            )}
            <div className={styles.item}>
              <span className={styles.label}>结算方式：</span>
              {payMethodStatus[dataInfo?.route?.payMethod] || '-'}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>允许路损：</span>
              {dataInfo?.route?.lossMark !== undefined
                ? dataInfo?.route?.lossMark
                  ? `${(dataInfo?.route?.lossAmount / 1000).toFixed(2)} ${dataInfo?.unitName}`
                  : '已关闭'
                : '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>个位抹零：</span>
              {dataInfo?.route?.eraseZero !== undefined ? (dataInfo?.route?.eraseZero ? '已开启' : '已关闭') : '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>有效时间：</span>
              {dataInfo?.route?.validDate === 7
                ? '一周'
                : dataInfo?.route?.validDate === 30
                ? '一月'
                : dataInfo?.route?.validDate === 365
                ? '一年'
                : '-'}
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
};
export default Index;
