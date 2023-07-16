import HorizontalLineWithLabel from "@/component/HorizonatlLine";
import useTokenList from "@/features/token/hooks/useTokenList";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { useFilePicker } from "use-file-picker";
import TimeForm, {
  OneshotTimeFormValue,
  PeriodicTimeFormValue,
  TimeFormValue,
} from "./TimeForm";
import { Controller, Resolver, useForm } from "react-hook-form";
import Ajv, { JSONSchemaType } from "ajv";
import { ajvResolver } from "@hookform/resolvers/ajv";
import { validator } from "@/utils";
import { ErrorMessage } from "@hookform/error-message";
import { APPLICATION_ERROR, UNKNOWN_VALIDATION_ERROR } from "@/error";

type PostFormValue = {
  time: {
    scheduleType: "oneshot" | "periodic";
    oneshot: OneshotTimeFormValue;
    periodic: PeriodicTimeFormValue;
  };
};

type ValidatedPostFormValue = {
  time:
    | {
        scheduleType: "oneshot";
        oneshot: OneshotTimeFormValue;
      }
    | {
        scheduleType: "periodic";
        periodic: PeriodicTimeFormValue;
      };
};

const postFormSchema = {
  type: "object",
  required: ["time"],
  properties: {
    time: {
      type: "object",
      anyOf: [
        {
          type: "object",
          required: ["scheduleType", "oneshot"],
          properties: {
            scheduleType: {
              type: "string",
              enum: ["oneshot"],
            },
            oneshot: {
              type: "object",
              required: ["datetime"],
              properties: {
                datetime: {
                  type: "string",
                  pattern: "a",
                },
              },
            },
          },
        },
        {
          type: "object",
          required: ["scheduleType", "periodic"],
          properties: {
            scheduleType: {
              type: "string",
              enum: ["periodic"],
            },
            periodic: {
              type: "object",
              required: ["unit"],
              properties: {
                unit: {
                  type: "string",
                  enum: ["minute", "hour", "day"],
                },
                value: {
                  type: "string", // TODO
                },
              },
            },
          },
        },
      ],
    },
  },
} as const;

// Workaround for non-supported "satisfies" keyword of Next.js
const _: JSONSchemaType<ValidatedPostFormValue> = postFormSchema;

const oneshotValidator = validator<OneshotTimeFormValue>(
  postFormSchema.properties.time.anyOf[0].properties.oneshot
);
const periodicValidator = validator<PeriodicTimeFormValue>(
  postFormSchema.properties.time.anyOf[1].properties.periodic
);

// NOTE: ValidatedPostFormValueはPostFormValueより狭いのでこれができる
const postFormValueResolver = ajvResolver<ValidatedPostFormValue>(
  postFormSchema
) as Resolver<PostFormValue>;

export default function PostForm() {
  const tokens = useTokenList();
  const [openFileSelector, { filesContent, loading }] = useFilePicker({});

  const disabled = (tokens.data?.list.length ?? 0) === 0;

  const { register, control, formState, handleSubmit } = useForm<PostFormValue>(
    {
      mode: "onChange",
      defaultValues: {
        time: {
          scheduleType: "oneshot",
          oneshot: {
            datetime: "",
          },
          periodic: {
            unit: "minute",
            value: "",
          },
        } as TimeFormValue,
      },
      resolver: async (values, context, options) => {
        // NOTE: anyofで返ってしまうエラーを防ぐために別途validationが必要
        let result;
        switch (values.time.scheduleType) {
          case "oneshot":
            result = oneshotValidator(values.time);
            console.log(result);
            if (!result) {
              return {
                values,
                errors: {
                  time: {
                    message:
                      oneshotValidator.errors?.join(",") ??
                      UNKNOWN_VALIDATION_ERROR,
                  },
                },
              };
            }
            break;
          case "periodic":
            result = periodicValidator(values.time);
            if (!result) {
              return {
                values,
                errors: {
                  time: {
                    message:
                      periodicValidator.errors?.join(",") ??
                      UNKNOWN_VALIDATION_ERROR,
                  },
                },
              };
            }
            break;
          default:
            return { values, errors: { time: { message: APPLICATION_ERROR } } };
        }

        return await postFormValueResolver(values, context, options);
      },
    }
  );

  console.log(formState.errors);

  return (
    <Form onSubmit={handleSubmit(() => {})}>
      {tokens.data?.list.length === 0 ? (
        <Alert variant="info">先にMisskeyと連携してください</Alert>
      ) : null}
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>使用するアカウント</Form.Label>
            <Form.Select disabled={disabled}>
              {tokens.data?.list.map((item) => (
                <option key={item.id}>
                  {item.instanceUserId}@{item.instance}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>投稿範囲</Form.Label>
            <Form.Select disabled={disabled}>
              <option value="todo">全体公開</option>
              <option value="todo">フォロワー</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group>
        <Form.Label>投稿内容</Form.Label>
        <Form.Control
          as="textarea"
          placeholder="言いたいことは?"
          disabled={disabled}
        />
      </Form.Group>
      <div className="mb-3">
        <Button variant="link" onClick={openFileSelector}>
          ファイルをアップロードする
        </Button>
      </div>
      <Controller
        name="time"
        control={control}
        render={({ field }) => <TimeForm {...field} />}
      />
      {/*
        <Card>
          <Card.Body className="text-center">
            <div className="mb-3">
              ファイルをドラッグ&ドロップして添付する
            </div>
            <HorizontalLineWithLabel>もしくは</HorizontalLineWithLabel>
              <Button variant="link" onClick={openFileSelector}>
                添付ファイルを選択
            </Button>
          </Card.Body>
        </Card>
      */}
    </Form>
  );
}
