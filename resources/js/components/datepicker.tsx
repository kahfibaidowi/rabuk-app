"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DatePicker(props) {
    const [open, setOpen]=React.useState(false)

    return (
        <DropdownMenu open={open}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !props.date && "text-muted-foreground",
                        props.className
                    )}
                    onClick={e=>setOpen(true)}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {props.date ? format(props.date, "PPP") : <span>{props.placeholder}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto p-0 z-50" align="start" onInteractOutside={e=>setOpen(false)}>
                <Calendar
                    mode="single"
                    selected={props.date}
                    onSelect={date=>{
                        props.setDate(date)
                        setOpen(false)
                    }}
                    initialFocus
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}