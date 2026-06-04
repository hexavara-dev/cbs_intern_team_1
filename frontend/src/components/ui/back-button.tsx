import { useRouter } from "next/navigation";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

function BackButton() {
  const router = useRouter();

  return (
    <Button
      leftIcon={ArrowLeft}
      className="mb-5 px-4!"
      onClick={() => router.back()}
    >
      Back
    </Button>
  );
}

export default BackButton;
