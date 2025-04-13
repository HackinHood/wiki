"use client"

import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/icons"
import { useRouter } from "next/navigation"

export function DiscordAuthButton() {
    const router = useRouter()

    const handleDiscordLogin = async () => {
        try {
            router.push("/api/auth/oauth/discord")
        } catch (error) {
            console.error("Discord login error:", error)
        }
    }

    return (
        <Button 
            onClick={handleDiscordLogin}
            variant="outline" 
            className="w-full flex items-center justify-center bg-[#5865F2] text-white hover:bg-[#4752c4] hover:text-white border-[#5865F2]"
        >
            <DiscordIcon className="mr-2" />
            Continue with Discord
        </Button>
    )
} 