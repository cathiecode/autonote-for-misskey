import HorizontalLineWithLabel from "@/component/HorizonatlLine";
import Page from "@/component/Page";
import LoginForm from "@/features/auth/components/LoginForm";
import SignUpForm from "@/features/auth/components/SignUpForm";
import Link from "next/link";
import { Button, Card } from "react-bootstrap";

export default function Login() {
  return (
    <Page>
      <h1>アカウントを作成</h1>
      <main className="mt-3">
        <Card>
          <Card.Body>
            <SignUpForm />
            <div className="mb-3">
              <HorizontalLineWithLabel>もしくは</HorizontalLineWithLabel>
            </div>
            <div className="mb-3 text-center">
              <Link legacyBehavior passHref href="/login">
                <Button variant="link">ログイン</Button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </main>
    </Page>
  );
}
