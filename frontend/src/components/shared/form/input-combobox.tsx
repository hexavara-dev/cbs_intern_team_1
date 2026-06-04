"use client";

import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/cn";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import ErrorText from "@/components/ui/error-text";
import LabelText from "@/components/ui/label-text";
import HelperText from "@/components/ui/helper-text";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type InputComboboxProps = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
  validation?: object;
  disabled?: boolean;
  className?: string;
  allowCustomValue?: boolean;
  helperText?: string;
  onCreateCustomValue?: (
    value: string
  ) => Promise<{ value: string; label: string } | string | void> | void;
};

export default function InputCombobox({
  name,
  label,
  options,
  placeholder = "Select option...",
  validation,
  className,
  allowCustomValue = false,
  helperText,
  onCreateCustomValue,
}: InputComboboxProps) {
  const { control } = useFormContext();
  const [inputValue, setInputValue] = React.useState("");
  const [pendingCreateValue, setPendingCreateValue] = React.useState<
    string | null
  >(null);
  const [isCreating, setIsCreating] = React.useState(false);

  // Client-side filtering
  const filteredOptions = React.useMemo(() => {
    const safeOptions = options || [];
    if (!inputValue) return safeOptions;
    return safeOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [options, inputValue]);

  return (
    <div className={cn("form-control w-full gap-1.5", className)}>
      {label && <LabelText>{label}</LabelText>}

      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field, fieldState: { error } }) => {
          const handleValueChange = (
            val: {
              value: string;
              label: string;
            } | null
          ) => {
            if (!val) {
              field.onChange("");
              return;
            }

            const isExistingOption = (options || []).some(
              (o) => o.value === val.value || o.label === val.label
            );

            if (!isExistingOption && allowCustomValue) {
              // Trigger Confirmation Dialog
              setPendingCreateValue(val.value);
            } else {
              field.onChange(val.value);
            }
          };

          return (
            <div className="relative">
              <Combobox
                value={
                  (options || []).find((o) => o.value === field.value) ||
                  (field.value
                    ? { value: field.value, label: field.value }
                    : null)
                }
                onValueChange={handleValueChange}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
              >
                <ComboboxTrigger
                  className={cn(
                    "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-normal focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    error &&
                      "border-red-500 ring-red-500 focus-visible:ring-red-500"
                  )}
                >
                  <ComboboxValue placeholder={placeholder}>
                    {(val) => (val ? val.label : placeholder)}
                  </ComboboxValue>
                </ComboboxTrigger>

                <ComboboxContent>
                  <ComboboxInput placeholder="Search..." showTrigger={false} />
                  <ComboboxList>
                    {/* Create New Option - At Top */}
                    {allowCustomValue &&
                      inputValue &&
                      !(options || []).some(
                        (o) =>
                          o.label.toLowerCase() === inputValue.toLowerCase()
                      ) && (
                        <ComboboxItem
                          value={{ value: inputValue, label: inputValue }}
                          className="bg-blue-50 font-bold text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                        >
                          + Create "{inputValue}"
                        </ComboboxItem>
                      )}

                    {/* Filtered Options */}
                    {filteredOptions.length === 0 &&
                    !inputValue &&
                    !allowCustomValue ? (
                      <ComboboxEmpty>No option found.</ComboboxEmpty>
                    ) : null}

                    {filteredOptions.length === 0 &&
                    inputValue &&
                    !allowCustomValue ? (
                      <ComboboxEmpty>No option found.</ComboboxEmpty>
                    ) : null}

                    {filteredOptions.map((option, idx) => (
                      <ComboboxItem key={idx} value={option}>
                        {option.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {helperText && !error && (
                <HelperText className="text-muted-foreground">
                  {helperText}
                </HelperText>
              )}
              {error && <ErrorText>{error.message || "Error"}</ErrorText>}

              {/* Confirmation Dialog */}
              <Dialog
                open={!!pendingCreateValue}
                onOpenChange={(open) => {
                  if (!open) setPendingCreateValue(null);
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Data</DialogTitle>
                    <DialogDescription>
                      "{pendingCreateValue}" tidak terdapat dalam list. Apakah
                      Anda ingin menambahkan sebagai data baru?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setPendingCreateValue(null)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={isCreating}
                      onClick={async () => {
                        if (pendingCreateValue) {
                          if (onCreateCustomValue) {
                            try {
                              setIsCreating(true);
                              const result =
                                await onCreateCustomValue(pendingCreateValue);
                              if (
                                result &&
                                typeof result === "object" &&
                                result.value
                              ) {
                                field.onChange(result.value);
                              } else if (result && typeof result === "string") {
                                field.onChange(result);
                              } else {
                                field.onChange(pendingCreateValue);
                              }
                            } catch (error) {
                              // eslint-disable-next-line no-console
                              console.error(error);
                            } finally {
                              setIsCreating(false);
                              setPendingCreateValue(null);
                            }
                          } else {
                            field.onChange(pendingCreateValue);
                            setPendingCreateValue(null);
                          }
                        }
                      }}
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          );
        }}
      />
    </div>
  );
}
