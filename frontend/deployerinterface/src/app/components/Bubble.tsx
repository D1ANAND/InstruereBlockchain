import Head from 'next/head';
import styles from './Bubbles.module.css';

const Bubbles = () => {
  return (
    <>
      <div className={styles.container}>
        <span className={`${styles.bub} ${styles.a}`}></span>
        <span className={`${styles.bub} ${styles.b}`}></span>
        <span className={`${styles.bub} ${styles.c}`}></span>
        <span className={`${styles.bub} ${styles.d}`}></span>
        <span className={`${styles.bub} ${styles.e}`}></span>
        <span className={`${styles.bub} ${styles.f}`}></span>
        <span className={`${styles.bub} ${styles.g}`}></span>
        <span className={`${styles.bub} ${styles.h}`}></span>
        <span className={`${styles.bub} ${styles.i}`}></span>
        <span className={`${styles.bub} ${styles.j}`}></span>
        <span className={`${styles.bub} ${styles.k}`}></span>
      </div>
    </>
  );
};

export default Bubbles;
