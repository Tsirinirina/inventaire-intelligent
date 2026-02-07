import { z } from "zod";

export const loginSchema = z.object({
  name: z.string().min(1, "Le nom du vendeur est requis"),
  passcode: z.string().min(1, "Le code secret est requis"),
});

export type LoginForm = {
  name: string;
  passcode: string;
};

export const loginFormDefaultValues: LoginForm = {
  name: "",
  passcode: "",
};
