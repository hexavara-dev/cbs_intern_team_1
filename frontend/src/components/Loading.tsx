import { TailSpin } from "react-loader-spinner";

function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <TailSpin color="var(--primary)" />
    </div>
  );
}

export default Loading;
