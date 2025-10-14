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
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, Filter, Plus, PlusIcon, Trash2 } from "lucide-react"
import { NumericFormat } from 'react-number-format'

import { toast } from "sonner"
import axios from "axios"
import { useEffect, useState } from "react"
import * as yup from "yup"
import { Formik } from 'formik'
import { ews_request, lahan_request, modbus_sensor_request, pengaturan_request, pupuk_request } from "@/config/request"
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


export default function Page(props) {

    const [form_input, setFormInput]=useState({
        modbus_url:"127.0.0.1",
        modbus_port:"502",
        urea_per_liter:"10",
        mkp_per_liter:"10"
    })

    useEffect(()=>{
        get_data.mutate({}, {
            onSuccess:data=>{
                setFormInput(data.data)
            }
        })
    }, [])

    //DATA/MUTATION
    const get_data=useMutation({
        mutationFn:()=>pengaturan_request.get(),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Process Data Failed! ", {position:"bottom-center"})
        }
    })
    const update_data=useMutation({
        mutationFn:params=>pengaturan_request.update(params),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Process Data Failed! ", {position:"bottom-center"})
        }
    })

    //VALUES
    

    //ACTIONS

    return (
        <>
            <Head>
                <title>Pengaturan</title>
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
                            <h1 className="text-base font-medium">Pengaturan</h1>
                        </div>
                    </header>
                    <div className="w-full lg:w-1/2 xl:w-1/3 mx-auto mt-5">
                        <Formik
                            initialValues={form_input}
                            onSubmit={(values, actions)=>{
                                const new_values=Object.assign({}, values, {
                                })
                                console.log(new_values)
                                update_data.mutate(new_values, {
                                    onSettled:data=>{
                                        actions.setSubmitting(false)
                                    }
                                })
                            }}
                            validationSchema={
                                yup.object().shape({
                                    modbus_url:yup.string().required(),
                                    modbus_port:yup.string().required(),
                                    urea_per_liter:yup.string().required(),
                                    mkp_per_liter:yup.string().required()
                                })
                            }
                            enableReinitialize
                        >
                            {formik=>(
                                <form className="grid gap-4 py-4 px-6" onSubmit={formik.handleSubmit}>
                                    <div className="grid grid-cols-5 items-center gap-4">
                                        <Label className="col-span-2">Modbus URL</Label>
                                        <Input
                                            placeholder="127.0.0.1"
                                            className="col-span-3"
                                            name="modbus_url"
                                            value={formik.values.modbus_url}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 items-center gap-4">
                                        <Label className="col-span-2">Modbus PORT</Label>
                                        <Input
                                            placeholder="502"
                                            className="col-span-3"
                                            name="modbus_port"
                                            value={formik.values.modbus_port}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 items-center gap-4">
                                        <Label className="col-span-2">Konsentrasi(Urea) per 1 liter</Label>
                                        <NumericFormat 
                                            value={formik.values.urea_per_liter} 
                                            onValueChange={(values)=>formik.setFieldValue("urea_per_liter", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 items-center gap-4">
                                        <Label className="col-span-2">Konsentrasi(MKP) per 1 liter</Label>
                                        <NumericFormat 
                                            value={formik.values.mkp_per_liter} 
                                            onValueChange={(values)=>formik.setFieldValue("mkp_per_liter", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 items-start gap-2 mt-5">
                                        <Label className="col-span-2"></Label>
                                        <Button 
                                            type="submit" 
                                            disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                            className="w-[150px]"
                                        >
                                            Update Pengaturan
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

