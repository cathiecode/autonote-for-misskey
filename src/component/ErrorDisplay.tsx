import { ErrorCode, humanReadable } from "@/error";
import { Alert } from "react-bootstrap";

export default function ErrorDisplay({ error }: { error: ErrorCode | undefined }) {
  if (!error) {
    return null;
  }

  return (
    <Alert variant="danger">
      {humanReadable(error)}({error})
    </Alert>
  );
}
