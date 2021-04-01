import React from 'react';
import styles from './styles.less';
import { Button, Tooltip } from 'antd';
import router from 'next/router';
import { Format } from '@utils/common';
import { Permission } from '@store';
const Route = props => {
  const { permissions, isSuperUser } = Permission.useContainer();
  const { routeInfo, unitName } = props.dataInfo;

  return (
    <div className={styles.floor}>
      <div className={styles.title} style={{ height: 22 }}>
        专线信息
        {(isSuperUser || permissions.includes('ROUTE_MANAGEMENT')) && (
          <Button
            type="link"
            style={{ padding: 0, marginLeft: 12, height: 22 }}
            onClick={() => router.push(`/railWay/mine/detail?id=${routeInfo.id}`)}>
            详情
          </Button>
        )}
      </div>
      <div className={styles.row}>
        <div className={styles.label}>发货企业：</div>
        <div className={styles.data}>
          <Tooltip placement="topLeft" title={routeInfo.fromCompanyName} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 180, display: 'inline' }}>
              {routeInfo.fromCompanyName}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>发货地址：</div>
        <div className={styles.data}>
          <Tooltip placement="topLeft" title={routeInfo.fromAddress} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 180, display: 'inline' }}>
              {routeInfo.fromAddress}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>货品名称：</div>
        <div className={styles.data}>
          <Tooltip placement="topLeft" title={routeInfo.goodsType} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 180, display: 'inline' }}>
              {routeInfo.goodsType}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>收货企业：</div>
        <div className={styles.data}>
          <Tooltip placement="topLeft" title={routeInfo.toCompanyName} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 180, display: 'inline' }}>
              {routeInfo.toCompanyName}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>收货地址：</div>
        <div className={styles.data}>
          <Tooltip placement="topLeft" title={routeInfo.toAddress} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 180, display: 'inline' }}>
              {routeInfo.toAddress}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>运费单价：</div>
        <div className={styles.data}>
          {Format.price(routeInfo.unitPrice)} 元/{unitName || '吨'}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>车队长：</div>
        <div className={styles.data}>
          {routeInfo.fleetCaptionInfo.name
            ? `${routeInfo.fleetCaptionInfo.name} ${routeInfo.fleetCaptionInfo.mobilePhoneNumber || '-'}`
            : '-'}
        </div>
      </div>
    </div>
  );
};
export default Route;
