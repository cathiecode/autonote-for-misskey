import HorizontalLineWithLabel from "@/component/HorizonatlLine";
import { useId, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import usePasswordLogin from "../hooks/usePasswordLogin";

type FormInput = { loginId: string; password: string };

export default function LoginForm() {
  const loginIdInputId = useId();
  const passwordInputId = useId();

  const [error, setError] = useState();

  const { register, handleSubmit } = useForm<FormInput>();
  const passwordLogin = usePasswordLogin();

  const onSubmit = (data: FormInput) => {
    console.log("submit");
    passwordLogin(data.loginId, data.password);
  };

  return (
    <>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId={loginIdInputId}>
          <Form.Label>ログインID</Form.Label>
          <Form.Control {...register("loginId")} />
        </Form.Group>
        <Form.Group className="mb-3" controlId={passwordInputId}>
          <Form.Label>パスワード</Form.Label>
          <Form.Control type="password" {...register("password")} />
        </Form.Group>
        <div className="text-center mb-3">
          <Button type="submit">ログイン</Button>
        </div>
      </Form>
    </>
  );
}
