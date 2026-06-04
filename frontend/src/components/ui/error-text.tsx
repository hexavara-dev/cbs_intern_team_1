import Typography from "@/components/Typography";

export default function ErrorText({ children }: { children: string }) {
  return (
    <div className="flex space-x-1">
      <Typography
        as="p"
        weight="regular"
        variant="label"
        className="text-xs !leading-tight text-red-500"
      >
        {children}
      </Typography>
    </div>
  );
}
