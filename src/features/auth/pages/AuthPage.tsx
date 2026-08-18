import {
    CheckCircleFilled,
    LockOutlined,
    SafetyCertificateFilled,
    SendOutlined,
    ThunderboltFilled,
    UserOutlined,
    WhatsAppOutlined,
} from "@ant-design/icons";
import { useCallOtp } from "@/features/auth/hooks/useCallOtp";
import { useCreateProfile } from "@/features/auth/hooks/useCreateProfile";
import { useVerifyOtp } from "@/features/auth/hooks/useVerifyOtp";
import { useStoreToken } from "@/store/zustand/token/useStoreToken";
import { useStoreBascData } from "@/store/zustand/user/useStoreBascData";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Gender = "male" | "female" | "other";

interface ApiError extends Error {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const STEPS = [
    { key: "phone", label: "Phone" },
    { key: "otp", label: "Verify OTP" },
    { key: "profile", label: "Profile" },
];

const FEATURES = [
    {
        icon: <SendOutlined />,
        title: "Bulk WhatsApp Messaging",
        desc: "Campaigns, templates and scheduled sends — all in one place.",
    },
    {
        icon: <ThunderboltFilled />,
        title: "Developer API",
        desc: "Send messages from Postman or any app with a simple REST API.",
    },
    {
        icon: <SafetyCertificateFilled />,
        title: "Secure & Reliable",
        desc: "OTP-based login keeps your WhatsApp account protected.",
    },
];

function AuthPage() {
    const [phone, setPhone] = useState("");
    const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

    const [fullName, setFullName] = useState("");
    const [gender, setGender] = useState<Gender>("male");
    const [age, setAge] = useState("");

    const { mutate: sendOtp, isPending } = useCallOtp();
    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
    const { mutate: createProfile, isPending: isCreatingProfile } =
        useCreateProfile();
    const navigate = useNavigate();

    useEffect(() => {
        if (step === "otp") {
            otpRefs.current[0]?.focus();
        }
    }, [step]);

    const currentStepIndex = STEPS.findIndex((s) => s.key === step);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!/^[0-9]{10}$/.test(phone)) {
            toast.error("Please enter a valid 10-digit WhatsApp number");
            return;
        }

