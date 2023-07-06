import HorizontalLineWithLabel from "@/component/HorizonatlLine";
import { useId, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import useCreateUserWithPassword from "../hooks/useCreateUserWithPassword";
import { ErrorCode } from "@/error";
import ErrorDisplay from "@/component/ErrorDisplay";

type FormInput = { loginId: string; password: string };

export default function LoginForm({onSignup}: {onSignup: () => void}) {
  const loginIdInputId = useId();
  const passwordInputId = useId();

  const [error, setError] = useState<ErrorCode>();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormInput>();

  const createUserWithPassword = useCreateUserWithPassword();

  const onSubmit = async (data: FormInput) => {
    setLoading(true);
    setError(undefined);

    const result = await createUserWithPassword(data.loginId, data.password);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onSignup();
  };

  return (
    <>
      <ErrorDisplay error={error} />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId={loginIdInputId}>
          <Form.Label>ログインID</Form.Label>
          <Form.Control disabled={loading} {...register("loginId")} />
        </Form.Group>
        <Form.Group className="mb-3" controlId={passwordInputId}>
          <Form.Label>パスワード</Form.Label>
          <Form.Control type="password" disabled={loading} {...register("password")} />
        </Form.Group>
        <div className="text-center mb-3">
          <Button type="submit" disabled={loading}>アカウントを作成</Button>
        </div>
      </Form>
    </>
  );
}
