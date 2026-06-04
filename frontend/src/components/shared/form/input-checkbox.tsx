import { Controller, get, useFormContext } from "react-hook-form";

import { Checkbox } from "../../ui/checkbox";
import ErrorText from "../../ui/error-text";

type InputCheckboxProps = {
  name: string;
  label: string;
  labelClassname?: string;
} & React.ComponentProps<"input">;

function InputCheckbox({ name, label, labelClassname }: InputCheckboxProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={false}
      render={({ field }) => (
        <>
          <div className="flex items-center space-x-2">
            <Checkbox onCheckedChange={field.onChange} checked={field.value} />
            <label className={labelClassname}>{label}</label>
          </div>
          {error && <ErrorText>{error.message?.toString()}</ErrorText>}
        </>
      )}
    />
  );
}

export default InputCheckbox;
