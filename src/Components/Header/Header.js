import styles from "./Header.module.css";
const Header = (props) => {
  return (
    <div className={styles.header}>
      <div className={styles.heading}>{props.heading}</div>
      <div className={styles.links}>{props.children}</div>
    </div>
  );
};
export default Header;
