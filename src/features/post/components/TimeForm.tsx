import { Col, Form, Row } from "react-bootstrap";
import { FieldErrors } from "react-hook-form";

export type OneshotTimeFormValue = {
  datetime: string;
};

function OneshotTimeForm({
  value,
  onChange,
}: {
  value: OneshotTimeFormValue;
  onChange: (value: OneshotTimeFormValue) => void;
}) {
  const set = (newValue: Partial<OneshotTimeFormValue>) => {
    onChange({ ...value, ...newValue });
  };

  return (
    <>
      <Form.Group>
        <Form.Label>投稿日時</Form.Label>
        <Form.Control
          type="datetime-local"
          onChange={(ev) => set({ datetime: ev.currentTarget.value })}
        />
      </Form.Group>
    </>
  );
}

export type PeriodicTimeFormValue = {
  unit: "minute" | "hour" | "day";
  value: string;
};

function PeriodicTimeForm({
  value,
  onChange,
}: {
  value: PeriodicTimeFormValue;
  onChange: (value: PeriodicTimeFormValue) => void;
}) {
  const set = (newValue: Partial<PeriodicTimeFormValue>) => {
    onChange({ ...value, ...newValue });
  };

  return (
    <>
      <Row>
        <Col>
          <Form.Group>
            <Form.Control
              value={value.value}
              onChange={(ev) => set({ value: ev.currentTarget.value })}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Select
              value={value.unit}
              onChange={(ev) =>
                set({
                  unit: ev.currentTarget.value as "minute" | "hour" | "day",
                })
              }
            >
              <option value="minute">分ごと</option>
              <option value="hour">時間ごと</option>
              <option value="day">日ごと</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}

export type TimeFormValue = {
  scheduleType: "oneshot" | "periodic";
  oneshot: OneshotTimeFormValue;
  periodic: PeriodicTimeFormValue;
};

export default function TimeForm({
  value,
  onChange,
}: {
  value: TimeFormValue;
  onChange: (value: TimeFormValue) => void;
}) {
  const set = (newValue: Partial<TimeFormValue>) => {
    onChange({ ...value, ...newValue });
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>タイマータイプ</Form.Label>
        <Form.Select
          value={value.scheduleType}
          onChange={(ev) =>
            set({
              scheduleType: ev.currentTarget.value as "oneshot" | "periodic",
            })
          }
        >
          <option value="oneshot">一回だけ投稿</option>
          <option value="periodic">繰り返し投稿</option>
        </Form.Select>
      </Form.Group>
      <Form.Group>
        {(() => {
          switch (value.scheduleType) {
            case "oneshot":
              return (
                <OneshotTimeForm
                  value={value.oneshot}
                  onChange={(oneshot) => set({ oneshot })}
                />
              );
            case "periodic":
              return (
                <PeriodicTimeForm
                  value={value.periodic}
                  onChange={(periodic) => set({ periodic })}
                />
              );
          }
          return null;
        })()}
      </Form.Group>
    </>
  );
}
