import { ReactNode } from "react";
import Header from "./Header";
import { Container } from "react-bootstrap";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <Container className="mt-3">
        {children}
      </Container>
    </>
  );
}
