import { css } from "@emotion/react";
import { ReactNode } from "react";

export default function HorizontalLineWithLabel({children}: {children: ReactNode}) {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        white-space: nowrap;
        gap: 1em;

        :before {
          content: "";
          display: block;
          background-color: #eee;
          width: 50%;
          height: 1px;
        }

        :after {
          content: "";
          display: block;
          background-color: #eee;
          width: 50%;
          height: 1px;
        }
      `}
    >
      {children}
    </div>
  );
}
