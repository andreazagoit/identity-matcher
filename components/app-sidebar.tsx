"use client"

import {
    GalleryVerticalEnd,
    LayoutDashboard,
    LifeBuoy,
    ShieldCheck,
    Settings,
    User,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { NavUser } from "@/components/nav-user"
import { NavSecondary } from "@/components/nav-secondary"

interface Session {
    user: {
        name?: string;
        email?: string;
        image?: string;
    } | null;
}

export function AppSidebar({ session, ...props }: { session: Session | null } & React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const params = useParams()
    const clientId = params.clientId as string

    const navItems = [
        {
            title: "Overview",
            url: `/dashboard/${clientId}`,
            icon: LayoutDashboard,
        },
        {
            title: "Users",
            url: `/dashboard/${clientId}/users`,
            icon: User,
        },
        {
            title: "Settings",
            url: `/dashboard/${clientId}/settings`,
            icon: Settings,
        },
    ]

    const navSecondary = [
        {
            title: "Torna alla lista",
            url: "/dashboard",
            icon: ShieldCheck,
        },
        {
            title: "Supporto",
            url: "#",
            icon: LifeBuoy,
        },
    ]

    // Adapt fetched user to NavUser expected format
    const navUser = session?.user ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "",
    } : { name: "Guest", email: "", avatar: "" }

    return (
        <Sidebar variant="sidebar" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Identity Matcher</span>
                                    <span className="">v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Client Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter className="pt-0">
                <NavUser user={navUser} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
