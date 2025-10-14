import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ChartLine,
  Command,
  Frame,
  GalleryVerticalEnd,
  Grid2X2CheckIcon,
  LampFloor,
  LayoutDashboard,
  Map,
  PieChart,
  Plus,
  PlusSquare,
  Settings,
  Settings2,
  Sprout,
  SquareTerminal,
  TimerReset
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePage } from "@inertiajs/react"
import { LogoHeader } from "./logo-header"
import _ from "underscore"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const auth=usePage().props.auth
  // const user={
  //   name:auth.user.name,
  //   email:auth.user.email,
  //   avatar:auth.user.avatar_url
  // }
  const page_props=usePage().props

  const data = {
    navMain: [
      {
        title: "Infografis",
        url: `/${page_props.lahan_id!=''?'?lahan_id='+page_props.lahan_id:''}`,
        icon: ChartLine
      },
      {
        title: "AI Recomendation",
        url: `/ai_recomendation${page_props.lahan_id!=''?'?lahan_id='+page_props.lahan_id:''}`,
        icon: Sprout
      }
    ],
    navAction:[
      {
          title: "Data Lahan",
          url: "/lahan",
          icon: Grid2X2CheckIcon
      },
      {
          title: "Tambah Lahan",
          url: "/lahan/add",
          icon: PlusSquare
      },
      {
          title: "Pengaturan",
          url: "/pengaturan",
          icon: Settings
      },
      // {
      //     title: "Periksa Tanaman",
      //     url: `/lahan/cek_tanaman${page_props.lahan_id!=''?'?lahan_id='+page_props.lahan_id:''}`,
      //     icon: LampFloor
      // }
    ]
  }

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar z-50">
      <SidebarHeader>
        <LogoHeader/>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} title="Main Menu" />
        <NavMain items={data.navAction} title="Actions" />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}
