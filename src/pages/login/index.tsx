import HorizontalLineWithLabel from "@/component/HorizonatlLine";
import Page from "@/component/Page";
import LoginForm from "@/features/auth/components/LoginForm";
import routes from "@/routes";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button, Card } from "react-bootstrap";

export default function Login() {
  const router = useRouter();
  return (
    <Page>
      <h1>ログイン</h1>
      <main className="mt-3">
        <Card>
          <Card.Body>
            <LoginForm onLogin={ () => router.replace(routes.dashboard()) } />
            <div className="mb-3">
              <HorizontalLineWithLabel>もしくは</HorizontalLineWithLabel>
            </div>
            <div className="mb-3 text-center">
              <Link legacyBehavior passHref href="/signup">
                <Button variant="link">アカウントを作成</Button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </main>
    </Page>
  );
}
