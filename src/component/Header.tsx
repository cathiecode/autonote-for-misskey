import HeaderAuthMenu from "@/features/auth/components/HeaderAuthMenu";
import routes from "@/routes";
import Link from "next/link";
import { useId } from "react";
import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";

export default function Header() {
  const navCollapseId = useId();

  return (
    <Navbar className="bg-body-tertiary" expand="lg">
      <Container>
        <Link href={routes.home()} passHref legacyBehavior>
          <Navbar.Brand>AutoNote for Misskey</Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls={navCollapseId} />
        <Navbar.Collapse className="justify-content-end" id={navCollapseId}>
          <Nav>
            <HeaderAuthMenu />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
