import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownField({
  label,
  value,
  options = [],
  isEditing = false,
  onChange,
  placeholder = "Select an option",
  className = "",
  buttonClassName = "min-w-[160px] justify-between",
}) {
  if (!isEditing) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary">{value || "--"}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={buttonClassName}>
            {value || placeholder}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
