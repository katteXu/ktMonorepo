import styles from './table.less';
import QRCode from 'qrcode-react';
const Table = props => {
  const { poundDetail = {} } = props;
  const {
    poundId,
    createdAt,
    fromCompany,
    toCompany,
    fromCompanyAddress,
    toCompanyAddress,
    businessName,
    receivePhone,
    trailerPlateNumber,
    goodsType,
    goodsTypes,
    truckLoad,
    roadNumber,
    totalWeight,
    qualificationNumber,
    carWeight,
    goodsWeight,
    sendGoodsMan,
    inTime,
    outTime,
    mobilePhoneNumber,
    lossWeight,
    fromGoodsWeight,
    remark,
    sign,
  } = poundDetail || {};
  const qrcode = '{"type":"10","value":"' + poundDetail.value + '","version":"' + poundDetail.version + '"}';
  return (
    <div className={styles.table1}>
      <header>晋中市煤炭销售计量专用票</header>
      <div>
        <span className={styles.label}>流水号</span>
        <span style={{ marginLeft: 10 }}>{poundId}</span>
        <span className={styles.label} style={{ marginLeft: 390 }}>
          日期
        </span>
        <span style={{ marginLeft: 10 }}>{createdAt}</span>
      </div>
      <table>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            发货企业
          </td>
          <td className={styles.data} colSpan={2}>
            {fromCompany}
          </td>
          <td style={{ width: 165 }} className={styles.label}>
            收货企业
          </td>
          <td style={{ width: 365 }} className={styles.data}>
            {toCompany}
          </td>
          {/* <td style={{ width: 365, textAlign: 'center' }} className={styles.data} rowSpan={5}></td> */}
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            发货地址
          </td>
          <td className={styles.data} colSpan={2}>
            {fromCompanyAddress}
          </td>
          <td style={{ width: 165 }} className={styles.label}>
            收货地址
          </td>
          <td style={{ width: 365 }} className={styles.data}>
            {toCompanyAddress}
          </td>
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            承运单位
          </td>
          <td className={styles.data} colSpan={2}>
            {businessName}
          </td>
          <td style={{ width: 165 }} className={styles.label}>
            收货人电话
          </td>
          <td style={{ width: 365 }} className={styles.data}>
            {receivePhone}
          </td>
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            车牌号
          </td>
          <td className={styles.data}>{trailerPlateNumber}</td>
          <td style={{ width: 165 }} className={styles.label}>
            货品名称
          </td>
          <td style={{ width: 165 }} className={styles.data}>
            {goodsType}
          </td>
          <td style={{ width: 365, textAlign: 'center' }} className={styles.data} rowSpan={6}>
            <QRCode value={qrcode} size={150} level={'M'} />
          </td>
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            总质量限值 (吨)
          </td>
          <td className={styles.data}>{((truckLoad || 0) / 1000).toFixed(2)}</td>
          <td style={{ width: 165 }} className={styles.label}>
            货物种类
          </td>
          <td style={{ width: 165 }} className={styles.data}>
            {goodsTypes}
          </td>
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            营运证号
          </td>
          <td className={styles.data}>{roadNumber}</td>
          <td style={{ width: 165 }} className={styles.label}>
            毛重 (吨)
          </td>
          <td style={{ width: 165 }} className={styles.data}>
            {((totalWeight || 0) / 1000).toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            资格证号
          </td>
          <td className={styles.data}>{qualificationNumber}</td>
          <td style={{ width: 165 }} className={styles.label}>
            皮重 (吨)
          </td>
          <td style={{ width: 165 }} className={styles.data}>
            {((carWeight || 0) / 1000).toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            司机电话
          </td>
          <td className={styles.data}>{mobilePhoneNumber}</td>
          <td style={{ width: 165 }} className={styles.label}>
            净重 (吨)
          </td>
          <td style={{ width: 165 }} className={styles.data}>
            {((goodsWeight || 0) / 1000).toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            原发净重 (吨)
          </td>
          <td className={styles.data}>{((fromGoodsWeight || 0) / 1000).toFixed(2)}</td>
          <td style={{ width: 165 }} className={styles.label}>
            路损 (吨)
          </td>
          <td style={{ width: 165 }} className={styles.data}>
            {((lossWeight || 0) / 1000).toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style={{ width: 190 }} className={styles.label}>
            备注
          </td>
          <td className={styles.data} colSpan={4}>
            {remark}
          </td>
        </tr>
      </table>
      <div style={{ position: 'relative' }}>
        <span className={styles.label}>计重员：</span>
        <span style={{ position: 'absolute', maxWidth: 300 }} title={sendGoodsMan} className={styles.data}>
          {sendGoodsMan}
        </span>
        <span className={styles.label} style={{ marginLeft: 320 }}>
          入场时间：
        </span>
        <span style={{ position: 'absolute', maxWidth: 300 }} className={styles.data}>
          {inTime}
        </span>
        <span className={styles.label} style={{ marginLeft: 260 }}>
          出场时间：
        </span>

        <span>{outTime}</span>
        <img src={sign} className={styles.sign} />
      </div>
    </div>
  );
};

export default Table;
