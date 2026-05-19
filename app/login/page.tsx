import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "ចូលគណនី — 168NET",
  description: "ចូលគណនីរបស់អ្នកដើម្បីមើលរឿងភាគយន្ត",
};

export default function LoginPage() {
  return <LoginForm />;
}