        sendOtp(
            { phone },
            {
                onSuccess: () => {
                    toast.success("OTP sent successfully");
                    setOtp(Array(6).fill(""));
                    setStep("otp");
                },
                onError: (error: ApiError) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to send OTP. Please try again.",
                    );
                },
            },
        );
    };

    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pasted) return;

        const newOtp = Array(6).fill("");
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setOtp(newOtp);

        const focusIndex = Math.min(pasted.length, 5);
        otpRefs.current[focusIndex]?.focus();
    };

    const setToken = useStoreToken((state) => state.setToken);

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();

        const otpString = otp.join("");

        if (otpString.length !== 6) {
            toast.error("Please enter 6 digit OTP");
            return;
        }

        verifyOtp(
            { phone, otp: otpString },
            {
                onSuccess: (data) => {
                    if (!data?.token) {
                        toast.error("Token not received. Please login again.");
                        return;
                    }

                    setToken(data.token);
                    toast.success("OTP verified successfully");

                    if (data?.isExistingUser === true && data?.data) {
                        setUser(data.data);
                        navigate("/", { replace: true });
                        return;
                    }

                    if (data?.isExistingUser === false) {
                        setStep("profile");
                    }
                },
                onError: (error: ApiError) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Invalid OTP. Please try again.",
                    );
                },
            },
        );
    };

    const setUser = useStoreBascData((state) => state.setUser);

    const handleCreateProfile = (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) {
            toast.error("Please enter your full name");
            return;
        }

        const ageNumber = Number(age);
        if (!age || isNaN(ageNumber) || ageNumber <= 0) {
            toast.error("Please enter a valid age");
            return;
        }

        createProfile(
            {
                fullName: fullName.trim(),
                gender,
                age: ageNumber,
            },
            {
                onSuccess: (data) => {
                    if (!data?.data) {
                        toast.error("Profile data not received");
                        return;
                    }

                    setUser(data.data);
                    toast.success("Profile created successfully");
                    navigate("/", { replace: true });
                },
                onError: (error: ApiError) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to create profile. Please try again.",
                    );
                },
            },
        );
    };

    const inputClass =
        "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30";
    const primaryBtnClass =
        "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            {/* ==================== LEFT BRAND PANEL ==================== */}
            <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
                {/* decorative circles */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-teal-400/20 blur-2xl" />

                <div className="relative flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl text-white backdrop-blur">
                        <WhatsAppOutlined />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">
                            WhatsApp Services
                        </h1>
                        <p className="text-xs text-emerald-100/80">
                            Messaging Platform
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <h2 className="text-4xl font-bold leading-tight text-white">
                        Send messages.
                        <br />
                        Build campaigns.
                        <br />
                        <span className="text-emerald-300">
                            Grow your business.
                        </span>
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-100/80">
                        One platform for WhatsApp bulk messaging, reusable
                        templates, scheduled campaigns and developer APIs.
                    </p>

                    <div className="mt-10 space-y-5">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg text-emerald-200 backdrop-blur">
                                    {f.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {f.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-emerald-100/70">
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative flex items-center gap-6 text-xs text-emerald-100/70">
                    <span className="flex items-center gap-1.5">
                        <CheckCircleFilled className="text-emerald-300" />
                        Secure OTP login
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircleFilled className="text-emerald-300" />
                        Data stays safe
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircleFilled className="text-emerald-300" />
                        24/7 API access
                    </span>
                </div>
            </div>

            {/* ==================== RIGHT FORM PANEL ==================== */}
            <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
                <div className="w-full max-w-md">
                    {/* mobile brand */}
                    <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-xl text-white shadow-lg shadow-emerald-500/30">
                            <WhatsAppOutlined />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-gray-900">
                                WhatsApp Services
                            </h1>
                            <p className="text-[11px] text-gray-400">
                                Messaging Platform
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/60">
                        {/* step indicator */}
                        <div className="mb-8 flex items-center gap-2">
                            {STEPS.map((s, i) => (
                                <div key={s.key} className="flex flex-1 items-center gap-2">
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                            i < currentStepIndex
                                                ? "bg-emerald-500 text-white"
                                                : i === currentStepIndex
                                                  ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500"
                                                  : "bg-gray-100 text-gray-400"
                                        }`}
                                    >
                                        {i < currentStepIndex ? (
                                            <CheckCircleFilled />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    <span
                                        className={`hidden text-xs font-medium sm:block ${
                                            i <= currentStepIndex
                                                ? "text-gray-800"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {s.label}
                                    </span>
                                    {i < STEPS.length - 1 && (
                                        <div
                                            className={`h-0.5 flex-1 rounded-full ${
                                                i < currentStepIndex
                                                    ? "bg-emerald-500"
                                                    : "bg-gray-100"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {step === "phone" ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Welcome back
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Enter your WhatsApp number to get started.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        WhatsApp Number
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-gray-400">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                );
                                                if (value.length <= 10) {
                                                    setPhone(value);
                                                }
                                            }}
                                            placeholder="9876543210"
                                            maxLength={10}
                                            disabled={isPending}
                                            className={`${inputClass} pl-12`}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className={primaryBtnClass}
                                >
                                    <SendOutlined />
                                    {isPending
                                        ? "Sending OTP..."
                                        : "Send OTP"}
                                </button>

                                <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-gray-400">
                                    <LockOutlined className="text-emerald-500" />
                                    We will send a one-time password to this
                                    number.
                                </p>
                            </form>
                        ) : step === "otp" ? (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600">
                                        <LockOutlined />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Enter OTP
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        We sent a 6-digit code to{" "}
                                        <span className="font-semibold text-gray-800">
                                            +91 {phone}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => {
                                                otpRefs.current[index] = el;
                                            }}
                                            value={digit}
                                            onChange={(e) =>
                                                handleOtpChange(index, e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                handleOtpKeyDown(index, e)
                                            }
                                            onPaste={handleOtpPaste}
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={1}
                                            disabled={isVerifying}
                                            className="h-14 w-12 rounded-xl border border-gray-200 bg-gray-50 text-center text-xl font-semibold text-gray-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className={primaryBtnClass}
                                >
                                    {isVerifying
                                        ? "Verifying..."
                                        : "Verify OTP"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("phone");
                                        setOtp(Array(6).fill(""));
                                    }}
                                    disabled={isVerifying}
                                    className="block w-full cursor-pointer text-center text-sm font-medium text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Change number
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleCreateProfile} className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Create your profile
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Complete your details to get started.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) =>
                                                setFullName(e.target.value)
                                            }
                                            placeholder="Enter your full name"
                                            disabled={isCreatingProfile}
                                            className={`${inputClass} pl-11`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Gender
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["male", "female", "other"] as Gender[]).map(
                                            (g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setGender(g)}
                                                    disabled={isCreatingProfile}
                                                    className={`cursor-pointer rounded-xl border py-2.5 text-sm font-medium capitalize transition-all disabled:opacity-50 ${
                                                        gender === g
                                                            ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                                                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-400"
                                                    }`}
                                                >
                                                    {g}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(
                                                /\D/g,
                                                "",
                                            );
                                            if (value.length <= 3) {
                                                setAge(value);
                                            }
                                        }}
                                        placeholder="Enter your age"
                                        min={1}
                                        max={120}
                                        disabled={isCreatingProfile}
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreatingProfile}
                                    className={primaryBtnClass}
                                >
                                    {isCreatingProfile
                                        ? "Creating..."
                                        : "Create Profile"}
                                </button>
                            </form>
                        )}
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        Protected by OTP verification — your data stays secure.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
