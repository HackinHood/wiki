"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { addToast } from "@heroui/toast"

export default function DiscordCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const code = searchParams.get("code")

    useEffect(() => {
        const handleCallback = async () => {
            if (error) {
                addToast({
                    title: "Authentication Error",
                    description: error || "Failed to authenticate with Discord",
                    variant: "flat",
                    color: "danger"
                })
                router.push("/auth/login")
                return
            }

            if (!code) {
                router.push("/auth/login")
                return
            }
            
            try {
                // The better-auth library handles the code exchange automatically
                // We just need to redirect to the home page
                router.push("/")
            } catch (error) {
                console.error("Error during Discord authentication:", error)
                addToast({
                    title: "Authentication Error",
                    description: "Failed to complete Discord authentication",
                    variant: "flat",
                    color: "danger"
                })
                router.push("/auth/login")
            }
        }

        handleCallback()
    }, [code, error, router])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Authenticating with Discord...</h1>
                <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
            </div>
        </div>
    )
} 