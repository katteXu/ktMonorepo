import { useState, useEffect } from 'react';
import { ChildTitle } from '@components';
import { station } from '@api';
import { Input, Modal, Tooltip, message } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import styles from './index.less';
import ManualForm from './manualForm';
import { Format } from '@utils/common';
const Index = ({ confirmInfo, stationType }) => {
  const handleCancel = () => {};
  const handleOk = () => {};

  return (
    <div>
      {confirmInfo && (
        <div className={styles.modalInfo}>
          <div className={styles.line}>
            <span>车牌：</span>
            <div>
              <span>{confirmInfo.plateNum}</span>
            </div>
          </div>
          <div className={styles.line}>
            <span>专线信息：</span>
            <div>
              <span>{confirmInfo.fromCompany}</span>
              <span>{confirmInfo.toCompany}</span>
              <span>{confirmInfo.goodsType}</span>
            </div>
          </div>
          {stationType === 1 && (
            <div>
              <p>收货信息</p>
              <div className={styles.line}>
                <span>毛重：</span>
                <div>
                  <span>{confirmInfo.totalWeight ? Format.weight(confirmInfo.totalWeight) : '--'}吨</span>
                </div>
              </div>
              <div className={styles.line}>
                <span>皮重：</span>
                <div>
                  <span>{confirmInfo.carWeight != undefined ? Format.weight(confirmInfo.carWeight) : '--'}吨</span>
                </div>
              </div>
              <div className={styles.line}>
                <span>净重：</span>
                <div>
                  <span>{confirmInfo.goodsWeight ? Format.weight(confirmInfo.goodsWeight) : '--'}吨</span>
                </div>
              </div>
              <p>发货信息</p>
              <div className={styles.line}>
                <span>毛重：</span>
                <div>
                  <span>{confirmInfo.fromTotalWeight ? Format.weight(confirmInfo.fromTotalWeight) : '--'}吨</span>
                </div>
              </div>
              <div className={styles.line}>
                <span>皮重：</span>
                <div>
                  <span>{confirmInfo.fromCarWeight ? Format.weight(confirmInfo.fromCarWeight) : '--'}吨</span>
                </div>
              </div>
              <div className={styles.line}>
                <span>净重：</span>
                <div>
                  <span>{confirmInfo.fromGoodsWeight ? Format.weight(confirmInfo.fromGoodsWeight) : '--'}吨</span>
                </div>
              </div>
            </div>
          )}
          {stationType !== 1 && (
            <div>
              <div className={styles.line}>
                <span>进站重量：</span>
                <div>
                  <span>{confirmInfo.fromTotalWeight ? Format.weight(confirmInfo.fromCarWeight) : '--'}吨</span>
                </div>
              </div>
              <div className={styles.line}>
                <span>出站重量：</span>
                <div>
                  <span>{confirmInfo.fromCarWeight ? Format.weight(confirmInfo.fromTotalWeight) : '--'}吨</span>
                </div>
              </div>
              <div className={styles.line}>
                <span>净重：</span>
                <div>
                  <span>{confirmInfo.fromGoodsWeight ? Format.weight(confirmInfo.fromGoodsWeight) : '--'}吨</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Index;
