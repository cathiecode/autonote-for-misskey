import HorizontalLineWithLabel from "@/component/HorizonatlLine";
import { useId, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import usePasswordLogin from "../hooks/usePasswordLogin";
import ErrorDisplay from "@/component/ErrorDisplay";

type FormInput = { loginId: string; password: string };

export default function LoginForm({onLogin}: {onLogin: () => void}) {
  const loginIdInputId = useId();
  const passwordInputId = useId();

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm<FormInput>();
  const passwordLogin = usePasswordLogin();

  const onSubmit = async (data: FormInput) => {
    const result = await passwordLogin(data.loginId, data.password);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    onLogin()
  };

  return (
    <>
      <ErrorDisplay error={error} />
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
          <Button type="submit" disabled={loading}>ログイン</Button>
        </div>
      </Form>
    </>
  );
}
