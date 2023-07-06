import Page from "@/component/Page";
import TokenList from "@/features/token/components/TokenList";
import { Card, ListGroup } from "react-bootstrap";

export default function Dashboard() {
  return <Page>
    <h1>ダッシュボード</h1>
    <section>
      <h2>Step.1 Misskeyとの連携を設定する</h2>
      <TokenList />
    </section>
    <section>
    <h2>Step.2 投稿を設定する</h2>
    </section>
  </Page>
}