"use client"

import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/icons"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function DiscordAuthButton() {
    const handleDiscordLogin = async () => {
        authClient.signIn.social({
            provider: "discord",
        })
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