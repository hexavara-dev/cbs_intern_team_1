export type SelectOption = {
  label: string;
  value: string;
};

export function responseToDefaultSelectOption<
  T extends { id: string; name: string },
>(data: T[]): SelectOption[] {
  return data.map((item) => ({
    label: item.name,
    value: item.id,
  }));
}
