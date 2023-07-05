import HorizontalLineWithLabel from "@/component/HorizonatlLine";
import { useId } from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

type FormInput = {loginId: string, password: string};

export default function LoginForm() {
  const loginIdInputId = useId();
  const passwordInputId = useId();

  const {register, handleSubmit} = useForm<FormInput>();

  const onSubmit = (data: FormInput) => {
    
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId={loginIdInputId}>
          <Form.Label>ログインID</Form.Label>
          <Form.Control {...register("loginId")} />
        </Form.Group>
        <Form.Group className="mb-3" controlId={passwordInputId}>
          <Form.Label>パスワード</Form.Label>
          <Form.Control type="password" {...register("password")} />
        </Form.Group>
      </Form>
      <div className="text-center mb-3">
        <Button>アカウントを作成</Button>
      </div>
    </>
  );
}
