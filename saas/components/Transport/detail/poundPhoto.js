import React, { useState, useEffect } from 'react';
import styles from './styles.less';
import router from 'next/router';
// 动态导入图片查看组件
import dynamic from 'next/dynamic';
import { useTokenImage } from '@components/Hooks';
import { Image } from '@components';
const Viewer = dynamic(import('react-viewer'), { ssr: false });

const emptyPic = '../../../static/img/noPoundPic.png';

const PoundPhoto = props => {
  const { deliverPoundPic, receivePoundPic, fromPoundId, toPoundId } = props.dataInfo;
  const {
    images: [_deliverPoundPic, _receivePoundPic],
    buildUrl,
  } = useTokenImage(2);
  const [showPoundImg, setShowPoundImg] = useState(false);
  const [imgIndex, setImgIndex] = useState();
  const [poundPic, setPoundPic] = useState({});

  useEffect(() => {
    buildUrl([deliverPoundPic, receivePoundPic]);
  }, []);

  // 展示磅单
  const showPound = index => {
    setShowPoundImg(true);
    setImgIndex(index);
  };

  const showPoundById = id => {
    if (id) {
      router.push(`/virtualDetail?id=${id}`);
    }
  };

  return (
    <div className={styles.floor}>
      <div className={styles.title}>磅单照片</div>
      <div className={styles['pound-photo']}>
        <div className={styles['pound-img']}>
          <div>
            {_deliverPoundPic ? (
              <img onClick={() => showPound(0)} style={{ cursor: 'pointer' }} src={_deliverPoundPic} />
            ) : (
              <img
                style={{ cursor: fromPoundId && 'pointer' }}
                src={fromPoundId ? Image.EmptyPoundPic : Image.NoPoundPic}
                onClick={() => showPoundById(fromPoundId)}
              />
            )}
          </div>
          <p>发货磅单</p>
        </div>
        <div className={styles['pound-img']}>
          <div>
            {_receivePoundPic ? (
              <img onClick={() => showPound(1)} style={{ cursor: 'pointer' }} src={_receivePoundPic} />
            ) : (
              <img
                style={{ cursor: toPoundId && 'pointer' }}
                src={toPoundId ? Image.EmptyPoundPic : Image.NoPoundPic}
                onClick={() => showPoundById(toPoundId)}
              />
            )}
          </div>
          <p>收货磅单</p>
        </div>
      </div>

      {/* 预览磅单 */}
      {showPoundImg && (
        <Viewer
          visible={showPoundImg}
          activeIndex={imgIndex}
          onClose={() => setShowPoundImg(false)}
          onMaskClick={() => setShowPoundImg(false)}
          images={[
            { src: _deliverPoundPic, alt: '发货磅单' },
            { src: _receivePoundPic, alt: '收货磅单' },
          ]}
        />
      )}
    </div>
  );
};

export default PoundPhoto;
