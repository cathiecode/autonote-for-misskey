import routes from "@/routes";
import Link from "next/link";
import { Router } from "next/router";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

type FormInput = {
  instance: string;
};

export default function AddInstanceForm() {
  return (
    <Form method="POST" action={routes.startMiAuth()}>
      <Form.Group className="mb-3">
        <Form.Label>サーバーを追加</Form.Label>
        <Form.Control placeholder="misskey.io" name="instance" required />
      </Form.Group>
      <Button type="submit">連携を追加</Button>
    </Form>
  );
}
