import React from 'react';
import styles from './styles.less';
import { Tag } from 'antd';
import { Status, Icon } from '@components';

const Header = props => {
  const { truckInfo, truckerInfo, status, statusZn, transportFleetId, routeInfo } = props.dataInfo;
  return (
    <div className={styles.header} style={{ lineHeight: '26px' }}>
      <img className={styles.icon} src={Icon.CarIcon} />
      <span className={styles['plate-number']}>{truckInfo.trailerPlateNumber}</span>
      <span className={styles['trucker-name']}>{truckerInfo.name}</span>
      <span className={styles['trucker-phone']}>{truckerInfo.mobilePhoneNumber}</span>
      <div className={styles.tags}>
        {statusZn !== '支付中' && (
          <Tag
            color={Status.orderColor[status] && Status.orderColor[status].bg}
            style={{
              color: Status.orderColor[status] && Status.orderColor[status].color,
              borderColor: Status.orderColor[status] && Status.orderColor[status].color,
              borderWidth: 1,
            }}>
            {statusZn}
          </Tag>
        )}
        <Tag
          color={transportFleetId ? '#FFF5F5' : '#F5F9FF'}
          style={{
            color: transportFleetId ? '#e44040' : '#477AEF',
            borderColor: transportFleetId ? '#e44040' : '#477AEF',
            borderWidth: 1,
          }}>
          {transportFleetId ? '车队单' : '个人单'}
        </Tag>
        {transportFleetId && (
          <Tag
            color={routeInfo.payPath === 0 ? '#FFFBF4' : '#F5FFF8'}
            style={{
              color: routeInfo.payPath === 0 ? '#FFB741' : '#66BD7E',
              borderColor: routeInfo.payPath === 0 ? '#FFB741' : '#66BD7E',
              borderWidth: 1,
            }}>
            {routeInfo.payPathZn}
          </Tag>
        )}
      </div>
    </div>
  );
};

export default Header;
