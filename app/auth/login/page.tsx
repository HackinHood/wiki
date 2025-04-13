"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DiscordAuthButton } from "@/components/discord-auth-button";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { error, data, isPending } = authClient.useSession();

    useEffect(() => {
        if (!error && !isPending && data) {
            router.push("/"); // Redirect to home if authenticated
        }
    }, [error, isPending, data, router]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await authClient.signIn.email({
                email,
                password,
            });

            if (response.data && !response.error) {
                router.push("/"); // Redirect to home after successful login
                router.refresh(); // Refresh to update UI with authenticated state
            } else {
                addToast({
                    title:
                        response.error.message ||
                        "Login failed. Please try again.",
                    variant: "flat",
                    color: "danger",
                });
            }
        } catch (err) {
            console.error("Login error:", err);
            addToast({
                title: "An unexpected error occurred. Please try again.",
                variant: "flat",
                color: "danger",
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Login to Your Account
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <Form onSubmit={handleSubmit} className="w-full">
                    <CardContent className="space-y-4 w-full">
                        <div className="space-y-2">
                            <Input
                                variant="bordered"
                                label="Email Address"
                                id="email"
                                type="email"
                                value={email}
                                onValueChange={setEmail}
                                isRequired
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                variant="bordered"
                                label="Password"
                                id="password"
                                type="password"
                                value={password}
                                onValueChange={setPassword}
                                isRequired
                                minLength={10}
                                placeholder="••••••••••"
                                description="Password must be at least 10 characters long"
                            />
                        </div>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <DiscordAuthButton />
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 w-full">
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                        <div className="text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/auth/register"
                                className="text-blue-600 hover:underline"
                            >
                                Register
                            </Link>
                        </div>
                    </CardFooter>
                </Form>
            </Card>
        </div>
    );
}
