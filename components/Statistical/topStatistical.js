import React from 'react';
import { Image } from '@components';
import { Row, Col } from 'antd';
import styles from './stock.less';

const Index = ({ form, to, production, inputTotal }) => {
  return (
    <div style={{ marginTop: 24 }}>
      <Row gutter={24} style={{ marginTop: 0 }}>
        <Col style={{ width: '25%' }}>
          <div className={`${styles['today-card']}`} style={{ paddingRight: 16, height: 118, paddingTop: 16 }}>
            <div className={styles['in']}>
              <div
                className={styles.title}
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#4A4A5A',
                  fontSize: 16,
                  marginTop: -4,
                }}>
                发货总量
                <img src={Image.Pic3} style={{ width: 36, height: 36 }} />
              </div>
              <div className={styles.num} style={{ marginTop: 0 }}>
                {form}
                <span
                  style={{
                    color: '#4A4A5A',
                    fontSize: 16,
                    fontWeight: 400,
                    marginLeft: 12,
                  }}>
                  吨
                </span>
              </div>
            </div>
          </div>
        </Col>
        <Col style={{ width: '25%' }}>
          <div className={`${styles['today-card']}`} style={{ paddingRight: 16, height: 118, paddingTop: 16 }}>
            <div className={styles['out']}>
              <div
                className={styles.title}
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#4A4A5A',
                  fontSize: 16,
                  marginTop: -4,
                }}>
                收货总量
                <img src={Image.Pic4} style={{ width: 36, height: 36 }} />
              </div>
              <div className={styles.num} style={{ marginTop: 0 }}>
                {to}
                <span
                  style={{
                    color: '#4A4A5A',
                    fontSize: 16,
                    fontWeight: 400,
                    marginLeft: 12,
                  }}>
                  吨
                </span>
              </div>
            </div>
          </div>
        </Col>
        <Col style={{ width: '25%' }}>
          <div className={`${styles['today-card']}`} style={{ paddingRight: 16, height: 118, paddingTop: 16 }}>
            <div className={styles['consume']}>
              <div
                className={styles.title}
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#4A4A5A',
                  fontSize: 16,
                  marginTop: -4,
                }}>
                生产总量
                <img src={Image.Pic1} style={{ width: 36, height: 36 }} />
              </div>
              <div className={styles.num} style={{ marginTop: 0 }}>
                {production}
                <span
                  style={{
                    color: '#4A4A5A',
                    fontSize: 16,
                    fontWeight: 400,
                    marginLeft: 12,
                  }}>
                  吨
                </span>
              </div>
            </div>
          </div>
        </Col>
        <Col style={{ width: '25%' }}>
          <div className={`${styles['today-card']}`} style={{ paddingRight: 16, height: 118, paddingTop: 16 }}>
            <div className={styles['product']}>
              <div
                className={styles.title}
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#4A4A5A',
                  fontSize: 16,
                  marginTop: -4,
                }}>
                原料投入总量
                <img src={Image.Pic2} style={{ width: 36, height: 36 }} />
              </div>
              <div className={styles.num} style={{ marginTop: 0 }}>
                {inputTotal}
                <span
                  style={{
                    color: '#4A4A5A',
                    fontSize: 16,
                    fontWeight: 400,
                    marginLeft: 12,
                  }}>
                  吨
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Index;
