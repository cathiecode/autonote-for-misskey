import { ListGroup } from "react-bootstrap";
import useTokenList from "../hooks/useTokenList";

export default function TokenList() {
  const tokens = useTokenList();

  return (
    <ListGroup>
      {tokens.data?.list.map((item) => (
        <ListGroup.Item key={item.token}>
          {item.instanceUserId}@{item.instance}
        </ListGroup.Item>
      ))}
      {tokens.data?.list.length === 0 ? "まだ連携が設定されていません！" : null}
    </ListGroup>
  );
}
