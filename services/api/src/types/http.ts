export interface JsonResponse<T> {
  status: "ok" | "error";
  data: T;
}
