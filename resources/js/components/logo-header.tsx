import * as React from "react"
import { Check, ChevronsUpDown, GalleryVerticalEnd, Moon, Plus, Settings2, Sun } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAppearance } from "@/hooks/use-appearance"

export function LogoHeader() {
  const { isMobile } = useSidebar()

  const {appearance, updateAppearance}=useAppearance()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground dark:text-gray-900 flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Rabuk Apps</span>
                <span className="truncate text-xs">...</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Appearance
            </DropdownMenuLabel>
            <DropdownMenuItem
                className="gap-2 p-1.5"
                onClick={()=>updateAppearance("light")}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Sun className="size-3.5 shrink-0" />
                </div>
                Light
                {appearance=="light"&&<DropdownMenuShortcut><Check className="text-green-800"/></DropdownMenuShortcut>}
            </DropdownMenuItem>
            <DropdownMenuItem
                className="gap-2 p-1.5"
                onClick={()=>updateAppearance("dark")}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Moon className="size-3.5 shrink-0" />
                </div>
                Dark
                {appearance=="dark"&&<DropdownMenuShortcut><Check className="text-green-800"/></DropdownMenuShortcut>}
            </DropdownMenuItem>
            <DropdownMenuItem
                className="gap-2 p-1.5"
                onClick={()=>updateAppearance("system")}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Settings2 className="size-3.5 shrink-0" />
                </div>
                System
                {appearance=="system"&&<DropdownMenuShortcut><Check className="text-green-800"/></DropdownMenuShortcut>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
