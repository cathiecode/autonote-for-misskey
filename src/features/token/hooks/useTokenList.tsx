import { Output } from "@/pages/api/tokens";
import { swrCall } from "@/utils";
import useSWR from "swr";

export default function useTokenList() {
  const {data, error} = useSWR(["/api/tokens"], swrCall<Output>);
  return {data, error};
}
