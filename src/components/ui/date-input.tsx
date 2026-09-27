import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";

// Named per docs/Design_System_v0.2.md section 14's component list — styling
// is identical to Input (section 7 applies to text/numeric/select/date
// inputs alike), this just fixes type="date" so call sites don't repeat it.
function DateInput(props: Omit<ComponentProps<typeof Input>, "type">) {
  return <Input type="date" {...props} />;
}

export { DateInput };
