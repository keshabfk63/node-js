import z from "zod";
const passwordPattern: RegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W]).*$/;
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be of 3 character")
      .max(50, "Name length cant be 50 character long")
      .nonempty("Name is required")
      .nonoptional("Must fill the na0me"),
    email: z.string().email("Email must be a valid email"),
    phone: z.string().length(10, "phone number must be exactly 10 digits"),
    role: z.enum(["admin", "customer"]).default("customer").optional(),
    address: z
      .string()
      .min(3, "addresss min length is 3")
      .max(100, "address cant be max than 20 characters"),
    password: z
      .string()
      .regex(
        passwordPattern,
        "password must contain special rules(1 lowercase, 1 uppercase , 1 number , 1 special character)",
      )
      .min(8, "password must be min of 8 characters")
      .max(32, "password cant exceed 32 characters"),
    confirmpassword: z.string().nonempty("Confirm password is required"),
    img:z.any().optional(),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message:
      "password do not match, Confirm password must match with password above",
    path: ["confirmpassword"],
  });

export const otpVerify = z.object({
  email: z.string().email("Email must be valid"),
  otp: z  
    .string()
    .length(6, "otp must be of exactly 6 digits")
    .nonempty()
    .nonoptional(),
});
export const LoginValidator = z.object({
  email: z.string().email("Email must be valid"),
  password: z
    .string()
    .min(8, "password must be min of 8 character")
    .max(32, "password should not be 32 character long"),
});

export const productDto = z.object({
  name: z.string().min(3).max(160),
  category: z.string().nonempty().nonoptional(),
  categoryId: z.string().nonempty().nonoptional(),
  description: z.string().nonempty().nonoptional(),
  price: z.coerce.number().nonnegative().nonoptional(),
  discount: z.coerce.number().nullable().default(0),
  brand: z.string().nullable().optional(),
  seller: z.string().nullable().optional(),
  status: z
    .string()
    .regex(/^(active|inactive)$/)
    .default("inactive"),
});

export const categoryDto = z.object({
  name: z.string().min(3).max(160),
  category: z.string().nullable().optional(),
  description: z.string().nonempty().nonoptional(),
  seller: z.string().nullable().optional(),

  status: z
    .string()
    .regex(/^(active|inactive)$/)
    .default("inactive"),
});
