import { Card, Form, ListGroup } from "react-bootstrap";
import useTokenList from "../hooks/useTokenList";
import AddInstanceForm from "./AddInstanceForm";

export default function TokenList() {
  const tokens = useTokenList();

  console.log(tokens);

  return (
    <>
      {tokens.data?.list.length !== 0 ? (
        <ListGroup className="mb-3">
          {tokens.data?.list.map((item) => (
            <ListGroup.Item key={item.token}>
              {item.instanceUserId}@{item.instance}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : null}

      <Card>
        <Card.Body>
          <AddInstanceForm />
        </Card.Body>
      </Card>
    </>
  );
}
