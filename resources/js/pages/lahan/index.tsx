import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {Select as ReactSelect} from "@/components/select-form"
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, Filter, PlusIcon, Trash2 } from "lucide-react"
import { NumericFormat } from 'react-number-format'

import { toast } from "sonner"
import axios from "axios"
import { useState } from "react"
import * as yup from "yup"
import { Formik } from 'formik'
import { lahan_request, modbus_sensor_request } from "@/config/request"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Head, router, usePage } from "@inertiajs/react"
import TableContent from "@/components/widget.table-pagination"
import { queryClient } from '@/Config/query_client'
import { DatePicker } from "@/components/datepicker"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import WidgetTanaman from "@/components/widget.tanaman"
import TanamanPagination from "@/components/widget.tanaman-pagination"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'

const MySwal=withReactContent(swal)


export default function Page() {
    const auth=usePage().props.auth

    const [filter, setFilter]=useState({
        per_page:15,
        last_page:0,
        page:1
    })

    //DATA/MUTATION
    const gets_lahan=useQuery({
        queryKey:["gets_lahan", filter],
        queryFn:async()=>lahan_request.gets(filter),
        initialData:{
            data:[],
            last_page:0,
            first_page:1,
            current_page:1,
            total:0
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false
    })

    //ACTIONS

    return (
        <>
            <Head>
                <title>Data Lahan</title>
            </Head>
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
                        <div className="flex items-center gap-2 px-5">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <h1 className="text-base font-medium">Data Lahan</h1>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-5 pt-0 mt-10">
                        <div className="overflow-hidden mb-5">
                            <Button 
                                size="sm"
                                type="button"
                                onClick={e=>router.visit("/lahan/add")}
                            >
                                <PlusIcon />
                                <span className="hidden lg:inline">Tambah Lahan</span>
                            </Button>
                        </div>

                        <ListTanaman
                            dataSource={gets_lahan}
                            filter={filter}
                            setFilter={setFilter}
                        />

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

const ListTanaman=(props)=>{

    //DATA/MUTATION
    const hapus_data=useMutation({
        mutationFn:(id)=>lahan_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_lahan")
        },
        onError:err=>{
            toast.error("Remove Data Failed!", {position:"bottom-center"})
        }
    })

    return (
        <>
            <TanamanPagination
                dataSource={props.dataSource}
                filter={props.filter}
                setFilter={props.setFilter}
                refreshData={()=>queryClient.refetchQueries("gets_lahan")}
                renderItem={(item)=>(
                    <WidgetTanaman
                        data={item}
                        editAction={()=>router.visit(`/lahan/edit?lahan_id=${item.id}`)}
                        deleteAction={()=>{
                            MySwal.fire({
                                title: "Yakin ingin menghapus data?",
                                text: "Data yang sudah dihapus mungkin tidak bisa dikembalikan lagi!",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Ya, Hapus Data!',
                                cancelButtonText: 'Batal!',
                                reverseButtons: true,
                                customClass:{
                                    popup:"!w-auto !bg-accent !rounded-2xl",
                                    title:"!text-lg",
                                    htmlContainer:"!text-sm",
                                    confirmButton:"focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2 me-2 mb-2",
                                    cancelButton:"py-2 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10"
                                },
                                buttonsStyling:false
                            })
                            .then(result=>{
                                if(result.isConfirmed){
                                    hapus_data.mutate(item.id)
                                }
                            })
                        }}
                    />
                )}
            />
        </>
    )
}