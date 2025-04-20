"use client";

import clsx from "clsx";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    TwitterIcon,
    GithubIcon,
    DiscordIcon,
    HeartFilledIcon,
    SearchIcon,
    Logo,
} from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarBrand,
    NavbarItem,
    NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import { authClient } from "@/lib/auth-client";
import { addToast } from "@heroui/toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const Navbar = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await authClient.signOut();
            addToast({
                title: "Logged out",
                description: "You have been successfully logged out",
                variant: "flat",
                color: "default"
            });
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
            addToast({
                title: "Error",
                description: "Failed to log out. Please try again.",
                variant: "flat",
                color: "danger"
            });
        }
    };

    // const searchInput = (
    //     <Input
    //         aria-label="Search"
    //         classNames={{
    //             input: "text-sm",
    //             inputWrapper: "bg-default-100",
    //         }}
    //         endContent={
    //             <Kbd className="hidden lg:inline-block" keys={["command"]}>
    //                 K
    //             </Kbd>
    //         }
    //         labelPlacement="outside"
    //         placeholder="Search..."
    //         startContent={
    //             <SearchIcon className="pointer-events-none shrink-0 text-base text-default-400" />
    //         }
    //         type="search"
    //     />
    // );

    return (
        <HeroUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="max-w-fit gap-3">
                    <NextLink
                        className="flex items-center justify-start gap-1"
                        href="/"
                    >
                        <Logo />
                        <p className="font-bold text-inherit">ACME</p>
                    </NextLink>
                </NavbarBrand>
                <ul className="ml-2 hidden justify-start gap-4 lg:flex">
                    {siteConfig.navItems.map((item) => (
                        <NavbarItem key={item.href}>
                            <NextLink
                                className={clsx(
                                    linkStyles({ color: "foreground" }),
                                    "data-[active=true]:font-medium data-[active=true]:text-primary",
                                )}
                                color="foreground"
                                href={item.href}
                            >
                                {item.label}
                            </NextLink>
                        </NavbarItem>
                    ))}
                </ul>
            </NavbarContent>

            <NavbarContent
                className="hidden basis-1/5 sm:flex sm:basis-full"
                justify="end"
            >
                <NavbarItem className="hidden gap-2 sm:flex">
                    <Link
                        isExternal
                        aria-label="Twitter"
                        href={siteConfig.links.twitter}
                    >
                        <TwitterIcon className="text-default-500" />
                    </Link>
                    <Link
                        isExternal
                        aria-label="Discord"
                        href={siteConfig.links.discord}
                    >
                        <DiscordIcon className="text-default-500" />
                    </Link>
                    <Link
                        isExternal
                        aria-label="Github"
                        href={siteConfig.links.github}
                    >
                        <GithubIcon className="text-default-500" />
                    </Link>
                    <ThemeSwitch />
                </NavbarItem>
                {/* <NavbarItem className="hidden lg:flex">
                    {searchInput}
                </NavbarItem> */}
                
                {mounted && !isPending && (
                    <>
                        {session ? (
                            <>
                                <NavbarItem>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name || session.user.email}`} 
                                                alt={session.user.name || "User"}
                                            />
                                            <AvatarFallback>
                                                {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm hidden md:block">
                                            {session.user.name || session.user.email}
                                        </span>
                                    </div>
                                </NavbarItem>
                                <NavbarItem>
                                    <Button
                                        onClick={handleLogout}
                                        className="text-sm font-normal"
                                        variant="flat"
                                        color="danger"
                                    >
                                        Log Out
                                    </Button>
                                </NavbarItem>
                            </>
                        ) : (
                            <>
                                <NavbarItem>
                                    <Button
                                        as={Link}
                                        href="/auth/login"
                                        className="text-sm font-normal"
                                        variant="flat"
                                    >
                                        Login
                                    </Button>
                                </NavbarItem>
                                <NavbarItem>
                                    <Button
                                        as={Link}
                                        href="/auth/register"
                                        className="text-sm font-normal"
                                    >
                                        Sign Up
                                    </Button>
                                </NavbarItem>
                            </>
                        )}
                    </>
                )}
                
                <NavbarItem className="hidden md:flex">
                    <Button
                        isExternal
                        as={Link}
                        className="bg-default-100 text-sm font-normal text-default-600"
                        href={siteConfig.links.sponsor}
                        startContent={
                            <HeartFilledIcon className="text-danger" />
                        }
                        variant="flat"
                    >
                        Sponsor
                    </Button>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent className="basis-1 pl-4 sm:hidden" justify="end">
                <Link
                    isExternal
                    aria-label="Github"
                    href={siteConfig.links.github}
                >
                    <GithubIcon className="text-default-500" />
                </Link>
                <ThemeSwitch />
                <NavbarMenuToggle />
            </NavbarContent>

            <NavbarMenu>
                {/* {searchInput} */}
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {mounted && !isPending && session && (
                        <div className="flex items-center gap-2 py-2 mb-4 border-b">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name || session.user.email}`} 
                                    alt={session.user.name || "User"}
                                />
                                <AvatarFallback>
                                    {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{session.user.name || session.user.email}</p>
                                {session.user.email && (
                                    <p className="text-xs text-default-500">{session.user.email}</p>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {siteConfig.navMenuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <Link
                                color={
                                    index === 2
                                        ? "primary"
                                        : index ===
                                            siteConfig.navMenuItems.length - 1
                                          ? "danger"
                                          : "foreground"
                                }
                                href="#"
                                size="lg"
                            >
                                {item.label}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                    
                    {mounted && !isPending && (
                        <div className="mt-4 pt-4 border-t">
                            {session ? (
                                <Button
                                    onClick={handleLogout}
                                    className="w-full"
                                    color="danger"
                                >
                                    Log Out
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button
                                        as={Link}
                                        href="/auth/login"
                                        className="w-full"
                                        variant="flat"
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        as={Link}
                                        href="/auth/register"
                                        className="w-full"
                                    >
                                        Sign Up
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    );
};
