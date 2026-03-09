## 2024-05-24 - Shadcn Tooltips for Icon-only Buttons
**Learning:** Found an accessibility issue pattern specific to this app's components: Icon-only buttons (like the Share2 button in LearningStatsCentral) are sometimes relying only on a native browser `title` or lacking a descriptive label entirely.
**Action:** Always wrap icon-only buttons in the existing `@/components/ui/tooltip` (TooltipProvider > Tooltip > TooltipTrigger > TooltipContent) and ensure an `aria-label` is placed on the trigger `<button>` to provide both visual UX context and screen reader accessibility.
