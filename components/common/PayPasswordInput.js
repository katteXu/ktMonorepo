import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Input } from 'antd';
import { getTimeStamp, getPayPublicKey } from '@api';
// const publicKey = `
// -----BEGIN PUBLIC KEY-----
// MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCp0EnKpQQA2DodNMHvVtzqm+xZ
// inwxzyOo5+jqzo2MkfOjA8E711tYIeoq8mN8KKvg8VOwkSLvv90PmTOSSgVkCpXe
// 6K7axssoSTAN/uJ3WbpRHpTpxaHS4mgnxSiHFOj453nG2cL9jpZhvmt4u7RbTCXF
// shDr/o+NZqhanyaG1wIDAQAB
// -----END PUBLIC KEY-----
// `;

const mainStyle = {
  width: 'max-content',
  // margin: '0 auto',
  cursor: 'pointer',
  position: 'relative',
};
const style = {
  width: 32,
  margin: '0 2px',
  textAlign: 'center',
  justifyContent: 'center',
};

const maskStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 99,
};
const PayPasswordInput = ({ onChange }, ref) => {
  const [publicKey, setPublicKey] = useState('');

  const [_timestamp, setTimestamp] = useState();
  // 初始化
  useEffect(() => {
    getPublicKey();
  }, []);

  // 获取公钥
  const getPublicKey = async () => {
    const res = await getPayPublicKey();
    if (res.status === 0) {
      setPublicKey(res.result.publicKey);
      setTimestamp(res.result.timestamp);
    } else {
      console.error(`支付公钥获取失败，${res.detail}`);
    }
  };

  // 节点对象
  const [input0, setInput0] = useState();
  const [input1, setInput1] = useState();
  const [input2, setInput2] = useState();
  const [input3, setInput3] = useState();
  const [input4, setInput4] = useState();
  const [input5, setInput5] = useState();

  // 输入框值
  const [value0, setValue0] = useState();
  const [value1, setValue1] = useState();
  const [value2, setValue2] = useState();
  const [value3, setValue3] = useState();
  const [value4, setValue4] = useState();
  const [value5, setValue5] = useState();

  // 密码输入结果值
  const [value, setValue] = useState([]);
  // 当前输入框索引
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (input0 && publicKey) {
      input0.focus();
    }
  }, [input0, publicKey]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setValue0(undefined);
      setValue1(undefined);
      setValue2(undefined);
      setValue3(undefined);
      setValue4(undefined);
      setValue5(undefined);
      input0.focus();
      onChange && onChange([]);
    },
  }));

  // 输入密码
  const handleInput = async (e, index) => {
    if (!publicKey) {
      e.preventDefault();
      return;
    }
    const _value = e.target.value;
    if (_value) {
      EveryHandleInput(index);
    }

    // 加密
    const { JSEncrypt } = require('jsencrypt');
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    let timestamp;
    if (index === 5) {
      // timestamp = await getStamp();
      timestamp = _timestamp;
    }

    // 真实字符
    const _v = `${_value}${timestamp ? '-' + timestamp : ''}`;
    // 加密字符
    const password = encrypt.encrypt(_v);
    value[index] = { value: password };
    setValue(value);
  };

  // 输入操作
  const EveryHandleInput = index => {
    if (index === 0) {
      setValue0('*');
      input1.focus();
    }
    if (index === 1) {
      setValue1('*');
      input2.focus();
    }
    if (index === 2) {
      setValue2('*');
      input3.focus();
    }
    if (index === 3) {
      setValue3('*');
      input4.focus();
    }
    if (index === 4) {
      setValue4('*');
      input5.focus();
    }
    if (index === 5) {
      setValue5('*');
      onChange && onChange(value);
    }
  };

  // 获取焦点
  const handleBlur = e => {
    switch (current) {
      case 0:
        input0.focus();
        break;
      case 1:
        input1.focus();
        break;
      case 2:
        input2.focus();
        break;
      case 3:
        input3.focus();
        break;
      case 4:
        input4.focus();
        break;
      case 5:
        input5.focus();
        break;
      default:
        input0.focus();
        break;
    }
  };

  // 删除操作
  const handleCancel = (e, index) => {
    const isCancel = e.keyCode === 8;
    if (!isCancel) return;
    switch (index) {
      case 0:
        setValue0(undefined);
        break;
      case 1:
        setValue1(undefined);
        input0.focus();
        break;
      case 2:
        setValue2(undefined);
        input1.focus();
        break;
      case 3:
        setValue3(undefined);
        input2.focus();
        break;
      case 4:
        setValue4(undefined);
        input3.focus();
        break;
      case 5:
        if (value5) {
          setValue5(undefined);
          onChange && onChange([]);
        } else {
          input4.focus();
        }
        break;
      default:
        break;
    }
  };

  const getStamp = async () => {
    const res = await getTimeStamp();

    if (res.status === 0) {
      return res.result;
    } else {
      return false;
    }
  };

  return (
    <div style={mainStyle} onClick={handleBlur}>
      <Input
        tabIndex={-1}
        value={value0}
        ref={setInput0}
        style={style}
        maxLength={1}
        onChange={e => handleInput(e, 0)}
        onFocus={() => {
          setCurrent(0);
          setValue0(undefined);
        }}
        onKeyDown={e => handleCancel(e, 0)}
        readOnly={!publicKey}
      />
      <Input
        tabIndex={-1}
        value={value1}
        ref={setInput1}
        style={style}
        maxLength={1}
        onChange={e => handleInput(e, 1)}
        onFocus={() => {
          setCurrent(1);
          setValue1(undefined);
        }}
        onKeyDown={e => handleCancel(e, 1)}
      />
      <Input
        tabIndex={-1}
        value={value2}
        ref={setInput2}
        style={style}
        maxLength={1}
        onChange={e => handleInput(e, 2)}
        onFocus={() => {
          setCurrent(2);
          setValue2(undefined);
        }}
        onKeyDown={e => handleCancel(e, 2)}
      />
      <Input
        tabIndex={-1}
        value={value3}
        ref={setInput3}
        style={style}
        maxLength={1}
        onChange={e => handleInput(e, 3)}
        onFocus={() => {
          setCurrent(3);
          setValue3(undefined);
        }}
        onKeyDown={e => handleCancel(e, 3)}
      />
      <Input
        tabIndex={-1}
        value={value4}
        ref={setInput4}
        style={style}
        maxLength={1}
        onChange={e => handleInput(e, 4)}
        onFocus={() => {
          setCurrent(4);
          setValue4(undefined);
        }}
        onKeyDown={e => handleCancel(e, 4)}
      />
      <Input
        tabIndex={-1}
        value={value5}
        ref={setInput5}
        style={style}
        maxLength={1}
        onChange={e => handleInput(e, 5)}
        onFocus={() => {
          setCurrent(5);
        }}
        onKeyDown={e => {
          handleCancel(e, 5);
        }}
      />

      {/* 遮罩 */}
      <div style={maskStyle}></div>
    </div>
  );
};

export default forwardRef(PayPasswordInput);
