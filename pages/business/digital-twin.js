import { useEffect } from "react";
import { useRouter } from "next/router";
import BusinessLayout from "@/components/business/BusinessLayout";

export default function DigitalTwinPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/business/profile");
  }, [router]);
  return null;
}

DigitalTwinPage.getLayout = (page) => <BusinessLayout>{page}</BusinessLayout>;