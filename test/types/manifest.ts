import type {
  CustomElements,
  AuroButton as RootButton,
} from "@aurodesignsystem/auro-button";
import type { AuroButton } from "@aurodesignsystem/auro-button/class";

declare const button: AuroButton;
const element: HTMLElement = button;
button.disabled = true;
button.loading = false;
element.focus();
const rootButton: RootButton = button;
const props: CustomElements["auro-button"] = { disabled: true };
rootButton.shape = "pill";
button.size = "lg";
button.type = "submit";
button.value = "confirm";
button.tIndex = "0";
button.tabindex = "0";
button.buttonHref = "/next";
void props;
// @ts-expect-error The public class must resolve to an actual typed declaration.
button.disabled = "yes";
// @ts-expect-error Lit metadata declares a finite set of shapes.
button.shape = "triangle";
// @ts-expect-error Lit metadata declares a finite set of sizes.
button.size = "huge";
// @ts-expect-error The button type is a literal union.
button.type = "invalid";
// @ts-expect-error href is a string, not any.
button.buttonHref = 42;
