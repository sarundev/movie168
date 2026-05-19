import { Suspense } from "react";
import type { Metadata } from "next";
import VerifyOtpForm from "./VerifyOtpForm";

export const metadata: Metadata = {
  title: "បញ្ជាក់អ៊ីម៉ែល — 168NET",
  description: "បញ្ចូលលេខកូដដើម្បីផ្ទៀងផ្ទាត់អ៊ីម៉ែលរបស់អ្នក",
};

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
