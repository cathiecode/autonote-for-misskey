import { Button, Nav, NavDropdown, NavItem } from "react-bootstrap";
import useLoginState from "../hooks/useLoginState";
import Link from "next/link";

export default function HeaderAuthMenu() {
  const loginState = useLoginState();

  if (loginState?.loggedIn) {
    return (
      <NavDropdown title={`${loginState.name}としてログイン`}>
        <Link href="#">
          <NavDropdown.Item href="#">ログアウト</NavDropdown.Item>
        </Link>
      </NavDropdown>
    );
  } else {
    return (
      <Link href="/login" passHref={true}>
        <Button variant="secondary">ログイン</Button>
      </Link>
    );
  }
}
