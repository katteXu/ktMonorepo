// 状态样式
const status_styles = {
  position: 'relative',
  paddingLeft: 10,
  whiteSpace: 'nowrap',
};

// 状态颜色样式
const status_icon_styles = {
  fontWeight: 400,
  display: 'inline-block',
  width: 6,
  height: 6,
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: 0,
  borderRadius: 3,
};

// 状态组件
const Status = {
  route: {
    OPEN: '已开启',
    CLOSE: '已关闭',
    DELETE: '已删除',
    NOT_BEGUN: '未开始',
    PROCESS: '进行中',
    COMPLETE: '已完成',
    EXPIRED: '已过期',
  },

  routeColor: {
    OPEN: { color: '#66BD7E', bg: '#EDFAF1' },
    CLOSE: { color: '#E44040', bg: '#FFF0F0' },
    DELETE: { color: '#E44040', bg: '#FFF0F0' },
    NOT_BEGUN: { color: '#B4B4B4', bg: '#EDEFF1' },
    PROCESS: { color: '#477AEF', bg: '#F5F9FF' },
    COMPLETE: { color: '#B4B4B4', bg: '#EDEFF1' },
    EXPIRED: { color: '#E44040', bg: '#FFF0F0' },
  },

  order: {
    WAIT_CONFIRMED: '待装货',
    PROCESS: '待卸货',
    WAIT_PAY: '待支付',
    PAYING: '支付中',
    DONE: '已完成',
    APPLY_CANCEL: '待取消',
    REJECT: '已驳回',
    CHECKING: '待结算',
    CANCEL: '已取消',
  },

  orderNew: {
    WAIT_CONFIRMED: '待装货',
    PROCESS: '待卸货',
    WAIT_PAY: '待支付',
    PAYING: '支付中',
    DONE: '已完成',
    APPLY_CANCEL: '待取消',
    REJECT: '已驳回',
    CHECKING: '待结算',
  },
  orderColor: {
    PROCESS: { color: '#477AEF', bg: '#F5F9FF' },
    DONE: { color: '#BFBFBF', bg: '#FFFDFD' },
    WAIT_PAY: { color: '#66BD7E', bg: '#F5FFF8' },
    REJECT: { color: '#E44040', bg: '#FFF0F0' },
    WAIT_CONFIRMED: { color: '#477AEF', bg: '#F5F9FF' },
    APPLY_CANCEL: { color: '#E44040', bg: '#FFF0F0' },
    PAYING: { color: '#477AEF', bg: '#F5F9FF' },
    CHECKING: { color: '#66BD7E', bg: '#F5FFF8' },
    CANCEL: { color: '#E44040', bg: '#FFF0F0' },
  },
  pay: {},
  invoice: {
    UN_APPROVE: '待审核',
    REJECT_APPROVE: '被驳回',
    UN_PAY: '待结算',
    UN_INVOICE: '待开票',
    INVOICED: '已完成',
  },

  customerType: [
    { name: '煤矿', value: 1 },
    { name: '洗煤厂', value: 2 },
    { name: '储煤厂', value: 3 },
    { name: '贸易商', value: 4 },
    { name: '运输公司', value: 5 },
    { name: '焦化厂', value: 6 },
    { name: '配煤厂', value: 7 },
    { name: '水泥厂', value: 8 },
    { name: '钢厂', value: 9 },
    { name: '耐火厂', value: 10 },
    { name: '站台', value: 11 },
    { name: '物流公司', value: 12 },
    { name: '电厂', value: 13 },
    { name: '其他', value: 14 },
  ],

  customerTypeText: {
    1: '煤矿',
    2: '洗煤厂',
    3: '储煤厂',
    4: '贸易商',
    5: '运输公司',
    6: '焦化厂',
    7: '配煤厂',
    8: '水泥厂',
    9: '钢厂',
    10: '耐火厂',
    11: '站台',
    12: '物流公司',
    13: '电厂',
    14: '其他',
  },

  customerAttributeText: {
    1: '直接客户',
    2: '代理客户',
    3: '代理商客户',
  },

  customerAttribute: [
    { name: '直接客户', value: 1 },
    { name: '代理客户', value: 2 },
    { name: '代理商客户', value: 3 },
  ],
};

// 专线状态组件
Status.Route = ({ code }) => {
  // 专线状态
  const _status = {
    OPEN: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#B4B4B4' }} />
        已开启
      </span>
    ),
    CLOSE: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#E44040' }} />
        已关闭
      </span>
    ),
    DELETE: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#E44040' }} />
        已删除
      </span>
    ),
    NOT_BEGUN: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#B4B4B4' }} />
        未开始
      </span>
    ),
    PROCESS: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#477AEF' }} />
        进行中
      </span>
    ),
    COMPLETE: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#B4B4B4' }} />
        已完成
      </span>
    ),
    EXPIRED: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#E44040' }} />
        已过期
      </span>
    ),
  };
  return _status[code] || <>{code}</>;
};

// 运单状态
Status.Order = ({ code }) => {
  const _status = {
    PROCESS: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#477AEF' }} />
        待卸货
      </span>
    ),
    DONE: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#B4B4B4' }} />
        已完成
      </span>
    ),
    CHECKING: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#66BD7E' }} />
        待结算
      </span>
    ),
    WAIT_PAY: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#66BD7E' }} />
        待支付
      </span>
    ),
    REJECT: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#E44040' }} />
        已驳回
      </span>
    ),
    WAIT_CONFIRMED: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#477AEF' }} />
        待装货
      </span>
    ),
    APPLY_CANCEL: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#E44040' }} />
        待取消
      </span>
    ),
    PAYING: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#66BD7E' }} />
        支付中
      </span>
    ),
    WAIT_FLEET_CAPTAIN_PAY: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#848485' }} />
        已完成
      </span>
    ),
    FLEET_CAPTAIN_PAYING: (
      <span style={{ ...status_styles }}>
        <i style={{ ...status_icon_styles, background: '#848485' }} />
        已完成
      </span>
    ),
  };
  return _status[code] || <>{code}</>;
};

// 开票状态
Status.Invoice = ({ code, txt }) => {
  // 开票状态
  const _status = {
    UN_APPROVE: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#46B8AF' }} />
        {txt}
      </span>
    ),
    REJECT_APPROVE: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#E44040' }} />
        {txt}
      </span>
    ),
    UN_PAY: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#66BD7E' }} />
        {txt}
      </span>
    ),
    UN_INVOICE: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#FF8742' }} />
        {txt}
      </span>
    ),
    INVOICED: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#46B8AF' }} />
        {txt}
      </span>
    ),
  };
  return _status[code] || <>{code}</>;
};

// 交易状态
Status.Pay = ({ code }) => {
  const _status = {
    PAYED: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#66BD7E' }} />
        成功
      </span>
    ),
    FAIL: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#E44040' }} />
        失败
      </span>
    ),
    PROCESSING: (
      <span style={status_styles}>
        <i style={{ ...status_icon_styles, background: '#FFB741' }} />
        交易中
      </span>
    ),
  };
  return _status[code] || <>{code}</>;
};

// 化验类型
Status.Assay = ({ code }) => {
  const _status = ['出厂化验', '入厂化验', '旋选化验', '浮选化验', '配煤化验'];
  return _status[code] || <>{code}</>;
};

export default Status;
