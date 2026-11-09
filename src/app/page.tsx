import { redirect } from "next/navigation";
import { CONTROL_PATH } from "@/lib/app-routes";

// A página inicial leva ao Controle (FR-003). O proxy já faz esse redirecionamento; esta página é
// a garantia caso a requisição chegue aqui sem passar por ele.
export default function HomePage() {
  redirect(CONTROL_PATH);
}
