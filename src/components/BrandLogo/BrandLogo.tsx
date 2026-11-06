import logo from './cromocard-logo.svg';
import styles from './BrandLogo.module.css';

export function BrandLogo() {
  return <img className={styles.logo} src={logo} alt="" width={312} height={52} />;
}
