import { redirect } from "next/navigation";

export default function HomePage() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Calcutta",
  }).format(new Date());

  redirect(`/${today}`);
}
