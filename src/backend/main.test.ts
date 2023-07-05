import { greeting } from "./main";

describe("main module", () => {
  test("return greeting message", () => {
    expect(greeting()).toBe("Hello, world!");
  });
});
