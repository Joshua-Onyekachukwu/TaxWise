"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/dashboard"); // Redirect to dashboard after login
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="rounded-[25px] order-2 lg:order-1 relative w-full aspect-[646/804]">
              <Image
                src="/images/sign-in.jpg"
                alt="sign-in-image"
                className="rounded-[25px] object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <Link href="/" className="inline-block mb-[20px]">
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  Taxwise<span className="text-purple-600">.</span>
                </h1>
              </Link>

              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[7px]">
                  Welcome back!
                </h1>
                <p className="font-medium lg:text-md text-[#445164] dark:text-gray-400">
                  Sign In with your email or social account
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between mb-[20px] md:mb-[23px] gap-[12px]">
                <div className="grow">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center justify-center gap-3 w-full rounded-md transition-all py-[12px] px-[25px] text-black dark:text-white border border-[#D6DAE1] bg-white dark:bg-[#0a0e19] dark:border-[#172036] shadow-sm hover:border-purple-500 hover:shadow-md font-medium"
                  >
                    <Image
                      src="/images/icons/google.svg"
                      alt="google"
                      width={20}
                      height={20}
                    />
                    <span>Continue with Google</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignIn}>
                <div className="mb-[15px] relative">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500"
                    placeholder="example@taxwise.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-[15px] relative">
                  <label className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block">
                    Password
                  </label>
                  <input
                    type="password"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500"
                    placeholder="Type password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Link
                  href="/auth/forgot-password"
                  className="inline-block text-purple-500 transition-all font-semibold hover:underline"
                >
                  Forgot Password?
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="md:text-md block w-full text-center transition-all rounded-md font-medium mt-[20px] md:mt-[25px] py-[12px] px-[25px] text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-[5px]">
                    {loading ? "Signing In..." : "Sign In"}
                  </span>
                </button>
              </form>

              <p className="mt-[15px] md:mt-[20px]">
                Don’t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-purple-500 transition-all font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
