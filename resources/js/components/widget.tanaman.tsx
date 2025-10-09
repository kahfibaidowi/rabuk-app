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
import { ArrowRight, BadgeAlertIcon, BadgeCheckIcon, ChevronLeft, ChevronLeftIcon, ChevronRightIcon, ChevronsLeft, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Link } from '@inertiajs/react'
import { Badge } from './ui/badge'

const WidgetTanaman=(props)=>{

    return (
        <div className="w-full lg:w-1/2 xl:w-1/3 px-3 py-3">
            <div className="flex flex-col md:flex-row items-center bg-white dark:bg-sidebar rounded-2xl shadow-sm">
                <div className="flex flex-col items-center w-full h-full bg-gradient-to-b from-green-400 to-emerald-100 dark:from-green-800 dark:to-emerald-700 rounded-t-xl md:rounded-l-xl md:rounded-t-none md:min-h-72 md:w-48">
                    <div className="w-28 h-28 my-5 rounded-full overflow-hidden xl:w-32 xl:h-32">
                        <img src={props.data.icon}/>
                    </div>
                    <Link 
                        href={`/dashboard/lahan/detail/${props.data.id}`}
                        className='font-bold text-xl mb-5 px-4 text-center'
                    >
                        {props.data.nama_lahan}
                    </Link>
                    {props.data.modbus_status=="connected"?
                        <Badge variant="secondary" className='bg-green-300 dark:bg-green-600 text-primary rounded-full'>
                            <BadgeCheckIcon/> Connected
                        </Badge>
                    :
                        <Badge variant="destructive" className='bg-red-300 dark:bg-red-600 text-primary rounded-full'>
                            <BadgeAlertIcon/> Not Connected
                        </Badge>
                    }
                </div>
                <div className="grow px-5 py-0 w-full md:w-auto">
                    <div className="relative flex items-center justify-between">
                        <span className="block text-gray-500 mb-6 mr-1">Analisis Tanah</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="absolute right-0 -top-3 size-8">
                                    <Ellipsis/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40" align="start">
                                <DropdownMenuItem onClick={()=>props.editAction()}>
                                    <Edit2/>
                                    Edit Data
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={()=>props.deleteAction()}>
                                    <Trash2/>
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span>Soil Nitrogen</span>
                            <span className="ml-1">?</span>
                        </div>
                        <div className="flex items-center">
                            <div className="grow bg-accent rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{width:"0%"}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span>Soil Phosfor</span>
                            <span className="ml-1">?</span>
                        </div>
                        <div className="flex items-center">
                            <div className="grow bg-accent rounded-full h-1.5">
                                <div className="bg-purple-600 h-1.5 rounded-full" style={{width:"0%"}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span>Soil Calium</span>
                            <span className="ml-1">?</span>
                        </div>
                        <div className="flex items-center">
                            <div className="grow bg-accent rounded-full h-1.5">
                                <div className="bg-gradient-to-r from-emerald-600 to-green-300 h-1.5 rounded-full" style={{width:"0%"}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex mt-8">
                        <Link 
                            href={`/?lahan_id=${props.data.id}`}
                            className="text-base flex items-center text-gray-500"
                        >
                            More Detail
                            <ArrowRight size="17" className="ml-1"/>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WidgetTanaman