import React, { useState } from 'react'
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AlertCircle, ArrowRight, ChevronLeft, ChevronLeftIcon, ChevronRightIcon, ChevronsLeft, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Link } from '@inertiajs/react'
import GaugeChart from 'react-gauge-chart'
import { cn } from '@/lib/utils'

const WidgetGaugeTanah=(props)=>{

    return (
        <div className='w-full md:w-1/2 xl:w-1/3 2xl:w-1/4 px-3 py-3'>
            <div className='bg-white dark:bg-sidebar p-5 rounded-xl shadow-sm'>
                <div className='flex items-center justify-between mb-5'>
                    <h3 className='text-muted-foreground'>{props.title}</h3>
                    <span className=''><AlertCircle/></span>
                </div>
                <div className='flex items-center mb-8'>
                    <div className='mr-3'>
                        <div 
                            className={cn('flex items-center justify-center w-20 h-16 rounded-2xl', {
                                "bg-red-500":props.data.color=="red",
                                "bg-green-800":props.data.color=="green",
                                "bg-green-400":props.data.color=="green1",
                                "bg-yellow-500":props.data.color=="yellow"
                            })}
                        >
                            <span className='text-2xl font-bold text-white'>{Math.max(0, props.data.value).toFixed(2)*1}</span>
                        </div>
                    </div>
                    <div className='relative ml-auto'>
                        <GaugeChart 
                            id={`gauge-chart-${props.data.type}`} 
                            nrOfLevels={12} 
                            colors={["#26B50C", "#75FF79", "#DEF33A", "#D80606"]} 
                            arcWidth={0.3} 
                            percent={props.data.percent} 
                            arcPadding={0.03}
                            cornerRadius={3}
                            hideText
                        />
                    </div>
                </div>
                <div className='mt-5 mb-5'>
                    <div className='w-full h-1 bg-gradient-to-r from-green-800 from-0% via-yellow-200 via-50% to-rose-800 to-100%'></div>
                </div>
            </div>
        </div>
    )
}

export default WidgetGaugeTanah