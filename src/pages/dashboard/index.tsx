import Page from "@/component/Page";
import PostForm from "@/features/post/components/PostForm";
import TokenList from "@/features/token/components/TokenList";
import { Card } from "react-bootstrap";

export default function Dashboard() {
  return <Page>
    <h1>ダッシュボード</h1>
    <section className="mb-3">
      <h2>Step.1 Misskeyとの連携を設定する</h2>
      <TokenList />
    </section>
    <section>
      <h2>Step.2 投稿を予約する</h2>
      <Card>
        <Card.Body>
          <PostForm />
        </Card.Body>
      </Card>
    </section>
  </Page>
}