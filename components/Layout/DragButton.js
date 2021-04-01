import React, { useRef, useState, useEffect } from 'react';
import { Icon } from '@components';
const phone = '../../static/icon/phone.svg';
import styles from './main.less';

const DragButton = props => {
  const [posi, setPosi] = useState({
    oLeft: '',
    oTop: '',
  });
  // 节点
  const domRef = useRef(null);

  const oW = useRef(null);
  const oH = useRef(null);
  const htmlWidth = useRef(null);
  const htmlHeight = useRef(null);
  const bWidth = useRef(null);
  const bHeight = useRef(null);

  const moving = useRef(false);
  const click = useRef(false);

  // 移动触发
  const handleTouchStart = e => {
    click.current = true;

    oW.current = e.clientX - domRef.current.getBoundingClientRect().left;
    oH.current = e.clientY - domRef.current.getBoundingClientRect().top;

    htmlWidth.current = document.documentElement.clientWidth;
    htmlHeight.current = document.documentElement.clientHeight;

    bWidth.current = domRef.current.offsetWidth;
    bHeight.current = domRef.current.offsetHeight;

    let oTop = e.clientY - oH;

    setPosi({
      oTop,
    });

    moving.current = true;
  };

  // 移动结束
  const handleTouchEnd = e => {
    moving.current = false;

    // 左侧距离
    let oLeft = posi.oLeft;
    if (oLeft < (htmlWidth.current - bWidth.current) / 2) {
      oLeft = 0;
    } else {
      oLeft = htmlWidth.current - bWidth.current;
    }

    if (click.current) {
      props.onClick();
    }

    setPosi({ ...posi, oLeft });
  };

  useEffect(() => {
    const handleMouseUp = () => {
      moving.current = false;
    };
    document.body.addEventListener('mousemove', handleTouchMove);
    document.body.addEventListener('mouseup', handleMouseUp);

    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.body.removeEventListener('mousemove', handleTouchMove);
      document.body.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // 开始移动
  const handleTouchMove = e => {
    moving.current && handleMove(e);
  };

  const handleMouseLeave = () => {
    moving.current = false;
  };

  // 移动中
  const handleMove = e => {
    click.current = false;

    // 左侧距离
    let oLeft = e.clientX - oW.current;
    let oTop = e.clientY - oH.current;

    if (oLeft < 0) {
      oLeft = 0;
    } else if (oLeft > htmlWidth.current - bWidth.current) {
      oLeft = htmlWidth.current - bWidth.current;
    }
    if (oTop < 0) {
      oTop = 0;
    } else if (oTop > htmlHeight.current - bHeight.current) {
      oTop = htmlHeight.current - bHeight.current;
    }

    setPosi({
      oTop,
    });
  };

  return (
    <div
      ref={domRef}
      style={{
        top: `${posi.oTop}px`,
      }}
      className={styles.help}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}>
      <img src={Icon.Phone} onMouseMove={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
      <div>联系客服</div>
    </div>
  );
};

export default DragButton;
