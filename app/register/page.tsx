import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "ចុះឈ្មោះ — 168NET",
  description: "បង្កើតគណនីថ្មីដើម្បីមើលរឿងភាគយន្ត",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
