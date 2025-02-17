import React, { useState , useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/schema/loginSchema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signUp } from "@/schema/signUpSchema";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import axios from "axios";
import { apiVerify } from "@/schema/apiSchema";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";


const SignUpForm = () => {
  const navigate = useNavigate();
  const [loading, setloading] = useState(false)
  const [data, setdata] = useState({});
  const [Otp, setOtp] = useState("");
  const [isOpen, setisOpen] = useState(false);
  const [errors, seterrors] = useState({});
  const { handleSubmit, register, watch } = useForm();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const onSubmit = async (data) => {

    if (data.password !== data.confirmPassword) {
      seterrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const result = signUp.safeParse(data);
    if (!result.success) {
      const fieldError = result.error.formErrors.fieldErrors;
      seterrors(fieldError);
      return;
    }
    setdata(data);
    seterrors({});

    try {
      setloading(true)
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/signin`,
        data
      );
      setloading(false)
      if (!apiVerify(res)) {
        toast.warning("Api Error , Please contact admin");
        return;
      }
      toast.success(res.data.message);
      setisOpen(true);
    } catch (error) {
      setloading(false)
      const { response } = error;
      if (!response) {
        toast.error("Database connection error");
        return;
      }
      if (!apiVerify(response)) {
        toast.warning("Api Error , Please contact admin");
        return;
      }
      toast.error(response.data.message);
    }
  };

  const resendOtp = async () => {
    try {
      setResendDisabled(true);
      setTimer(30);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/resendOtp`,
        {
          username: data.username,
        }
      );
      if (!apiVerify(res)) {
        toast.warning("API Error, Please contact admin");
        return;
      }
      toast.success("OTP Resent Successfully");
  
    } catch (error) {
      const { response } = error;
      if (!response) {
        toast.error("Database connection error");
        return;
      }
      if (!apiVerify(response)) {
        toast.warning("API Error, Please contact admin");
        return;
      }
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    } else {
      setResendDisabled(false);
    }
  }, [timer]);


  const getOtp = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/signin/verifyOtp`,
        {
          otp: Otp,
          username: data.username,
        }
      );
      if (!apiVerify(res)) {
        toast.warning("Api Error , Please contact admin");
        return;
      }
      setisOpen(false);
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      const { response } = error;
      if (!response) {
        toast.error("Database connection error");
        return;
      }
      if (!apiVerify(response)) {
        toast.warning("Api Error , Please contact admin");
        return;
      }
      toast.error(response.data.message);
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold ">Sign Up</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex justify-around self-start gap-8 w-2/3 mt-2 flex-col"
      >
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col">
            <Input
              style="custom"
              placeholder="Name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <span className="text-red-600 text-sm self-center">
                *{errors.firstName}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <Input
              style="custom"
              placeholder="Middle Name"
              {...register("middleName")}
            />
            {errors.middleName && (
              <span className="text-red-600 text-sm self-center">
                *{errors.middleName}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <Input
              style="custom"
              placeholder="Last Name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <span className="text-red-600 text-sm self-center">
                *{errors.lastName}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row  gap-6">
          <div className="flex flex-col">
            <Input
              style="custom"
              type="email"
              placeholder="Email"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-red-600 text-sm self-center">
                *{errors.email}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <Input
              style="custom"
              type="text"
              placeholder="Username"
              {...register("username")}
            />
            {errors.username && (
              <span className="text-red-600 text-sm self-center">
                *{errors.username}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <Input style="custom" placeholder="Position" {...register("position")} />
            {errors.position && (
              <span className="text-red-600 text-sm self-center">
                *{errors.position}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row  gap-6">
          <div className="flex flex-col">
            <Input style="custom" placeholder="City" {...register("city")} />
            {errors.city && (
              <span className="text-red-600 text-sm self-center">
                *{errors.city}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <Input style="custom" placeholder="State" {...register("state")} />
            {errors.state && (
              <span className="text-red-600 text-sm self-center">
                *{errors.state}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <Input
              style="custom"
              placeholder="Country"
              {...register("country")}
            />
            {errors.country && (
              <span className="text-red-600 text-sm self-center">
                *{errors.country}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row  gap-6 self-start">
          <div className="flex flex-col">
            <Input
              style="custom"
              type="password"
              placeholder="Set Password"
              {...register("password")}
            />
            {errors.password && (
              <span className="text-red-600 text-sm self-center">
                *{errors.password}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <Input
              style="custom"
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span className="text-red-600 text-sm self-center">
                *{errors.confirmPassword}
              </span>
            )}
          </div>
        </div>
        {loading ? (
          <Button disabled={true} className="dark font-bold text-lg"><Loader className="animate-spin mr-2"/>Please Wait</Button>
        ) : (
          <Button type="submit" className="dark font-bold text-lg">
            SignUp
          </Button>
        )}
      </form>

      {isOpen && (
        <Dialog open={isOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>OTP Verification</DialogTitle>
              <DialogDescription className="flex flex-col gap-4 py-4 items-center">
                <Input
                  type="number"
                  className="w-1/2 self-center"
                  placeholder="OTP"
                  value={Otp}
                  onChange={(event) => {
                    setOtp(event.target.value);
                  }}
                />
                <Button onClick={getOtp} className="w-1/2">
                  Verify
                </Button>
                <div className="flex items-center">
                  <p>Didn't Recieve OTP </p>
                  <div className="mx-3">
                  <button
                    onClick={resendOtp}
                    disabled={resendDisabled}
                    variant="link"
                  >
                    {resendDisabled ? `Resend OTP (${timer}s)` : "Resend OTP"}
                  </button>
                  </div>
                  
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const LoginForm = () => {
  const { handleSubmit, register } = useForm();
  const [errors, seterrors] = useState({});
  const onSubmit = async (data) => {
    const result = login.safeParse(data);
    if (!result.success) {
      const fieldError = result.error.formErrors.fieldErrors;
      seterrors(fieldError);
      return;
    }
    seterrors({});
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        data
      );
      if (!apiVerify(res)) {
        toast.warning("Api Error , Please contact admin");
        return;
      }
      toast.success(res.data.message);
    } catch (error) {
      const { response } = error;
      if (!response) {
        toast.error("Database connection error");
        return;
      }
      if (!apiVerify(response)) {
        toast.warning("Api Error , Please contact admin");
        return;
      }
      toast.error(response.data.message);
    }
  };
  return (
    <div className="flex flex-col self-center">
      <Sheet>
        <p className="text-lg">
          Already have an account ?
          <SheetTrigger>
            <Button className="text-white font-bold text-lg" variant="link">
              Login
            </Button>
          </SheetTrigger>
        </p>
        <SheetContent side="bottom">
          <SheetHeader className="flex flex-col mx-auto items-center justify-center w-[80%] sm:w-1/3 my-10  gap-5">
            <SheetTitle>
              <p className="text-3xl">Login</p>
            </SheetTitle>
            <SheetDescription className="w-full">
              <form
                className="flex flex-col w-full gap-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Input placeholder="Username" {...register("username")} />
                {errors.username && (
                  <span className="text-red-600 text-sm self-center">
                    *{errors.username}
                  </span>
                )}
                <Input placeholder="Password" {...register("password")} />
                {errors.password && (
                  <span className="text-red-600 text-sm self-center">
                    *{errors.password}
                  </span>
                )}
                <Button type="submit">Login</Button>
              </form>
              <Link to="/forgot-password">
                <Button variant="link">Forgot Password ?</Button>
              </Link>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const Signup = () => {
  return (
    <div className="h-fit px-16 py-10 w-full pt-[100px] min-h-screen bg-[#151515] text-white flex flex-col gap-10">
      <SignUpForm />
      <LoginForm />
    </div>
  );
};

export default Signup;
